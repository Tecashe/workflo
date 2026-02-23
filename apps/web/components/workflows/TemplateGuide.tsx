"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface GuideStep {
    title: string;
    description: string;
    /** Optional CTA that opens a link or performs an action */
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    /** If true, this step is informational only — no checkbox */
    info?: boolean;
}

export interface TemplateGuideProps {
    open: boolean;
    onClose: () => void;
    templateName: string;
    /** Short description of what this template does */
    description: string;
    steps: GuideStep[];
    /** Called when user clicks "Use Template" after reviewing guide */
    onConfirm?: () => void;
}

export function TemplateGuide({ open, onClose, templateName, description, steps, onConfirm }: TemplateGuideProps) {
    const [completed, setCompleted] = useState<Set<number>>(new Set());

    const toggle = (index: number) => {
        setCompleted((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const checkableSteps = steps.filter((s) => !s.info);
    const allChecked = checkableSteps.length === 0 || completed.size >= checkableSteps.length;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#1a1a1b] border-[#333]">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <DialogTitle className="text-white text-base font-semibold leading-tight">
                                {templateName}
                            </DialogTitle>
                            <p className="text-xs text-white/50 mt-1 leading-relaxed">{description}</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-2.5 mt-2">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Setup Checklist</p>

                    {steps.map((step, i) => {
                        const isInfo = !!step.info;
                        const isDone = isInfo ? false : completed.has(i);

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.15 }}
                                className={`rounded-lg border p-3 transition-colors ${isDone
                                    ? "border-emerald-500/30 bg-emerald-500/5"
                                    : isInfo
                                        ? "border-blue-500/20 bg-blue-500/5"
                                        : "border-[#333] bg-[#252526] hover:border-[#444]"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Checkbox / info icon */}
                                    {!isInfo && (
                                        <button
                                            type="button"
                                            onClick={() => toggle(i)}
                                            className="mt-0.5 shrink-0 transition-colors"
                                        >
                                            {isDone ? (
                                                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                                            ) : (
                                                <Circle className="h-4.5 w-4.5 text-white/30 hover:text-white/60" />
                                            )}
                                        </button>
                                    )}
                                    {isInfo && (
                                        <div className="mt-0.5 shrink-0 h-4.5 w-4.5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <span className="text-[9px] text-blue-400 font-bold">i</span>
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium leading-tight ${isDone ? "text-emerald-300 line-through opacity-70" : "text-white"}`}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{step.description}</p>

                                        {step.action && (
                                            <div className="mt-2">
                                                {step.action.href ? (
                                                    <a
                                                        href={step.action.href}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-[#F04D26] hover:text-[#ff6a47] transition-colors font-medium"
                                                    >
                                                        {step.action.label}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={step.action.onClick}
                                                        className="inline-flex items-center gap-1 text-xs text-[#F04D26] hover:text-[#ff6a47] transition-colors font-medium"
                                                    >
                                                        {step.action.label}
                                                        <ChevronRight className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Progress bar */}
                {checkableSteps.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-white/40">
                            <span>Setup progress</span>
                            <span>{completed.size} / {checkableSteps.length} steps</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                                className="h-full bg-[#F04D26] rounded-full"
                                animate={{ width: `${(completed.size / checkableSteps.length) * 100}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mt-4 pt-3 border-t border-[#333]">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-[#444] text-white/60 hover:text-white hover:bg-white/5 bg-transparent"
                    >
                        Close
                    </Button>
                    {onConfirm && (
                        <Button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`flex-1 text-white transition-all ${allChecked
                                ? "bg-[#F04D26] hover:bg-[#e04420]"
                                : "bg-white/10 hover:bg-white/15 cursor-default"
                                }`}
                        >
                            {allChecked ? "Use This Template →" : `Complete ${checkableSteps.length - completed.size} more steps first`}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Pre-built guide configs for all Kenyan business templates
// ---------------------------------------------------------------------------

export const TEMPLATE_GUIDES: Record<string, { description: string; steps: GuideStep[] }> = {
    "mpesa-payment": {
        description: "Prompts a customer to pay via M-Pesa STK Push, waits for confirmation, then sends a WhatsApp and email receipt automatically.",
        steps: [
            {
                title: "Create a Safaricom Daraja account",
                description: "Go to developer.safaricom.co.ke and create a Business or Personal app. You'll get a Consumer Key and Consumer Secret.",
                action: { label: "Open Daraja Portal", href: "https://developer.safaricom.co.ke" },
            },
            {
                title: "Add your M-Pesa credentials in Floe",
                description: "Go to Credentials → M-Pesa and enter your Consumer Key, Consumer Secret, Shortcode, and Passkey.",
                action: { label: "Go to Credentials", href: "/home/credentials?platform=mpesa&openCreate=1" },
            },
            {
                title: "Copy your M-Pesa Callback URL",
                description: "Open the M-Pesa node in your workflow. Copy the green callback URL shown at the top and paste it into the Daraja portal under your app's STK Push callback settings.",
                info: false,
            },
            {
                title: "Set up your WhatsApp Business API",
                description: "You need a WhatsApp Business Cloud API access token and Phone Number ID from Meta for Developers.",
                action: { label: "Open Meta Developers", href: "https://developers.facebook.com/docs/whatsapp" },
            },
            {
                title: "Add WhatsApp credentials in Floe",
                description: "Go to Credentials → WhatsApp Business and enter your Access Token and Phone Number ID.",
                action: { label: "Add WhatsApp Credentials", href: "/home/credentials?platform=whatsapp&openCreate=1" },
            },
            {
                title: "Activate the workflow",
                description: "Once all nodes are configured, toggle the workflow to Active. Test it by triggering an STK Push with a small amount.",
            },
        ],
    },
    "mpesa-kra-receipt": {
        description: "Issues a KRA electronic tax receipt automatically every time an M-Pesa payment is confirmed.",
        steps: [
            {
                title: "Set up M-Pesa credentials",
                description: "Add your Daraja Consumer Key, Consumer Secret, Shortcode, and Passkey.",
                action: { label: "Add M-Pesa Credentials", href: "/home/credentials?platform=mpesa&openCreate=1" },
            },
            {
                title: "Sign up with a certified ETR middleware provider",
                description: "You need a KRA-certified ETR provider. Popular options: Pesalink ETR Hub or Taxtech. They'll give you an API key and your till/device details.",
                action: { label: "Pesalink ETR Hub", href: "https://pesalink.co.ke" },
            },
            {
                title: "Add KRA ETR credentials in Floe",
                description: "Go to Credentials → KRA ETR and enter your provider's API Key, Till Number, Device Serial, and API URL.",
                action: { label: "Add KRA ETR Credentials", href: "/home/credentials?platform=kraETR&openCreate=1" },
            },
            {
                title: "Configure the KRA ETR node",
                description: "In the workflow editor, open the KRA ETR node. The invoice amount will automatically use the M-Pesa payment amount from the previous step.",
            },
            {
                title: "Copy your M-Pesa Callback URL",
                description: "Open the M-Pesa node and copy the green callback URL. Paste it into your Daraja portal so Safaricom can notify Floe when payments are confirmed.",
            },
        ],
    },
    "sms-notification": {
        description: "Sends an SMS to a customer's phone via Africa's Talking when triggered by a form, M-Pesa payment, or another system.",
        steps: [
            {
                title: "Create an Africa's Talking account",
                description: "Sign up at africastalking.com. You can test for free using the 'sandbox' username before going live.",
                action: { label: "Sign up at Africa's Talking", href: "https://account.africastalking.com" },
            },
            {
                title: "Add your AT credentials in Floe",
                description: "Go to Credentials → Africa's Talking and enter your API Key and username ('sandbox' for testing, your real username for production).",
                action: { label: "Add AT Credentials", href: "/home/credentials?platform=africastalking&openCreate=1" },
            },
            {
                title: "Configure the SMS node",
                description: "Set the recipient phone (can be a template variable like {trigger.phone}) and your message text.",
            },
        ],
    },
};
