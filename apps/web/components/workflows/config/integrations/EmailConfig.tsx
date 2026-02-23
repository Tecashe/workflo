"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { ValidationMessage } from "../../shared";
import { Mail, Code2, Type } from "lucide-react";

interface EmailConfigProps {
    data: Record<string, any>;
    onSave: (data: Record<string, any>) => void;
}

export function EmailConfig({ data, onSave }: EmailConfigProps) {
    const [label, setLabel] = useState(data.label || "Send Email");
    const [responseName, setResponseName] = useState(data.responseName || "emailResult");
    const [credentialId, setCredentialId] = useState(data.credentialId || "");
    const [to, setTo] = useState(data.to || "");
    const [subject, setSubject] = useState(data.subject || "");
    const [body, setBody] = useState(data.body || "");
    const [isHtml, setIsHtml] = useState<boolean>(data.isHtml ?? false);
    const [fromName, setFromName] = useState(data.fromName || "");
    const [replyTo, setReplyTo] = useState(data.replyTo || "");

    const credentialsQuery = trpc.credentials.getAll.useQuery(undefined, { refetchOnWindowFocus: false });
    const resendCredentials = useMemo(
        () => (credentialsQuery.data ?? []).filter((c) => c.platform === "resend"),
        [credentialsQuery.data]
    );

    const missingFields: string[] = [];
    if (!label.trim()) missingFields.push("Node Label");
    if (!responseName.trim()) missingFields.push("Response Name");
    if (!to.trim()) missingFields.push("To address");
    if (!subject.trim()) missingFields.push("Subject");
    if (!body.trim()) missingFields.push("Body");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (missingFields.length > 0) return;
        onSave({ label, responseName, credentialId: credentialId || undefined, to, subject, body, isHtml, fromName, replyTo });
    };

    const inputCls = "bg-[#2D2D2E] border-[#444] text-white placeholder:text-white/30";
    const selectCls = "w-full h-9 rounded-md border border-[#444] bg-[#2D2D2E] px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-ring";
    const hintCls = "text-xs text-white/40";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label className="text-white/80">Node Label</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Send Email" className={inputCls} />
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Response Name</Label>
                <Input value={responseName} onChange={(e) => setResponseName(e.target.value)} placeholder="emailResult" className={inputCls} />
                <p className={hintCls}>Access email ID as: {`{${responseName}.emailId}`}</p>
            </div>

            {/* Only show credential selector if user has resend credentials saved */}
            {resendCredentials.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-white/80">Resend Credential <span className="text-white/30">(optional)</span></Label>
                    <select value={credentialId} onChange={(e) => setCredentialId(e.target.value)} className={selectCls}>
                        <option value="">Use platform default (RESEND_API_KEY)</option>
                        {resendCredentials.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="space-y-2">
                <Label className="text-white/80">To</Label>
                <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="{trigger.email} or customer@example.com" className={inputCls} />
                <p className={hintCls}>Separate multiple addresses with commas. Supports template variables.</p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your receipt for {mpesaResult.amount} KES" className={inputCls} />
            </div>

            {/* Body format toggle */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-white/80">Body</Label>
                    <div className="flex items-center gap-1 bg-[#1a1a1b] rounded-md p-0.5 border border-[#333]">
                        <button
                            type="button"
                            onClick={() => setIsHtml(false)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${!isHtml ? "bg-[#2D2D2E] text-white" : "text-white/40 hover:text-white/60"}`}
                        >
                            <Type className="h-3 w-3" /> Plain Text
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsHtml(true)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${isHtml ? "bg-[#2D2D2E] text-white" : "text-white/40 hover:text-white/60"}`}
                        >
                            <Code2 className="h-3 w-3" /> HTML
                        </button>
                    </div>
                </div>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    placeholder={isHtml
                        ? "<p>Hi {trigger.name},</p><p>Your payment of <strong>{mpesaResult.amount} KES</strong> was received.</p>"
                        : "Hi {trigger.name},\n\nYour payment of {mpesaResult.amount} KES was received.\n\nReceipt: {etrResult.receiptNumber}"}
                    className={`w-full rounded-md border px-3 py-2 text-sm font-${isHtml ? "mono" : "sans"} resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-[#2D2D2E] border-[#444] text-white placeholder:text-white/30`}
                />
                <p className={hintCls}>Use {"{variableName.field}"} to insert data from previous nodes.</p>
            </div>

            {/* Optional sender name */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs">From Name <span className="text-white/30">(optional)</span></Label>
                    <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="My Business" className={inputCls} />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs">Reply-To <span className="text-white/30">(optional)</span></Label>
                    <Input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="support@example.com" className={inputCls} />
                </div>
            </div>

            <ValidationMessage missingFields={missingFields} />

            <Button
                type="submit"
                disabled={missingFields.length > 0}
                className="w-full bg-[#F04D26] hover:bg-[#e04420] text-white disabled:bg-[#F04D26]/50 disabled:text-white/70"
            >
                <Mail className="h-4 w-4 mr-2" />
                Save
            </Button>
        </form>
    );
}
