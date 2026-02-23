"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { ValidationMessage } from "../../shared";

interface AfricasTalkingConfigProps {
    data: Record<string, any>;
    onSave: (data: Record<string, any>) => void;
}

type ATOperation = "send_sms" | "send_airtime";

export function AfricasTalkingConfig({ data, onSave }: AfricasTalkingConfigProps) {
    const [label, setLabel] = useState(data.label || "Africa's Talking");
    const [responseName, setResponseName] = useState(data.responseName || "atResult");
    const [credentialId, setCredentialId] = useState(data.credentialId || "");
    const [operation, setOperation] = useState<ATOperation>(
        data.operation === "send_airtime" ? "send_airtime" : "send_sms"
    );
    const [to, setTo] = useState(data.to || "");
    const [message, setMessage] = useState(data.message || "");
    const [from, setFrom] = useState(data.from || "");
    const [airtimeAmount, setAirtimeAmount] = useState(data.airtimeAmount || "");

    const credentialsQuery = trpc.credentials.getAll.useQuery(undefined, { refetchOnWindowFocus: false });
    const atCredentials = useMemo(
        () => (credentialsQuery.data ?? []).filter((c) => c.platform === "africastalking"),
        [credentialsQuery.data]
    );

    const missingFields: string[] = [];
    if (!label.trim()) missingFields.push("Node Label");
    if (!responseName.trim()) missingFields.push("Response Name");
    if (!credentialId) missingFields.push("Africa's Talking Credential");
    if (!to.trim()) missingFields.push("To (Recipients)");
    if (operation === "send_sms" && !message.trim()) missingFields.push("Message");
    if (operation === "send_airtime" && !airtimeAmount.trim()) missingFields.push("Airtime Amount");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ label, responseName, credentialId, operation, to, message, from, airtimeAmount });
    };

    const inputCls = "bg-[#2D2D2E] border-[#444] text-white placeholder:text-white/30";
    const selectCls = "w-full h-9 rounded-md border border-[#444] bg-[#2D2D2E] px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-ring";
    const hintCls = "text-xs text-white/40";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label className="text-white/80">Node Label</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Africa's Talking" className={inputCls} />
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Response Name</Label>
                <Input value={responseName} onChange={(e) => setResponseName(e.target.value)} placeholder="atResult" className={inputCls} />
                <p className={hintCls}>Use {`{${responseName}.sentCount}`} in downstream nodes.</p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Credential</Label>
                <select value={credentialId} onChange={(e) => setCredentialId(e.target.value)} className={selectCls}>
                    <option value="">Select a credential</option>
                    {atCredentials.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                </select>
                <p className={hintCls}>
                    No credentials?{" "}
                    <a href="/home/credentials" className="text-[#F04D26] hover:text-[#F04D26]/90 underline">
                        Add Africa's Talking credentials
                    </a>
                </p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Operation</Label>
                <select value={operation} onChange={(e) => setOperation(e.target.value as ATOperation)} className={selectCls}>
                    <option value="send_sms">Send SMS</option>
                    <option value="send_airtime">Send Airtime</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">To (Recipients)</Label>
                <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="+254712345678 or {trigger.phone}"
                    className={inputCls}
                />
                <p className={hintCls}>Comma-separate multiple numbers: +254712...,+254723... Supports template variables.</p>
            </div>

            {operation === "send_sms" && (
                <>
                    <div className="space-y-2">
                        <Label className="text-white/80">Message</Label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Hello {trigger.name}, your order is confirmed!"
                            rows={4}
                            className="w-full rounded-md border border-[#444] bg-[#2D2D2E] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        />
                        <p className={hintCls}>Supports {`{template}`} variables. Max 160 chars for single SMS.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/80 flex items-center gap-1">
                            Sender ID <span className="text-white/30 text-xs">(optional)</span>
                        </Label>
                        <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="MyBrand" className={inputCls} />
                        <p className={hintCls}>Alphanumeric sender ID if registered with Africa's Talking. Leave empty to use default.</p>
                    </div>
                </>
            )}

            {operation === "send_airtime" && (
                <div className="space-y-2">
                    <Label className="text-white/80">Airtime Amount (KES)</Label>
                    <Input
                        value={airtimeAmount}
                        onChange={(e) => setAirtimeAmount(e.target.value)}
                        placeholder="50 or {trigger.amount}"
                        className={inputCls}
                    />
                    <p className={hintCls}>Amount in KES to top up. Supports template variables.</p>
                </div>
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
