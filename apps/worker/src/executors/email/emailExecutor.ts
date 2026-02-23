import type { NodeExecutionOutput } from "../../engine/types/index.js";
import type { ExecutionMode } from "../../engine/executor.js";

// Email node data — matches what EmailConfig.tsx saves
export interface EmailNodeData {
    credentialId?: string;
    to?: string;
    subject?: string;
    body?: string;
    isHtml?: boolean;
    fromName?: string;
    replyTo?: string;
    responseName?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_DEFAULT = process.env.EMAIL_FROM || "noreply@fynt.app";

export async function executeEmailNode(
    data: EmailNodeData,
    _nodeRunId: string,
    runMetadata: Record<string, NodeExecutionOutput>,
    executionMode: ExecutionMode = "legacy",
    _ownerUserId: string,
): Promise<NodeExecutionOutput> {
    // Use either a credential-stored API key OR the global RESEND_API_KEY env var
    let apiKey = process.env.RESEND_API_KEY;

    if (data.credentialId?.trim()) {
        // Dynamic import to avoid circular — credentialResolver is in engine
        const { resolveCredential } = await import("../../engine/credentialResolver.js");
        const credential = await resolveCredential(data.credentialId.trim(), _ownerUserId);
        if (credential.keys?.apiKey) {
            apiKey = credential.keys.apiKey;
        }
    }

    if (!apiKey) {
        if (executionMode === "strict_template_v1") {
            throw new Error("Email node: No RESEND_API_KEY configured and no Resend credential selected.");
        }
        return { success: true, skipped: true, reason: "Email not configured — add RESEND_API_KEY or a Resend credential" };
    }

    // Resolve template variables in all fields
    const { parseTemplate } = await import("@repo/shared/parser");
    const ctx = runMetadata as Record<string, string>;
    const resolve = (v?: string) => (v ? parseTemplate(v, ctx) : "");

    const to = resolve(data.to);
    const subject = resolve(data.subject);
    const body = resolve(data.body);

    if (!to || !subject || !body) {
        if (executionMode === "strict_template_v1") {
            throw new Error(`Email node: Missing required fields — ${[!to && "to", !subject && "subject", !body && "body"].filter(Boolean).join(", ")}`);
        }
        return { success: true, skipped: true, reason: "Email requires to, subject, and body" };
    }

    const fromName = resolve(data.fromName) || "Floe";
    const from = `${fromName} <${FROM_DEFAULT}>`;

    const payload: Record<string, unknown> = {
        from,
        to: to.includes(",") ? to.split(",").map((s) => s.trim()) : to,
        subject,
        ...(data.isHtml ? { html: body } : { text: body }),
    };

    if (data.replyTo?.trim()) {
        payload.reply_to = resolve(data.replyTo);
    }

    const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const result = await response.json() as Record<string, unknown>;

    if (!response.ok) {
        throw new Error(`Email send failed (${response.status}): ${result["message"] ?? JSON.stringify(result)}`);
    }

    return {
        success: true,
        emailId: result["id"] as string,
        to,
        subject,
        sentAt: new Date().toISOString(),
    };
}
