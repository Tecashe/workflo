"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { EASE_OUT_QUAD } from "@/lib/animation/variants";
import { User, Bell, ShieldAlert, Check, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

type Tab = "profile" | "notifications" | "danger";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "danger", label: "Danger Zone", icon: ShieldAlert },
];

type NotifToggleProps = {
    label: string;
    description: string;
    checked: boolean;
    onChange: (val: boolean) => void;
};
function NotifToggle({ label, description, checked, onChange }: NotifToggleProps) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5">
            <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-white/45">{description}</p>
            </div>
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative h-5.5 w-10 shrink-0 rounded-full border transition-colors duration-200 ${checked
                        ? "border-[#F04D26] bg-[#F04D26]"
                        : "border-white/20 bg-white/8"
                    }`}
                style={{ height: "22px", width: "40px" }}
            >
                <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-[19px]" : "translate-x-0.5"
                        }`}
                />
            </button>
        </div>
    );
}

type SavedBadgeProps = { show: boolean };
function SavedBadge({ show }: SavedBadgeProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.span
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: EASE_OUT_QUAD }}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400"
                >
                    <Check className="h-3 w-3" /> Saved
                </motion.span>
            )}
        </AnimatePresence>
    );
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const user = session?.user;

    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [displayName, setDisplayName] = useState(user?.name ?? "");
    const [savedProfile, setSavedProfile] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    const [notifs, setNotifs] = useState({
        workflowFailure: true,
        workflowSuccess: false,
        weeklyDigest: true,
        productUpdates: true,
    });
    const [savedNotifs, setSavedNotifs] = useState(false);

    const handleSaveProfile = () => {
        setSavedProfile(true);
        setTimeout(() => setSavedProfile(false), 2500);
    };

    const handleSaveNotifs = () => {
        setSavedNotifs(true);
        setTimeout(() => setSavedNotifs(false), 2500);
    };

    const avatarInitial = (user?.name ?? user?.email ?? "U")[0]?.toUpperCase() ?? "U";

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUAD }}
            >
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account preferences</p>
            </motion.div>

            <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                {/* Sidebar Nav */}
                <motion.nav
                    className="flex shrink-0 flex-row gap-1 md:w-48 md:flex-col"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_QUAD, delay: 0.05 }}
                >
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isDanger = tab.id === "danger";
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                        ? isDanger
                                            ? "bg-red-500/10 text-red-400"
                                            : "bg-white/8 text-white"
                                        : isDanger
                                            ? "text-red-400/60 hover:bg-red-500/5 hover:text-red-400"
                                            : "text-white/50 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="settings-nav-indicator"
                                        className={`absolute left-0 h-4 w-0.5 rounded-full ${isDanger ? "bg-red-400" : "bg-[#F04D26]"}`}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <Icon className="h-4 w-4 shrink-0" />
                                {tab.label}
                                {isActive && <ChevronRight className="ml-auto hidden h-3.5 w-3.5 opacity-40 md:block" />}
                            </button>
                        );
                    })}
                </motion.nav>

                {/* Content */}
                <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_QUAD, delay: 0.1 }}
                >
                    <AnimatePresence mode="wait">
                        {activeTab === "profile" && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15, ease: EASE_OUT_QUAD }}
                                className="space-y-5"
                            >
                                <div className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] p-5">
                                    <h2 className="mb-4 text-sm font-semibold text-white">Personal Information</h2>

                                    {/* Avatar */}
                                    <div className="mb-5 flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F04D26]/20 text-xl font-bold text-[#F04D26] ring-2 ring-[#F04D26]/20">
                                            {avatarInitial}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{user?.name ?? "Your Name"}</p>
                                            <p className="text-xs text-white/45">{user?.email ?? "your@email.com"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-xs">Display Name</Label>
                                            <Input
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                placeholder="Your name"
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/25"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-xs">Email Address</Label>
                                            <Input
                                                value={user?.email ?? ""}
                                                disabled
                                                className="bg-white/[0.02] border-white/8 text-white/40 cursor-not-allowed"
                                            />
                                            <p className="text-[11px] text-white/30">Email cannot be changed here.</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center gap-3">
                                        <Button
                                            onClick={handleSaveProfile}
                                            className="bg-[#F04D26] hover:bg-[#e04420] text-white"
                                        >
                                            Save Changes
                                        </Button>
                                        <SavedBadge show={savedProfile} />
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] p-5">
                                    <h2 className="mb-1 text-sm font-semibold text-white">Account Plan</h2>
                                    <p className="mb-4 text-xs text-white/40">Your current subscription tier</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#F04D26]/10">
                                                <span className="text-base">✦</span>
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-white capitalize">Free Plan</p>
                                                <p className="text-xs text-white/40">100 runs / month</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 bg-transparent text-white hover:bg-white/5 hover:text-white"
                                            onClick={() => window.location.href = "/home/upgrade"}
                                        >
                                            Upgrade
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "notifications" && (
                            <motion.div
                                key="notifications"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15, ease: EASE_OUT_QUAD }}
                                className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] p-5"
                            >
                                <h2 className="mb-1 text-sm font-semibold text-white">Email Notifications</h2>
                                <p className="mb-5 text-xs text-white/40">Choose which events trigger an email to you</p>
                                <div className="space-y-3">
                                    <NotifToggle
                                        label="Workflow Failure Alerts"
                                        description="Get notified immediately when a workflow fails"
                                        checked={notifs.workflowFailure}
                                        onChange={(v) => setNotifs((p) => ({ ...p, workflowFailure: v }))}
                                    />
                                    <NotifToggle
                                        label="Workflow Run Completion"
                                        description="Receive a confirmation when a workflow completes"
                                        checked={notifs.workflowSuccess}
                                        onChange={(v) => setNotifs((p) => ({ ...p, workflowSuccess: v }))}
                                    />
                                    <NotifToggle
                                        label="Weekly Activity Digest"
                                        description="A weekly summary of your workflow runs and stats"
                                        checked={notifs.weeklyDigest}
                                        onChange={(v) => setNotifs((p) => ({ ...p, weeklyDigest: v }))}
                                    />
                                    <NotifToggle
                                        label="Product Updates"
                                        description="New features, improvements, and platform announcements"
                                        checked={notifs.productUpdates}
                                        onChange={(v) => setNotifs((p) => ({ ...p, productUpdates: v }))}
                                    />
                                </div>
                                <div className="mt-5 flex items-center gap-3">
                                    <Button
                                        onClick={handleSaveNotifs}
                                        className="bg-[#F04D26] hover:bg-[#e04420] text-white"
                                    >
                                        Save Preferences
                                    </Button>
                                    <SavedBadge show={savedNotifs} />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "danger" && (
                            <motion.div
                                key="danger"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15, ease: EASE_OUT_QUAD }}
                                className="space-y-4"
                            >
                                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-5">
                                    <div className="mb-1 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-400" />
                                        <h2 className="text-sm font-semibold text-red-300">Delete Account</h2>
                                    </div>
                                    <p className="mb-4 text-xs text-white/45">
                                        Once you delete your account, all workflows, credentials, and execution history will be permanently removed. This action cannot be undone.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setDeleteConfirmOpen(true)}
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300"
                                    >
                                        Delete My Account
                                    </Button>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] p-5">
                                    <h2 className="mb-1 text-sm font-semibold text-white">Export Data</h2>
                                    <p className="mb-4 text-xs text-white/45">
                                        Download a copy of all your workflow definitions, credentials metadata, and execution history.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="border-white/15 text-white/60 hover:bg-white/5 hover:text-white"
                                    >
                                        Request Data Export
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Delete Account Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Delete Account</DialogTitle>
                        <DialogDescription>
                            This will permanently delete your account and all data. Type{" "}
                            <span className="font-mono font-semibold text-white">DELETE</span> to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                        <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setDeleteInput(""); }} className="text-white/60 hover:text-white border-white/15">
                            Cancel
                        </Button>
                        <Button
                            disabled={deleteInput !== "DELETE"}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
                        >
                            Delete Account
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
