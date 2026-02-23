'use client';

import { motion, useScroll, useTransform, useSpring, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { GitBranch, ShieldAlert, Cpu, Network } from "lucide-react";

export function ArchitectureSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [-50, 50]);

    return (
        <section ref={containerRef} className="relative py-24 lg:py-32 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#151515] z-0" />
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F04D26]/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="relative z-10 w-[92%] md:w-[88%] lg:w-[90%] max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex flex-col items-center mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex h-8 items-center gap-2 rounded-[11px] border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/75 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.6)] mb-6"
                    >
                        <Network className="w-4 h-4 text-[#F04D26]" />
                        <span>The Engine</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-white mb-6"
                    >
                        Built for <span className="italic text-[#7D7D87]">nonlinear</span> operations.
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[#A1A1AA] text-lg max-w-2xl"
                    >
                        Unlike step-by-step rigid automations, Floe models workflows as directed graphs. Handle multiple outcomes, retries, and failure states with mathematical certainty.
                    </motion.p>
                </div>

                {/* Main Visual Component */}
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left: Interactive Graph Visualization */}
                    <motion.div style={{ y: y1 }} className="relative h-[400px] sm:h-[500px] w-full bg-[#1A1A1A] rounded-[32px] border border-white/10 p-8 shadow-2xl flex items-center justify-center overflow-hidden">
                        {/* Grid Pattern */}
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
                            backgroundSize: '24px 24px'
                        }} />

                        {/* Animated Nodes Representation */}
                        <InteractiveGraph />
                    </motion.div>

                    {/* Right: Feature Descriptions */}
                    <div className="flex flex-col gap-8">
                        <FeatureBlock
                            icon={<GitBranch />}
                            title="True Graph Execution"
                            description="Build complex branching logic. No more long unreadable chains; route payload data visually and logically to multiple concurrent paths."
                            delay={0.1}
                            y={y2}
                        />
                        <FeatureBlock
                            icon={<ShieldAlert />}
                            title="Crash-Safe State"
                            description="Every node execution is checkpointed. If an external API fails structurally, Floe pauses the run right exactly there."
                            delay={0.2}
                            y={y2}
                        />
                        <FeatureBlock
                            icon={<Cpu />}
                            title="Idempotent Retries"
                            description="Configure granular retry policies (exponential backoff, jitter) per node. Resume failed runs without duplicating side effects."
                            delay={0.3}
                            y={y2}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeatureBlock({ icon, title, description, delay, y }: { icon: React.ReactNode, title: string, description: string, delay: number, y: any }) {
    return (
        <motion.div
            style={{ y }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay }}
            className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-[#F04D26]/0 via-[#F04D26]/0 to-[#F04D26]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="w-10 h-10 rounded-xl bg-[#242424] border border-white/10 flex items-center justify-center text-white/70 mb-4 group-hover:text-[#F04D26] group-hover:bg-[#F04D26]/10 transition-all">
                {icon}
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}

function InteractiveGraph() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-100px" });

    const pathVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 1.5, ease: "easeInOut", delay: 0.5 }
        }
    };

    return (
        <div ref={ref} className="relative w-full h-full flex items-center justify-center z-10">
            <svg
                className="w-full h-full drop-shadow-2xl"
                viewBox="0 0 600 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#404040" />
                        <stop offset="50%" stopColor="#F04D26" />
                        <stop offset="100%" stopColor="#404040" />
                    </linearGradient>
                </defs>

                {/* Connection lines */}
                {/* Node A (100,200) to Node B (300,100) */}
                <motion.path
                    d="M 100 200 C 200 200, 200 100, 300 100"
                    fill="transparent"
                    stroke="url(#line-gradient)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    variants={pathVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                />

                {/* Node A (100,200) to Node C (300,300) */}
                <motion.path
                    d="M 100 200 C 200 200, 200 300, 300 300"
                    fill="transparent"
                    stroke="#404040"
                    strokeWidth="2"
                    variants={pathVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                />

                {/* Node B (300,100) to Node D (500,200) */}
                <motion.path
                    d="M 300 100 C 400 100, 400 200, 500 200"
                    fill="transparent"
                    stroke="#404040"
                    strokeWidth="2"
                    variants={pathVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                />

                {/* Moving dot along main success path */}
                {isInView && (
                    <motion.circle
                        r="3"
                        fill="#F04D26"
                        animate={{
                            offsetDistance: ["0%", "100%"]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            offsetPath: "path('M 100 200 C 200 200, 200 100, 300 100 M 300 100 C 400 100, 400 200, 500 200')"
                        }}
                    >
                        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="3s" repeatCount="indefinite" />
                    </motion.circle>
                )}

                {/* Simulated Nodes via foreignObject perfectly centered on the coordinates */}
                <SvgNode cx={100} cy={200} label="Webhook" delay={0.2} active={isInView} type="trigger" />
                <SvgNode cx={300} cy={100} label="Format Data" delay={0.8} active={isInView} type="action" status="success" />
                <SvgNode cx={300} cy={300} label="Filter" delay={1.0} active={isInView} type="logic" status="idle" />
                <SvgNode cx={500} cy={200} label="HTTP Request" delay={1.4} active={isInView} type="action" status="idle" />

            </svg>
        </div>
    );
}

function SvgNode({ cx, cy, label, delay, active, type, status = 'idle' }: { cx: number, cy: number, label: string, delay: number, active: boolean, type: string, status?: 'idle' | 'success' | 'error' }) {
    const size = 56; // 14 * 4 = 56px (w-14)
    const x = cx - size / 2;
    const y = cy - size / 2;

    const getStyles = () => {
        if (status === 'success') return 'border-[#F04D26]/50 bg-[#F04D26]/10 shadow-[0_0_15px_rgba(240,77,38,0.2)]';
        if (status === 'error') return 'border-red-500/50 bg-red-500/10';
        return 'border-white/10 bg-[#242424]';
    };

    return (
        <foreignObject x={x} y={y} width={size + 60} height={size + 40} className="overflow-visible">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={active ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, delay: active ? delay : 0, type: "spring" }}
                style={{ width: size, height: size }}
                className={`rounded-xl border flex items-center justify-center relative ${getStyles()}`}
            >
                {/* Pulsing ring for success state */}
                {status === 'success' && active && (
                    <motion.div
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: delay + 0.5 }}
                        className="absolute inset-0 rounded-xl border border-[#F04D26]"
                    />
                )}

                <span className="text-[10px] absolute -bottom-6 text-white/50 whitespace-nowrap font-medium tracking-wide uppercase">
                    {label}
                </span>

                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                    {type === 'trigger' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                    {type === 'action' && <div className="w-3 h-3 bg-green-400/80 rounded-[3px]" />}
                    {type === 'logic' && <div className="w-3 h-3 border-2 border-purple-400/80 rounded-sm rotate-45" />}
                </div>
            </motion.div>
        </foreignObject>
    );
}
