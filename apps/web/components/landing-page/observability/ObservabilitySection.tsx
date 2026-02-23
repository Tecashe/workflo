'use client';

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Activity, Terminal, ShieldCheck, Database, Server } from "lucide-react";

const LOGS = [
    { time: "0ms", type: "info", msg: "Trigger received: webhook_req_1x9a", node: "Trigger" },
    { time: "42ms", type: "info", msg: "Validating HMAC signature...", node: "Auth" },
    { time: "45ms", type: "success", msg: "Signature verified. Payload accepted.", node: "Auth" },
    { time: "118ms", type: "info", msg: "Extracting customer.id (cus_99ax)", node: "Parser" },
    { time: "244ms", type: "info", msg: "Querying internal database...", node: "Database" },
    { time: "512ms", type: "success", msg: "Record located. Initializing branch 1.", node: "Router" },
    { time: "515ms", type: "info", msg: "POST https://api.stripe.com/v1/customers", node: "HTTP" },
    { time: "890ms", type: "success", msg: "200 OK. Mapped output to {stripe.cus_id}", node: "HTTP" },
    { time: "892ms", type: "info", msg: "Committing checkpoint state [txn_49991]", node: "Core" },
    { time: "905ms", type: "success", msg: "Execution completed successfully.", node: "Engine" },
];

export function ObservabilitySection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    return (
        <section ref={containerRef} className="relative py-24 lg:py-32 overflow-hidden bg-[#101010]">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#151515]" />
            <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            <div className="relative z-10 w-[92%] md:w-[88%] lg:w-[90%] max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left: Text Content */}
                    <div className="order-2 lg:order-1 flex flex-col items-start text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="flex h-8 items-center gap-2 rounded-[11px] border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/75 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.6)] mb-6"
                        >
                            <Activity className="w-4 h-4 text-blue-400" />
                            <span>Observability</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-3xl md:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-white mb-6"
                        >
                            Complete visibility.<br />
                            <span className="italic text-[#7D7D87]">Zero guesswork.</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-[#A1A1AA] text-lg max-w-xl mb-10"
                        >
                            Professional-grade logging for every execution. Trace every payload, header, and variable across node boundaries in real-time. Know exactly what happened and exactly when.
                        </motion.p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                            <Feature
                                icon={<Terminal className="w-5 h-5 text-blue-400" />}
                                title="Node-Level Tracing"
                                description="Inspect inputs and outputs for every single node in your graph."
                                delay={0.3}
                            />
                            <Feature
                                icon={<Database className="w-5 h-5 text-emerald-400" />}
                                title="Payload Retention"
                                description="Debug failures easily with structured historical execution data."
                                delay={0.4}
                            />
                            <Feature
                                icon={<ShieldCheck className="w-5 h-5 text-purple-400" />}
                                title="Audit Trails"
                                description="Immutable logs for compliance and enterprise-grade security."
                                delay={0.5}
                            />
                            <Feature
                                icon={<Server className="w-5 h-5 text-[#F04D26]" />}
                                title="Instant Replays"
                                description="Rerun workflows from the exact point of failure using the same payload."
                                delay={0.6}
                            />
                        </div>
                    </div>

                    {/* Right: The Terminal Visualization */}
                    <div className="order-1 lg:order-2 relative w-full perspective-1000">
                        <motion.div
                            initial={{ opacity: 0, rotateY: 10, x: 20 }}
                            whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="w-full bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            {/* Terminal Header */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#121212]">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                </div>
                                <div className="mx-auto flex items-center gap-2 text-[#A1A1AA] text-xs font-mono">
                                    <Terminal className="w-3 h-3" />
                                    execution_run_8f7b2c.log
                                </div>
                            </div>

                            {/* Terminal Body */}
                            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm h-[380px] sm:h-[420px] overflow-hidden flex flex-col justify-end relative">
                                {/* Gradient overlay to fade top logs */}
                                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0A0A0A] to-transparent z-10" />

                                <div className="space-y-3">
                                    {LOGS.map((log, i) => (
                                        <LogLine key={i} log={log} index={i} isInView={isInView} />
                                    ))}

                                    {isInView && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0, 1, 0] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: LOGS.length * 0.2 + 0.5 }}
                                            className="text-white/40 mt-4 flex items-center gap-2"
                                        >
                                            <span className="w-2 h-4 bg-white/60 block" /> Listening for events...
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Radar Ping Decoration */}
                        <div className="absolute -top-6 -right-6 lg:-right-12 z-0 hidden sm:block">
                            <div className="relative w-24 h-24">
                                <motion.div
                                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                    className="absolute inset-0 rounded-full border border-blue-500/50"
                                />
                                <motion.div
                                    animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                    className="absolute inset-0 rounded-full border border-blue-500/30 bg-blue-500/10"
                                />
                                <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function Feature({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay }}
            className="flex flex-col gap-2"
        >
            <div className="flex items-center gap-2">
                {icon}
                <h4 className="text-white font-medium text-sm">{title}</h4>
            </div>
            <p className="text-[#A1A1AA] text-xs leading-relaxed max-w-[90%]">
                {description}
            </p>
        </motion.div>
    );
}

function LogLine({ log, index, isInView }: { log: any, index: number, isInView: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.3, delay: index * 0.2 }} // Staggered typing effect
            className="flex gap-4 font-mono tracking-tight"
        >
            <span className="text-[#A1A1AA] shrink-0 w-[45px] text-right">+{log.time}</span>
            <span className={`shrink-0 w-[60px] ${log.type === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>
                [{log.node}]
            </span>
            <span className="text-white/80">{log.msg}</span>
        </motion.div>
    );
}
