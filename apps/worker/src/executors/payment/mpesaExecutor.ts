import { parseTemplate } from "@repo/shared/parser";
import type { MpesaNodeData, NodeExecutionOutput } from "../../engine/types/index.js";
import { resolveCredential } from "../../engine/credentialResolver.js";
import type { ExecutionMode } from "../../engine/executor.js";

// ---------------------------------------------------------------------------
// In-memory token cache (per process) – avoids re-fetching on every execution
// ---------------------------------------------------------------------------
interface TokenCache {
    token: string;
    expiresAt: number;
}
const tokenCache = new Map<string, TokenCache>();

function getCachedToken(consumerKey: string): string | null {
    const entry = tokenCache.get(consumerKey);
    if (entry && Date.now() < entry.expiresAt) return entry.token;
    tokenCache.delete(consumerKey);
    return null;
}

function setCachedToken(consumerKey: string, token: string, expiresInSeconds: number) {
    tokenCache.set(consumerKey, {
        token,
        expiresAt: Date.now() + (expiresInSeconds - 30) * 1000, // 30s safety margin
    });
}

// ---------------------------------------------------------------------------
// OAuth2 bearer token from Daraja
// ---------------------------------------------------------------------------
async function getAccessToken(
    consumerKey: string,
    consumerSecret: string,
    sandbox: boolean,
): Promise<string> {
    const cached = getCachedToken(consumerKey);
    if (cached) return cached;

    const base = sandbox
        ? "https://sandbox.safaricom.co.ke"
        : "https://api.safaricom.co.ke";

    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const response = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
        method: "GET",
        headers: { Authorization: `Basic ${credentials}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`M-Pesa OAuth failed (${response.status}): ${body}`);
    }

    const result = await response.json() as { access_token?: string; expires_in?: string };
    const token = result.access_token;
    if (!token) throw new Error("M-Pesa OAuth returned no access_token");

    const expiresIn = parseInt(result.expires_in ?? "3600", 10);
    setCachedToken(consumerKey, token, expiresIn);
    return token;
}

// ---------------------------------------------------------------------------
// STK Push (Lipa na M-Pesa Online)
// ---------------------------------------------------------------------------
async function stkPush(params: {
    accessToken: string;
    shortCode: string;
    passkey: string;
    phoneNumber: string;
    amount: string;
    accountReference: string;
    transactionDesc: string;
    callbackUrl: string;
    sandbox: boolean;
}): Promise<NodeExecutionOutput> {
    const base = params.sandbox
        ? "https://sandbox.safaricom.co.ke"
        : "https://api.safaricom.co.ke";

    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);

    const password = Buffer.from(
        `${params.shortCode}${params.passkey}${timestamp}`,
    ).toString("base64");

    // Normalize phone: strip leading 0 or + and ensure 254 prefix
    const phone = params.phoneNumber.trim().replace(/^\+/, "").replace(/^0/, "254");

    const body = {
        BusinessShortCode: params.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(Number(params.amount)),
        PartyA: phone,
        PartyB: params.shortCode,
        PhoneNumber: phone,
        CallBackURL: params.callbackUrl,
        AccountReference: params.accountReference || "Fynt Payment",
        TransactionDesc: params.transactionDesc || "Payment",
    };

    const response = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${params.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const result = await response.json() as Record<string, unknown>;
    if (!response.ok || result["ResponseCode"] !== "0") {
        throw new Error(
            `M-Pesa STK Push failed: ${result["errorMessage"] ?? result["ResponseDescription"] ?? response.statusText}`,
        );
    }

    return {
        success: true,
        checkoutRequestId: result["CheckoutRequestID"] as string,
        merchantRequestId: result["MerchantRequestID"] as string,
        responseDescription: result["ResponseDescription"] as string,
        customerMessage: result["CustomerMessage"] as string,
        phoneNumber: phone,
        amount: params.amount,
    };
}

// ---------------------------------------------------------------------------
// STK Push Query (Check Transaction Status)
// ---------------------------------------------------------------------------
async function checkStkStatus(params: {
    accessToken: string;
    shortCode: string;
    passkey: string;
    checkoutRequestId: string;
    sandbox: boolean;
}): Promise<NodeExecutionOutput> {
    const base = params.sandbox
        ? "https://sandbox.safaricom.co.ke"
        : "https://api.safaricom.co.ke";

    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);

    const password = Buffer.from(
        `${params.shortCode}${params.passkey}${timestamp}`,
    ).toString("base64");

    const body = {
        BusinessShortCode: params.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: params.checkoutRequestId,
    };

    const response = await fetch(`${base}/mpesa/stkpushquery/v1/query`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${params.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const result = await response.json() as Record<string, unknown>;
    return {
        success: result["ResultCode"] === "0" || result["ResultCode"] === 0,
        resultCode: result["ResultCode"] as string,
        resultDesc: result["ResultDesc"] as string,
        checkoutRequestId: params.checkoutRequestId,
    };
}

// ---------------------------------------------------------------------------
// B2C Payment (Business to Customer)
// ---------------------------------------------------------------------------
async function b2cPayment(params: {
    accessToken: string;
    shortCode: string;
    initiatorName: string;
    securityCredential: string;
    phoneNumber: string;
    amount: string;
    commandId: string;
    remarks: string;
    queueTimeoutUrl: string;
    resultUrl: string;
    sandbox: boolean;
}): Promise<NodeExecutionOutput> {
    const base = params.sandbox
        ? "https://sandbox.safaricom.co.ke"
        : "https://api.safaricom.co.ke";

    const phone = params.phoneNumber.trim().replace(/^\+/, "").replace(/^0/, "254");

    const body = {
        InitiatorName: params.initiatorName,
        SecurityCredential: params.securityCredential,
        CommandID: params.commandId || "BusinessPayment",
        Amount: Math.round(Number(params.amount)),
        PartyA: params.shortCode,
        PartyB: phone,
        Remarks: params.remarks || "Payment",
        QueueTimeOutURL: params.queueTimeoutUrl,
        ResultURL: params.resultUrl,
        Occassion: "",
    };

    const response = await fetch(`${base}/mpesa/b2c/v1/paymentrequest`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${params.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const result = await response.json() as Record<string, unknown>;
    if (!response.ok) {
        throw new Error(
            `M-Pesa B2C failed: ${result["errorMessage"] ?? response.statusText}`,
        );
    }

    return {
        success: true,
        conversationId: result["ConversationID"] as string,
        originatorConversationId: result["OriginatorConversationID"] as string,
        responseDescription: result["ResponseDescription"] as string,
        phoneNumber: phone,
        amount: params.amount,
    };
}

// ---------------------------------------------------------------------------
// Main executor
// ---------------------------------------------------------------------------
export async function executeMpesaNode(
    data: MpesaNodeData,
    _nodeRunId: string,
    runMetadata: Record<string, NodeExecutionOutput>,
    executionMode: ExecutionMode = "legacy",
    ownerUserId: string,
): Promise<NodeExecutionOutput> {
    const { operation = "stk_push", credentialId } = data;

    if (!credentialId?.trim()) {
        if (executionMode === "strict_template_v1") {
            throw new Error("M-Pesa node not configured — no credential selected");
        }
        return { success: true, skipped: true, reason: "No M-Pesa credential configured" };
    }

    // Resolve credential from vault
    const credential = await resolveCredential(credentialId.trim(), ownerUserId);
    if (credential.platform !== "mpesa") {
        throw new Error(`Credential is not an M-Pesa credential (got ${credential.platform})`);
    }

    const {
        consumerKey,
        consumerSecret,
        shortCode,
        passkey,
        callbackUrl,
        sandbox: sandboxStr,
        initiatorName,
        securityCredential,
        queueTimeoutUrl,
        resultUrl,
    } = credential.keys;

    const isSandbox = sandboxStr !== "false";

    if (!consumerKey || !consumerSecret) {
        throw new Error("M-Pesa credential is missing Consumer Key or Consumer Secret");
    }

    // Obtain access token
    const accessToken = await getAccessToken(consumerKey, consumerSecret, isSandbox);

    // Template-resolve configurable fields
    const resolve = (v?: string) =>
        v ? parseTemplate(v, runMetadata as Record<string, string>) : v ?? "";

    if (operation === "stk_push") {
        const phoneNumber = resolve(data.phoneNumber);
        const amount = resolve(data.amount);
        if (!phoneNumber || !amount) {
            if (executionMode === "strict_template_v1") {
                throw new Error("M-Pesa STK Push requires phoneNumber and amount");
            }
            return { success: true, skipped: true, reason: "phoneNumber or amount not configured" };
        }
        return stkPush({
            accessToken,
            shortCode: shortCode ?? "",
            passkey: passkey ?? "",
            phoneNumber,
            amount,
            accountReference: resolve(data.accountReference),
            transactionDesc: resolve(data.transactionDesc),
            callbackUrl: callbackUrl ?? "https://example.com/mpesa/callback",
            sandbox: isSandbox,
        });
    }

    if (operation === "check_status") {
        const checkoutRequestId = resolve(data.checkoutRequestId);
        if (!checkoutRequestId) {
            if (executionMode === "strict_template_v1") {
                throw new Error("M-Pesa Check Status requires checkoutRequestId");
            }
            return { success: true, skipped: true, reason: "checkoutRequestId not configured" };
        }
        return checkStkStatus({
            accessToken,
            shortCode: shortCode ?? "",
            passkey: passkey ?? "",
            checkoutRequestId,
            sandbox: isSandbox,
        });
    }

    if (operation === "b2c") {
        const phoneNumber = resolve(data.phoneNumber);
        const amount = resolve(data.amount);
        if (!phoneNumber || !amount) {
            if (executionMode === "strict_template_v1") {
                throw new Error("M-Pesa B2C requires phoneNumber and amount");
            }
            return { success: true, skipped: true, reason: "phoneNumber or amount not configured" };
        }
        return b2cPayment({
            accessToken,
            shortCode: shortCode ?? "",
            initiatorName: initiatorName ?? "",
            securityCredential: securityCredential ?? "",
            phoneNumber,
            amount,
            commandId: resolve(data.commandId) || "BusinessPayment",
            remarks: resolve(data.remarks) || "Payment via Fynt",
            queueTimeoutUrl: queueTimeoutUrl ?? "https://example.com/mpesa/timeout",
            resultUrl: resultUrl ?? "https://example.com/mpesa/result",
            sandbox: isSandbox,
        });
    }

    throw new Error(`Unsupported M-Pesa operation: ${String(operation)}`);
}
