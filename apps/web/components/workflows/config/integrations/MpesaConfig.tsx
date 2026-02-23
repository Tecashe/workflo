"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { ValidationMessage } from "../../shared";
import { useSession } from "@/lib/auth-client";
import { Copy, CheckCircle2, Info } from "lucide-react";

interface MpesaConfigProps {
    data: Record<string, any>;
    onSave: (data: Record<string, any>) => void;
}

type MpesaOperation = "stk_push" | "check_status" | "b2c";

export function MpesaConfig({ data, onSave }: MpesaConfigProps) {
    const [label, setLabel] = useState(data.label || "M-Pesa");
    const [responseName, setResponseName] = useState(data.responseName || "mpesaResult");
    const [credentialId, setCredentialId] = useState(data.credentialId || "");
    const [operation, setOperation] = useState<MpesaOperation>(
        (["stk_push", "check_status", "b2c"] as MpesaOperation[]).includes(data.operation)
            ? data.operation
            : "stk_push"
    );
    const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || "");
    const [amount, setAmount] = useState(data.amount || "");
    const [accountReference, setAccountReference] = useState(data.accountReference || "Floe Order");
    const [transactionDesc, setTransactionDesc] = useState(data.transactionDesc || "Payment for services");
    const [checkoutRequestId, setCheckoutRequestId] = useState(data.checkoutRequestId || "");
    const [commandId, setCommandId] = useState(data.commandId || "BusinessPayment");
    const [remarks, setRemarks] = useState(data.remarks || "");

    const credentialsQuery = trpc.credentials.getAll.useQuery(undefined, { refetchOnWindowFocus: false });
    const mpesaCredentials = useMemo(
        () => (credentialsQuery.data ?? []).filter((c) => c.platform === "mpesa"),
        [credentialsQuery.data]
    );

    const { data: session } = useSession();
    const [copied, setCopied] = useState(false);
    const baseUrl = typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL ?? "https://yourapp.fynt.app");
    const callbackUrl = session?.user?.id
        ? `${baseUrl}/api/mpesa/callback/${session.user.id}`
        : null;

    const copyCallbackUrl = () => {
        if (!callbackUrl) return;
        navigator.clipboard.writeText(callbackUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const missingFields: string[] = [];
    if (!label.trim()) missingFields.push("Node Label");
    if (!responseName.trim()) missingFields.push("Response Name");
    if (!credentialId) missingFields.push("M-Pesa Credential");
    if (operation === "stk_push" || operation === "b2c") {
        if (!phoneNumber.trim()) missingFields.push("Phone Number");
        if (!amount.trim()) missingFields.push("Amount");
    }
    if (operation === "check_status" && !checkoutRequestId.trim()) {
        missingFields.push("Checkout Request ID");
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            label,
            responseName,
            credentialId,
            operation,
            phoneNumber,
            amount,
            accountReference,
            transactionDesc,
            checkoutRequestId,
            commandId,
            remarks,
        });
    };

    const inputCls = "bg-[#2D2D2E] border-[#444] text-white placeholder:text-white/30";
    const selectCls = "w-full h-9 rounded-md border border-[#444] bg-[#2D2D2E] px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-ring";
    const hintCls = "text-xs text-white/40";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Auto-generated callback URL banner */}
            {callbackUrl && (
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <p className="text-xs font-semibold text-emerald-300">Your M-Pesa Callback URL</p>
                    </div>
                    <p className="text-xs text-emerald-200/80 leading-relaxed">
                        Paste this URL into the <strong>Daraja portal</strong> under your app's STK Push callback settings. Floe handles the rest automatically.
                    </p>
                    <div className="flex items-center gap-2 bg-black/30 rounded-md px-2.5 py-1.5">
                        <code className="text-xs text-emerald-300 font-mono flex-1 truncate">{callbackUrl}</code>
                        <button
                            type="button"
                            onClick={copyCallbackUrl}
                            className="shrink-0 text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-emerald-200/50">
                        📍 Daraja Portal → Apps → Your App → Edit → STK Push Callback URL
                    </p>
                </div>
            )}
            <div className="space-y-2">
                <Label className="text-white/80">Node Label</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="M-Pesa" className={inputCls} />
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Response Name</Label>
                <Input value={responseName} onChange={(e) => setResponseName(e.target.value)} placeholder="mpesaResult" className={inputCls} />
                <p className={hintCls}>Reference output with: {`{${responseName}.checkoutRequestId}`}</p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">M-Pesa Credential</Label>
                <select value={credentialId} onChange={(e) => setCredentialId(e.target.value)} className={selectCls}>
                    <option value="">Select a credential</option>
                    {mpesaCredentials.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                </select>
                <p className={hintCls}>
                    No credentials?{" "}
                    <a href="/home/credentials" className="text-[#F04D26] hover:text-[#F04D26]/90 underline">
                        Add M-Pesa credentials
                    </a>
                </p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Operation</Label>
                <select value={operation} onChange={(e) => setOperation(e.target.value as MpesaOperation)} className={selectCls}>
                    <option value="stk_push">STK Push (prompt customer to pay)</option>
                    <option value="check_status">Check STK Status</option>
                    <option value="b2c">B2C (send money to customer)</option>
                </select>
            </div>

            {(operation === "stk_push" || operation === "b2c") && (
                <>
                    <div className="space-y-2">
                        <Label className="text-white/80">Phone Number</Label>
                        <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="0712345678 or {trigger.phone}"
                            className={inputCls}
                        />
                        <p className={hintCls}>Accepts 07xx, 2547x, or +2547x. Supports template variables.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/80">Amount (KES)</Label>
                        <Input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="500 or {trigger.amount}"
                            className={inputCls}
                        />
                    </div>
                </>
            )}

            {operation === "stk_push" && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-white/80">Account Reference</Label>
                            <Input value={accountReference} onChange={(e) => setAccountReference(e.target.value)} placeholder="Order #123" className={inputCls} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/80">Transaction Description</Label>
                            <Input value={transactionDesc} onChange={(e) => setTransactionDesc(e.target.value)} placeholder="Payment for services" className={inputCls} />
                        </div>
                    </div>
                </>
            )}

            {operation === "check_status" && (
                <div className="space-y-2">
                    <Label className="text-white/80">Checkout Request ID</Label>
                    <Input
                        value={checkoutRequestId}
                        onChange={(e) => setCheckoutRequestId(e.target.value)}
                        placeholder="{mpesaResult.checkoutRequestId}"
                        className={`${inputCls} font-mono text-xs`}
                    />
                    <p className={hintCls}>Use the ID returned from a previous STK Push node.</p>
                </div>
            )}

            {operation === "b2c" && (
                <>
                    <div className="space-y-2">
                        <Label className="text-white/80">Command ID</Label>
                        <select value={commandId} onChange={(e) => setCommandId(e.target.value)} className={selectCls}>
                            <option value="BusinessPayment">Business Payment</option>
                            <option value="SalaryPayment">Salary Payment</option>
                            <option value="PromotionPayment">Promotion Payment</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white/80">Remarks</Label>
                        <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Payment via Floe" className={inputCls} />
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
