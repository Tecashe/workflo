"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { ValidationMessage } from "../../shared";

interface WhatsAppConfigProps {
    data: Record<string, any>;
    onSave: (data: Record<string, any>) => void;
}

type WAMessageType = "text" | "template";

export function WhatsAppConfig({ data, onSave }: WhatsAppConfigProps) {
    const [label, setLabel] = useState(data.label || "WhatsApp");
    const [responseName, setResponseName] = useState(data.responseName || "waResult");
    const [credentialId, setCredentialId] = useState(data.credentialId || "");
    const [to, setTo] = useState(data.to || "");
    const [messageType, setMessageType] = useState<WAMessageType>(
        data.messageType === "template" ? "template" : "text"
    );
    const [message, setMessage] = useState(data.message || "");
    const [templateName, setTemplateName] = useState(data.templateName || "");
    const [templateLanguage, setTemplateLanguage] = useState(data.templateLanguage || "en");
    const [templateParams, setTemplateParams] = useState(data.templateParams || "");

    const credentialsQuery = trpc.credentials.getAll.useQuery(undefined, { refetchOnWindowFocus: false });
    const waCredentials = useMemo(
        () => (credentialsQuery.data ?? []).filter((c) => c.platform === "whatsapp"),
        [credentialsQuery.data]
    );

    const missingFields: string[] = [];
    if (!label.trim()) missingFields.push("Node Label");
    if (!responseName.trim()) missingFields.push("Response Name");
    if (!credentialId) missingFields.push("WhatsApp Credential");
    if (!to.trim()) missingFields.push("Recipient Phone");
    if (messageType === "text" && !message.trim()) missingFields.push("Message");
    if (messageType === "template" && !templateName.trim()) missingFields.push("Template Name");

    // Validate templateParams JSON if provided
    let paramsValid = true;
    if (templateParams.trim()) {
        try { JSON.parse(templateParams); } catch { paramsValid = false; }
    }
    if (!paramsValid) missingFields.push("Template Parameters (invalid JSON)");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ label, responseName, credentialId, to, messageType, message, templateName, templateLanguage, templateParams });
    };

    const inputCls = "bg-[#2D2D2E] border-[#444] text-white placeholder:text-white/30";
    const selectCls = "w-full h-9 rounded-md border border-[#444] bg-[#2D2D2E] px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-ring";
    const hintCls = "text-xs text-white/40";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label className="text-white/80">Node Label</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="WhatsApp" className={inputCls} />
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Response Name</Label>
                <Input value={responseName} onChange={(e) => setResponseName(e.target.value)} placeholder="waResult" className={inputCls} />
                <p className={hintCls}>Use {`{${responseName}.messageId}`} in downstream nodes.</p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">WhatsApp Credential</Label>
                <select value={credentialId} onChange={(e) => setCredentialId(e.target.value)} className={selectCls}>
                    <option value="">Select a credential</option>
                    {waCredentials.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                </select>
                <p className={hintCls}>
                    No credentials?{" "}
                    <a href="/home/credentials" className="text-[#F04D26] hover:text-[#F04D26]/90 underline">
                        Add WhatsApp Business credentials
                    </a>
                </p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Recipient Phone</Label>
                <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="254712345678 or {trigger.phone}"
                    className={inputCls}
                />
                <p className={hintCls}>International format without +. Supports template variables.</p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Message Type</Label>
                <select value={messageType} onChange={(e) => setMessageType(e.target.value as WAMessageType)} className={selectCls}>
                    <option value="text">Text Message</option>
                    <option value="template">Template Message</option>
                </select>
            </div>

            {messageType === "text" && (
                <div className="space-y-2">
                    <Label className="text-white/80">Message</Label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="✅ Payment of KES {mpesaResult.amount} received. Thank you!"
                        rows={4}
                        className="w-full rounded-md border border-[#444] bg-[#2D2D2E] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                    <p className={hintCls}>Supports {`{template}`} variables and emoji. Max 4096 characters.</p>
                </div>
            )}

            {messageType === "template" && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-white/80">Template Name</Label>
                            <Input
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="payment_confirmation"
                                className={inputCls}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/80">Language Code</Label>
                            <Input
                                value={templateLanguage}
                                onChange={(e) => setTemplateLanguage(e.target.value)}
                                placeholder="en"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/80 flex items-center gap-1">
                            Template Parameters <span className="text-white/30 text-xs">(optional)</span>
                        </Label>
                        <textarea
                            value={templateParams}
                            onChange={(e) => setTemplateParams(e.target.value)}
                            placeholder={`["{mpesaResult.amount}", "{trigger.name}"]`}
                            rows={3}
                            className={`w-full rounded-md border ${!paramsValid && templateParams.trim() ? "border-red-500/60" : "border-[#444]"} bg-[#2D2D2E] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-ring resize-none font-mono`}
                        />
                        <p className={`${!paramsValid && templateParams.trim() ? "text-red-400" : hintCls}`}>
                            {!paramsValid && templateParams.trim()
                                ? "Invalid JSON — must be an array, e.g. [\"value1\", \"value2\"]"
                                : "JSON array of string values for template {{1}}, {{2}}... placeholders."}
                        </p>
                    </div>
                </>
            )}

            <ValidationMessage missingFields={missingFields} />

            <Button
                type="submit"
                disabled={missingFields.length > 0}
                className="w-full bg-[#F04D26] hover:bg-[#e04420] text-white disabled:bg-[#F04D26]/50 disabled:text-white/70"
            >
                Save
            </Button>
        </form>
    );
}
