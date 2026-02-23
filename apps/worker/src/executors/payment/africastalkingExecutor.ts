import { parseTemplate } from "@repo/shared/parser";
import type { AfricasTalkingNodeData, NodeExecutionOutput } from "../../engine/types/index.js";
import { resolveCredential } from "../../engine/credentialResolver.js";
import type { ExecutionMode } from "../../engine/executor.js";

// ---------------------------------------------------------------------------
// Send SMS via Africa's Talking
// ---------------------------------------------------------------------------
async function sendSMS(params: {
    apiKey: string;
    username: string;
    to: string;
    message: string;
    from?: string;
}): Promise<NodeExecutionOutput> {
    const isLive = params.username.toLowerCase() !== "sandbox";
    const baseUrl = isLive
        ? "https://api.africastalking.com/version1/messaging"
        : "https://api.sandbox.africastalking.com/version1/messaging";

    const formBody: Record<string, string> = {
        username: params.username,
        to: params.to,
        message: params.message,
    };
    if (params.from) {
        formBody.from = params.from;
    }

    const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
            apiKey: params.apiKey,
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formBody).toString(),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Africa's Talking SMS failed (${response.status}): ${body}`);
    }

    const result = await response.json() as {
        SMSMessageData?: {
            Message?: string;
            Recipients?: Array<{
                number?: string;
                statusCode?: number;
                status?: string;
                messageId?: string;
                cost?: string;
            }>;
        };
    };

    const recipients = result.SMSMessageData?.Recipients ?? [];
    const allSent = recipients.every((r) => r.statusCode === 101);

    return {
        success: allSent,
        message: result.SMSMessageData?.Message ?? "SMS sent",
        recipients: recipients as unknown as NodeExecutionOutput,
        sentCount: recipients.filter((r) => r.statusCode === 101).length,
        totalRecipients: recipients.length,
    };
}

// ---------------------------------------------------------------------------
// Send Airtime via Africa's Talking
// ---------------------------------------------------------------------------
async function sendAirtime(params: {
    apiKey: string;
    username: string;
    to: string;
    amount: string;
    currencyCode?: string;
}): Promise<NodeExecutionOutput> {
    const isLive = params.username.toLowerCase() !== "sandbox";
    const baseUrl = isLive
        ? "https://api.africastalking.com/version1/airtime/send"
        : "https://api.sandbox.africastalking.com/version1/airtime/send";

    const currencyCode = params.currencyCode || "KES";
    const recipients = JSON.stringify([
        { phoneNumber: params.to, amount: `${currencyCode} ${params.amount}` },
    ]);

    const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
            apiKey: params.apiKey,
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            username: params.username,
            recipients,
        }).toString(),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Africa's Talking Airtime failed (${response.status}): ${body}`);
    }

    const result = await response.json() as {
        numSent?: number;
        totalAmount?: string;
        totalDiscount?: string;
        responses?: unknown[];
        errorMessage?: string;
    };

    if (result.errorMessage && result.errorMessage !== "None") {
        throw new Error(`Africa's Talking Airtime error: ${result.errorMessage}`);
    }

    return {
        success: true,
        numSent: result.numSent ?? 0,
        totalAmount: result.totalAmount ?? "",
        totalDiscount: result.totalDiscount ?? "",
        to: params.to,
        amount: params.amount,
    };
}

// ---------------------------------------------------------------------------
// Main executor
// ---------------------------------------------------------------------------
export async function executeAfricasTalkingNode(
    data: AfricasTalkingNodeData,
    _nodeRunId: string,
    runMetadata: Record<string, NodeExecutionOutput>,
    executionMode: ExecutionMode = "legacy",
    ownerUserId: string,
): Promise<NodeExecutionOutput> {
    const { operation = "send_sms", credentialId } = data;

    if (!credentialId?.trim()) {
        if (executionMode === "strict_template_v1") {
            throw new Error("Africa's Talking node not configured — no credential selected");
        }
        return { success: true, skipped: true, reason: "No Africa's Talking credential configured" };
    }

    const credential = await resolveCredential(credentialId.trim(), ownerUserId);
    if (credential.platform !== "africastalking") {
        throw new Error(`Credential is not an Africa's Talking credential (got ${credential.platform})`);
    }

    const { apiKey, username } = credential.keys;
    if (!apiKey || !username) {
        throw new Error("Africa's Talking credential is missing API Key or Username");
    }

    const resolve = (v?: string) =>
        v ? parseTemplate(v, runMetadata as Record<string, string>) : v ?? "";

    if (operation === "send_sms") {
        const to = resolve(data.to);
        const message = resolve(data.message);

        if (!to || !message) {
            if (executionMode === "strict_template_v1") {
                throw new Error("Africa's Talking SMS requires 'to' and 'message'");
            }
            return { success: true, skipped: true, reason: "'to' or 'message' not configured" };
        }

        return sendSMS({
            apiKey,
            username,
            to,
            message,
            ...(resolve(data.from) ? { from: resolve(data.from) } : {}),
        });
    }

    if (operation === "send_airtime") {
        const to = resolve(data.to);
        const amount = resolve(data.airtimeAmount);

        if (!to || !amount) {
            if (executionMode === "strict_template_v1") {
                throw new Error("Africa's Talking Airtime requires 'to' and 'airtimeAmount'");
            }
            return { success: true, skipped: true, reason: "'to' or 'airtimeAmount' not configured" };
        }

        return sendAirtime({ apiKey, username, to, amount });
    }

    throw new Error(`Unsupported Africa's Talking operation: ${String(operation)}`);
}
