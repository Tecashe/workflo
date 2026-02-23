import { parseTemplate } from "@repo/shared/parser";
import type { WhatsAppNodeData, NodeExecutionOutput } from "../../engine/types/index.js";
import { resolveCredential } from "../../engine/credentialResolver.js";
import type { ExecutionMode } from "../../engine/executor.js";

const META_GRAPH_API_VERSION = "v20.0";

// ---------------------------------------------------------------------------
// Send text message
// ---------------------------------------------------------------------------
async function sendTextMessage(params: {
    accessToken: string;
    phoneNumberId: string;
    to: string;
    message: string;
}): Promise<NodeExecutionOutput> {
    const url = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(params.phoneNumberId)}/messages`;

    const body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: params.to,
        type: "text",
        text: { preview_url: false, body: params.message },
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${params.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: response.statusText } })) as {
            error?: { message?: string };
        };
        throw new Error(
            `WhatsApp API error (${response.status}): ${err.error?.message ?? response.statusText}`,
        );
    }

    const result = await response.json() as {
        messages?: Array<{ id: string }>;
        contacts?: Array<{ input: string; wa_id: string }>;
    };

    return {
        success: true,
        messageId: result.messages?.[0]?.id ?? "",
        to: params.to,
        waId: result.contacts?.[0]?.wa_id ?? "",
    };
}

// ---------------------------------------------------------------------------
// Send template message
// ---------------------------------------------------------------------------
async function sendTemplateMessage(params: {
    accessToken: string;
    phoneNumberId: string;
    to: string;
    templateName: string;
    languageCode: string;
    components: unknown[];
}): Promise<NodeExecutionOutput> {
    const url = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(params.phoneNumberId)}/messages`;

    const body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: params.to,
        type: "template",
        template: {
            name: params.templateName,
            language: { code: params.languageCode || "en" },
            ...(params.components.length > 0 ? { components: params.components } : {}),
        },
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${params.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: response.statusText } })) as {
            error?: { message?: string };
        };
        throw new Error(
            `WhatsApp template error (${response.status}): ${err.error?.message ?? response.statusText}`,
        );
    }

    const result = await response.json() as {
        messages?: Array<{ id: string }>;
        contacts?: Array<{ input: string; wa_id: string }>;
    };

    return {
        success: true,
        messageId: result.messages?.[0]?.id ?? "",
        to: params.to,
        waId: result.contacts?.[0]?.wa_id ?? "",
        templateName: params.templateName,
    };
}

// ---------------------------------------------------------------------------
// Main executor
// ---------------------------------------------------------------------------
export async function executeWhatsAppNode(
    data: WhatsAppNodeData,
    _nodeRunId: string,
    runMetadata: Record<string, NodeExecutionOutput>,
    executionMode: ExecutionMode = "legacy",
    ownerUserId: string,
): Promise<NodeExecutionOutput> {
    const { messageType = "text", credentialId } = data;

    if (!credentialId?.trim()) {
        if (executionMode === "strict_template_v1") {
            throw new Error("WhatsApp node not configured — no credential selected");
        }
        return { success: true, skipped: true, reason: "No WhatsApp credential configured" };
    }

    const credential = await resolveCredential(credentialId.trim(), ownerUserId);
    if (credential.platform !== "whatsapp") {
        throw new Error(`Credential is not a WhatsApp credential (got ${credential.platform})`);
    }

    const { accessToken, phoneNumberId } = credential.keys;
    if (!accessToken || !phoneNumberId) {
        throw new Error("WhatsApp credential is missing Access Token or Phone Number ID");
    }

    const resolve = (v?: string) =>
        v ? parseTemplate(v, runMetadata as Record<string, string>) : v ?? "";

    const to = resolve(data.to)
        .trim()
        .replace(/^\+/, "")          // Remove leading +
        .replace(/[^0-9]/g, "");     // Strip non-digits

    if (!to) {
        if (executionMode === "strict_template_v1") {
            throw new Error("WhatsApp node requires a recipient phone number");
        }
        return { success: true, skipped: true, reason: "Recipient phone number not configured" };
    }

    if (messageType === "text") {
        const message = resolve(data.message);
        if (!message) {
            if (executionMode === "strict_template_v1") {
                throw new Error("WhatsApp text node requires a message");
            }
            return { success: true, skipped: true, reason: "Message not configured" };
        }
        return sendTextMessage({ accessToken, phoneNumberId, to, message });
    }

    if (messageType === "template") {
        const templateName = resolve(data.templateName);
        if (!templateName) {
            if (executionMode === "strict_template_v1") {
                throw new Error("WhatsApp template node requires a template name");
            }
            return { success: true, skipped: true, reason: "Template name not configured" };
        }

        let components: unknown[] = [];
        const rawParams = resolve(data.templateParams);
        if (rawParams) {
            try {
                const parsed = JSON.parse(rawParams);
                if (Array.isArray(parsed)) {
                    // Support two input formats:
                    // 1. Simple array of strings ["value1","value2"] → body component params
                    // 2. Pre-formatted components array (pass through as-is)
                    if (parsed.length > 0 && typeof parsed[0] === "string") {
                        components = [{
                            type: "body",
                            parameters: parsed.map((v: string) => ({ type: "text", text: v })),
                        }];
                    } else {
                        components = parsed;
                    }
                }
            } catch {
                throw new Error(`WhatsApp templateParams must be a valid JSON array. Got: ${rawParams.slice(0, 100)}`);
            }
        }

        return sendTemplateMessage({
            accessToken,
            phoneNumberId,
            to,
            templateName,
            languageCode: resolve(data.templateLanguage) || "en",
            components,
        });
    }

    throw new Error(`Unsupported WhatsApp message type: ${String(messageType)}`);
}
