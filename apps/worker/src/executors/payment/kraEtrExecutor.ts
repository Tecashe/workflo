import type { MpesaNodeData, NodeExecutionOutput } from "../../engine/types/index.js";
import type { ExecutionMode } from "../../engine/executor.js";
import { resolveCredential } from "../../engine/credentialResolver.js";
import { parseTemplate } from "@repo/shared/parser";

// ---------------------------------------------------------------------------
// KRA iTax / ETR API — issue an electronic tax receipt
// Note: Integrate with a certified ETR middleware (Pesalink, Taxtech, etc.)
// that exposes a REST API compatible with what is implemented here.
// ---------------------------------------------------------------------------

interface ETRReceiptRequest {
    apiKey: string;
    tillNumber: string;
    deviceSerial: string;
    invoiceNumber: string;
    totalAmount: number;
    taxableAmount: number;
    vatAmount: number;
    buyerPin?: string;
    buyerName?: string;
    buyerPhone?: string;
    items: Array<{ description: string; quantity: number; unitPrice: number; totalPrice: number }>;
    apiUrl: string;
}

interface ETRReceiptResponse {
    success: boolean;
    receiptNumber: string;
    qrCodeUrl: string;
    verificationUrl: string;
    issuedAt: string;
}

async function issueETRReceipt(params: ETRReceiptRequest): Promise<NodeExecutionOutput> {
    const response = await fetch(`${params.apiUrl}/etr/receipt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": params.apiKey,
            "X-Device-Serial": params.deviceSerial,
        },
        body: JSON.stringify({
            tillNumber: params.tillNumber,
            invoiceNumber: params.invoiceNumber,
            totalAmount: params.totalAmount,
            taxableAmount: params.taxableAmount,
            vatAmount: params.vatAmount,
            vatRate: 16,
            buyerDetails: params.buyerPin
                ? { pin: params.buyerPin, name: params.buyerName, phone: params.buyerPhone }
                : undefined,
            items: params.items,
            currency: "KES",
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`KRA ETR API error (${response.status}): ${body}`);
    }

    const result = await response.json() as ETRReceiptResponse;

    if (!result.success) {
        throw new Error(`ETR receipt issuance failed: ${result.receiptNumber || "Unknown error"}`);
    }

    return {
        success: true,
        receiptNumber: result.receiptNumber,
        qrCodeUrl: result.qrCodeUrl,
        verificationUrl: result.verificationUrl,
        issuedAt: result.issuedAt,
        invoiceNumber: params.invoiceNumber,
        totalAmount: params.totalAmount,
        vatAmount: params.vatAmount,
    };
}

// ---------------------------------------------------------------------------
// KRA ETR Node Data interface (matches node-types.ts)
// ---------------------------------------------------------------------------
export interface KraEtrNodeData {
    credentialId?: string;
    operation?: "issue_receipt";
    invoiceNumber?: string;
    totalAmount?: string;
    taxableAmount?: string;
    vatAmount?: string;
    buyerPin?: string;
    buyerName?: string;
    buyerPhone?: string;
    itemsJson?: string;
    responseName?: string;
}

export async function executeKraEtrNode(
    data: KraEtrNodeData,
    _nodeRunId: string,
    runMetadata: Record<string, NodeExecutionOutput>,
    executionMode: ExecutionMode = "legacy",
    ownerUserId: string,
): Promise<NodeExecutionOutput> {
    const { credentialId } = data;

    if (!credentialId?.trim()) {
        if (executionMode === "strict_template_v1") {
            throw new Error("KRA ETR node not configured — no credential selected");
        }
        return { success: true, skipped: true, reason: "No KRA ETR credential configured" };
    }

    const credential = await resolveCredential(credentialId.trim(), ownerUserId);
    if (credential.platform !== "kraETR") {
        throw new Error(`Credential is not a KRA ETR credential (got ${credential.platform})`);
    }

    const { apiKey, tillNumber, deviceSerial, apiUrl } = credential.keys;
    if (!apiKey || !tillNumber || !deviceSerial || !apiUrl) {
        throw new Error("KRA ETR credential is missing required fields (apiKey, tillNumber, deviceSerial, apiUrl)");
    }

    const resolve = (v?: string) =>
        v ? parseTemplate(v, runMetadata as Record<string, string>) : v ?? "";

    const invoiceNumber = resolve(data.invoiceNumber) || `INV-${Date.now()}`;
    const totalAmountStr = resolve(data.totalAmount);
    const taxableAmountStr = resolve(data.taxableAmount);
    const vatAmountStr = resolve(data.vatAmount);

    if (!totalAmountStr) {
        if (executionMode === "strict_template_v1") {
            throw new Error("KRA ETR node requires totalAmount");
        }
        return { success: true, skipped: true, reason: "totalAmount not configured" };
    }

    const totalAmount = parseFloat(totalAmountStr);
    const taxableAmount = taxableAmountStr ? parseFloat(taxableAmountStr) : totalAmount / 1.16;
    const vatAmount = vatAmountStr ? parseFloat(vatAmountStr) : totalAmount - taxableAmount;

    // Parse items from JSON or create a single line item
    let items: Array<{ description: string; quantity: number; unitPrice: number; totalPrice: number }> = [];
    const rawItems = resolve(data.itemsJson);
    if (rawItems) {
        try {
            items = JSON.parse(rawItems);
        } catch {
            throw new Error(`KRA ETR itemsJson must be a valid JSON array. Got: ${rawItems.slice(0, 100)}`);
        }
    } else {
        items = [{ description: "Services", quantity: 1, unitPrice: taxableAmount, totalPrice: taxableAmount }];
    }

    return issueETRReceipt({
        apiKey,
        tillNumber,
        deviceSerial,
        invoiceNumber,
        totalAmount,
        taxableAmount,
        vatAmount,
        buyerPin: resolve(data.buyerPin) || undefined,
        buyerName: resolve(data.buyerName) || undefined,
        buyerPhone: resolve(data.buyerPhone) || undefined,
        items,
        apiUrl,
    });
}
