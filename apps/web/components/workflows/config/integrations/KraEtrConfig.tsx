"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { ValidationMessage } from "../../shared";
import { Receipt, Info } from "lucide-react";

interface KraEtrConfigProps {
    data: Record<string, any>;
    onSave: (data: Record<string, any>) => void;
}

export function KraEtrConfig({ data, onSave }: KraEtrConfigProps) {
    const [label, setLabel] = useState(data.label || "KRA ETR");
    const [responseName, setResponseName] = useState(data.responseName || "etrResult");
    const [credentialId, setCredentialId] = useState(data.credentialId || "");
    const [invoiceNumber, setInvoiceNumber] = useState(data.invoiceNumber || "");
    const [totalAmount, setTotalAmount] = useState(data.totalAmount || "");
    const [taxableAmount, setTaxableAmount] = useState(data.taxableAmount || "");
    const [vatAmount, setVatAmount] = useState(data.vatAmount || "");
    const [buyerPin, setBuyerPin] = useState(data.buyerPin || "");
    const [buyerName, setBuyerName] = useState(data.buyerName || "");
    const [buyerPhone, setBuyerPhone] = useState(data.buyerPhone || "");
    const [itemsJson, setItemsJson] = useState(data.itemsJson || "");
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [showBuyer, setShowBuyer] = useState(false);

    const credentialsQuery = trpc.credentials.getAll.useQuery(undefined, { refetchOnWindowFocus: false });
    const etrCredentials = useMemo(
        () => (credentialsQuery.data ?? []).filter((c) => c.platform === "kraETR"),
        [credentialsQuery.data]
    );

    const validateJson = (val: string) => {
        if (!val.trim()) { setJsonError(null); return; }
        try {
            const parsed = JSON.parse(val);
            if (!Array.isArray(parsed)) { setJsonError("Must be a JSON array of items"); return; }
            setJsonError(null);
        } catch {
            setJsonError("Invalid JSON — check for missing quotes or commas");
        }
    };

    const missingFields: string[] = [];
    if (!label.trim()) missingFields.push("Node Label");
    if (!responseName.trim()) missingFields.push("Response Name");
    if (!credentialId) missingFields.push("KRA ETR Credential");
    if (!totalAmount.trim()) missingFields.push("Total Amount");
    if (jsonError) missingFields.push("Fix items JSON");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (missingFields.length > 0) return;
        onSave({ label, responseName, credentialId, operation: "issue_receipt", invoiceNumber, totalAmount, taxableAmount, vatAmount, buyerPin, buyerName, buyerPhone, itemsJson });
    };

    const inputCls = "bg-[#2D2D2E] border-[#444] text-white placeholder:text-white/30";
    const selectCls = "w-full h-9 rounded-md border border-[#444] bg-[#2D2D2E] px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-ring";
    const hintCls = "text-xs text-white/40";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* KRA info banner */}
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <Info className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-200 leading-relaxed">
                    This node issues a <strong>KRA-compliant Electronic Tax Receipt</strong> via your certified ETR middleware (Pesalink, Taxtech, etc.).
                    VAT is auto-calculated at 16% if taxable/VAT amounts are not specified.
                </p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Node Label</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Issue KRA Receipt" className={inputCls} />
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Response Name</Label>
                <Input value={responseName} onChange={(e) => setResponseName(e.target.value)} placeholder="etrResult" className={inputCls} />
                <p className={hintCls}>Access receipt number as: {`{${responseName}.receiptNumber}`}</p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">KRA ETR Credential</Label>
                <select value={credentialId} onChange={(e) => setCredentialId(e.target.value)} className={selectCls}>
                    <option value="">Select a credential</option>
                    {etrCredentials.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                </select>
                <p className={hintCls}>
                    No credentials?{" "}
                    <a href="/home/credentials" className="text-[#F04D26] hover:text-[#F04D26]/90 underline">
                        Add KRA ETR credentials
                    </a>
                </p>
            </div>

            <div className="space-y-2">
                <Label className="text-white/80">Invoice Number <span className="text-white/40">(optional)</span></Label>
                <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="{mpesaResult.checkoutRequestId} or INV-001" className={inputCls} />
                <p className={hintCls}>Leave blank to auto-generate from timestamp.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                    <Label className="text-white/80">Total (KES)</Label>
                    <Input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="1160 or {trigger.total}" className={inputCls} />
                </div>
                <div className="space-y-2">
                    <Label className="text-white/80">Taxable <span className="text-white/30">(opt)</span></Label>
                    <Input value={taxableAmount} onChange={(e) => setTaxableAmount(e.target.value)} placeholder="auto" className={inputCls} />
                </div>
                <div className="space-y-2">
                    <Label className="text-white/80">VAT <span className="text-white/30">(opt)</span></Label>
                    <Input value={vatAmount} onChange={(e) => setVatAmount(e.target.value)} placeholder="auto" className={inputCls} />
                </div>
            </div>
            <p className={hintCls}>Taxable and VAT auto-calculated at 16% if left blank. Total = Taxable + VAT.</p>

            <div className="space-y-2">
                <Label className="text-white/80">Items JSON <span className="text-white/40">(optional)</span></Label>
                <textarea
                    value={itemsJson}
                    onChange={(e) => { setItemsJson(e.target.value); validateJson(e.target.value); }}
                    placeholder={`[{"description":"Service","quantity":1,"unitPrice":1000,"totalPrice":1000}]`}
                    rows={3}
                    className={`w-full rounded-md border px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-[#2D2D2E] border-[#444] text-white placeholder:text-white/30 ${jsonError ? "border-red-500/60" : ""}`}
                />
                {jsonError ? (
                    <p className="text-xs text-red-400">{jsonError}</p>
                ) : (
                    <p className={hintCls}>Array of line items. Leave blank for a single "Services" line.</p>
                )}
            </div>

            {/* Buyer details (optional, collapsible) */}
            <div className="rounded-lg border border-[#333] overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowBuyer((p) => !p)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Receipt className="h-3.5 w-3.5" />
                        <span>Buyer Details</span>
                        <span className="text-xs text-white/30">(optional — for B2B receipts)</span>
                    </div>
                    <span className="text-white/30">{showBuyer ? "▲" : "▼"}</span>
                </button>
                {showBuyer && (
                    <div className="p-3 pt-0 space-y-3 border-t border-[#333]">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-white/70 text-xs">Buyer KRA PIN</Label>
                                <Input value={buyerPin} onChange={(e) => setBuyerPin(e.target.value)} placeholder="A001234567P" className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-white/70 text-xs">Buyer Name</Label>
                                <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="{trigger.name}" className={inputCls} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-white/70 text-xs">Buyer Phone</Label>
                            <Input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="0712345678" className={inputCls} />
                        </div>
                    </div>
                )}
            </div>

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
