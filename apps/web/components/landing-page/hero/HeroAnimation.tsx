"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ── Hero Isometric Workflow Graph ──────────────────────────────────────────
// A sprawling isometric node network showing a live workflow in motion.
// Design language: dark (#111), white dashed structure, #ff6200 orange accent,
// animated orange data packets, glowing node tops, holographic metric panel.
// ──────────────────────────────────────────────────────────────────────────

function cubePoints(tx: number, ty: number, W: number, D: number, H: number) {
    const rw = W * 0.866, rh = W * 0.5;
    const dw = D * 0.866, dh = D * 0.5;
    return {
        fr: { x: tx + rw, y: ty + rh },
        topCenter: { x: tx + (rw - dw) / 2, y: ty + (rh - dh) / 2 },
    };
}

// Node definitions — bigger scene, more nodes, more depth
const NODES = [
    { id: 'cron', label: 'Cron', tag: 'TRIGGER', tx: 30, ty: 200, W: 48, D: 36, H: 52, led: '#ff6200' },
    { id: 'webhook', label: 'Webhook', tag: 'TRIGGER', tx: 38, ty: 300, W: 44, D: 34, H: 44, led: '#ff6200' },
    { id: 'mpesa', label: 'M-Pesa', tag: 'FINANCE', tx: 148, ty: 190, W: 52, D: 40, H: 60, led: '#4ade80' },
    { id: 'ai', label: 'AI', tag: 'AI', tx: 160, ty: 290, W: 56, D: 44, H: 80, led: '#a78bfa' },
    { id: 'condition', label: 'Route', tag: 'LOGIC', tx: 272, ty: 210, W: 46, D: 36, H: 50, led: '#60a5fa' },
    { id: 'whatsapp', label: 'WhatsApp', tag: 'OUTPUT', tx: 280, ty: 300, W: 50, D: 38, H: 42, led: '#25D366' },
    { id: 'email', label: 'Email', tag: 'OUTPUT', tx: 388, ty: 250, W: 44, D: 34, H: 40, led: '#f472b6' },
    { id: 'log', label: 'Log', tag: 'UTIL', tx: 390, ty: 340, W: 40, D: 30, H: 30, led: '#94a3b8' },
];

const EDGES = [
    { id: 'e0', x1: 78, y1: 225, x2: 148, y2: 215, fromId: 'cron', toId: 'mpesa', delay: 0 },
    { id: 'e1', x1: 82, y1: 321, x2: 160, y2: 315, fromId: 'webhook', toId: 'ai', delay: 4 },
    { id: 'e2', x1: 193, y1: 220, x2: 272, y2: 232, fromId: 'mpesa', toId: 'condition', delay: 8 },
    { id: 'e3', x1: 209, y1: 330, x2: 280, y2: 320, fromId: 'ai', toId: 'whatsapp', delay: 12 },
    { id: 'e4', x1: 318, y1: 232, x2: 388, y2: 268, fromId: 'condition', toId: 'email', delay: 16 },
    { id: 'e5', x1: 318, y1: 325, x2: 390, y2: 348, fromId: 'whatsapp', toId: 'log', delay: 20 },
    { id: 'e6', x1: 193, y1: 250, x2: 160, y2: 290, fromId: 'mpesa', toId: 'ai', delay: 6 },
];

const TOTAL = 26;
const PTICKS = 9;

interface HeroAnimationProps { className?: string; }

export function HeroAnimation({ className = '' }: HeroAnimationProps) {
    const [tick, setTick] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const t = setInterval(() => setTick(p => (p + 1) % TOTAL), 160);
        return () => clearInterval(t);
    }, []);

    const hotNodes = new Set<string>();
    EDGES.forEach(e => {
        const step = (tick - e.delay + TOTAL) % TOTAL;
        if (step < PTICKS) {
            hotNodes.add(e.fromId);
            if (step > PTICKS - 2) hotNodes.add(e.toId);
        }
    });

    return (
        <div className={`relative ${className}`}>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
            >
                <svg
                    viewBox="0 0 490 430"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <linearGradient id="ha-lr" x1="0" y1=".5" x2="1" y2=".5" gradientUnits="objectBoundingBox">
                            <stop stopColor="#ff6200" /><stop offset="1" stopColor="#ff6200" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="ha-rl" x1="1" y1=".5" x2="0" y2=".5" gradientUnits="objectBoundingBox">
                            <stop stopColor="#ff6200" /><stop offset="1" stopColor="#ff6200" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="ha-panel" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                            <stop stopColor="#1a1a1a" /><stop offset="1" stopColor="#0d0d0d" />
                        </linearGradient>
                    </defs>

                    {/* ── GROUND GRID ── */}
                    {Array.from({ length: 10 }).map((_, i) => (
                        <path key={`gh-${i}`}
                            transform={`matrix(0.866 0.5 -0.866 0.5 20 ${370 + i * 8})`}
                            d="M0 0 h460" stroke="#ffffff06" strokeWidth="1" strokeDasharray="3 10" />
                    ))}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <path key={`gv-${i}`}
                            transform={`matrix(0.866 0.5 -0.866 0.5 ${20 + i * 38} 370)`}
                            d="M0 0 v80" stroke="#ffffff06" strokeWidth="1" strokeDasharray="3 10" />
                    ))}
                    {/* Orange front platform edge */}
                    <path transform="matrix(0.866 0.5 -0.866 0.5 20 370)" d="M0 0 h460"
                        stroke="url(#ha-lr)" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />
                    <circle cx={20} cy={370} r={4} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 6px #ff6200)' }} />
                    <circle cx={418} cy={370} r={4} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />

                    {/* ── NODE SHADOWS ── */}
                    {NODES.map(n => (
                        <ellipse key={`sh-${n.id}`}
                            cx={n.tx + n.W * 0.43} cy={n.ty + n.H + 14}
                            rx={n.W * 0.5} ry={n.W * 0.16}
                            fill="#000" fillOpacity="0.45"
                            style={{ filter: 'blur(7px)' }} />
                    ))}

                    {/* ── CONDUITS (drawn behind nodes) ── */}
                    {EDGES.map(e => (
                        <g key={`c-${e.id}`}>
                            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                                stroke="#ffffff08" strokeWidth="6" strokeLinecap="round" />
                            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                                stroke="#ffffff15" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 5" />
                            <circle cx={e.x1} cy={e.y1} r={2.5} fill="#000" stroke="#ff6200" strokeWidth="1.2"
                                style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />
                            <circle cx={e.x2} cy={e.y2} r={2.5} fill="#000" stroke="#ff6200" strokeWidth="1.2"
                                style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />
                        </g>
                    ))}

                    {/* ── ANIMATED PACKETS ── */}
                    {mounted && EDGES.map(e => {
                        const step = (tick - e.delay + TOTAL) % TOTAL;
                        const pct = step / PTICKS;
                        if (pct < 0 || pct > 1) return null;
                        const px = e.x1 + (e.x2 - e.x1) * pct;
                        const py = e.y1 + (e.y2 - e.y1) * pct;
                        return (
                            <g key={`pkt-${e.id}`}>
                                <circle cx={px} cy={py} r={14} fill="#ff6200" fillOpacity="0.07" style={{ filter: 'blur(5px)' }} />
                                <circle cx={px} cy={py} r={4.5} fill="#ff6200" style={{ filter: 'drop-shadow(0 0 9px #ff6200)' }} />
                                <circle cx={px} cy={py} r={1.8} fill="#fff" />
                                {[0.09, 0.18, 0.27].map((off, ti) => {
                                    const tp = Math.max(0, pct - off);
                                    return <circle key={ti}
                                        cx={e.x1 + (e.x2 - e.x1) * tp} cy={e.y1 + (e.y2 - e.y1) * tp}
                                        r={2.5 - ti * 0.6} fill="#ff6200" fillOpacity={0.38 - ti * 0.1} />;
                                })}
                            </g>
                        );
                    })}

                    {/* ── NODE CUBES ── */}
                    {NODES.map(n => {
                        const p = cubePoints(n.tx, n.ty, n.W, n.D, n.H);
                        const hot = hotNodes.has(n.id);
                        const isAI = n.id === 'ai';
                        const bc = hot ? '#ff6200' : '#ffffff20';

                        return (
                            <g key={n.id}>
                                {/* Right face */}
                                <path transform={`matrix(0.866 -0.5 0 1 ${p.fr.x} ${p.fr.y})`}
                                    d={`M0,0 h${n.D} v${n.H} h-${n.D} Z`}
                                    fill="#060606" stroke={bc} strokeWidth={hot ? '1' : '0.5'}
                                    style={{ transition: 'stroke 0.2s' }} />
                                {/* Left face */}
                                <path transform={`matrix(0.866 0.5 0 1 ${n.tx} ${n.ty})`}
                                    d={`M0,0 h${n.W} v${n.H} h-${n.W} Z`}
                                    fill={hot ? (isAI ? '#180f0f' : '#111') : '#0b0b0b'}
                                    stroke={bc} strokeWidth={hot ? '1.5' : '0.8'}
                                    style={{ filter: hot ? 'drop-shadow(0 0 9px #ff620044)' : 'none', transition: 'all 0.2s' }} />
                                {/* Scanlines */}
                                {[1, 2, 3, 4].map(si => (
                                    <path key={si}
                                        transform={`matrix(0.866 0.5 0 1 ${n.tx} 0)`}
                                        d={`M0,${n.ty + (n.H / 5) * si} h${n.W}`}
                                        stroke="#ffffff07" strokeWidth="1" />
                                ))}
                                {/* Tag */}
                                <text x={n.tx + n.W * 0.866 * 0.5} y={n.ty + n.W * 0.5 * 0.5 + 7}
                                    textAnchor="middle" fontSize="5" fill={hot ? '#ff6200' : '#ffffff25'}
                                    fontFamily="monospace" letterSpacing="1.5"
                                    style={{ transition: 'fill 0.2s' }}>{n.tag}</text>
                                {/* Label */}
                                <text x={n.tx + n.W * 0.866 * 0.5} y={n.ty + n.W * 0.5 * 0.5 + n.H / 2 + 1}
                                    textAnchor="middle" fontSize={isAI ? '8.5' : '6.5'}
                                    fill={hot ? '#fff' : '#ffffff50'} fontFamily="monospace"
                                    fontWeight={isAI ? 'bold' : 'normal'}
                                    style={{ transition: 'fill 0.2s' }}>{n.label}</text>
                                {/* LED */}
                                {[0, 1, 2].map(li => {
                                    const lx = n.tx + (6 + li * 7) * 0.866;
                                    const ly = n.ty + (6 + li * 7) * 0.5 + n.H - 9;
                                    return <circle key={li} cx={lx} cy={ly} r={2}
                                        fill={li === 0 && hot ? n.led : '#ffffff18'}
                                        style={{ filter: li === 0 && hot ? `drop-shadow(0 0 4px ${n.led})` : 'none', transition: 'all 0.2s' }} />;
                                })}
                                {/* Top face */}
                                <path transform={`matrix(0.866 0.5 -0.866 0.5 ${n.tx} ${n.ty})`}
                                    d={`M0,0 h${n.W} v${n.D} h-${n.W} Z`}
                                    fill={hot ? '#181818' : '#0d0d0d'} stroke={bc} strokeWidth={hot ? '1.2' : '0.6'}
                                    style={{ transition: 'all 0.2s' }} />
                                {/* Top grid */}
                                <path transform={`matrix(0.866 0.5 -0.866 0.5 ${n.tx} ${n.ty})`}
                                    d={`M${n.W * 0.5},0 v${n.D} M0,${n.D * 0.5} h${n.W}`}
                                    stroke="#ffffff07" strokeWidth="1" />
                                {/* Top glow dot */}
                                {hot && <>
                                    <circle cx={p.topCenter.x} cy={p.topCenter.y} r={12}
                                        fill="#ff6200" fillOpacity="0.14" style={{ filter: 'blur(7px)' }} />
                                    <circle cx={p.topCenter.x} cy={p.topCenter.y} r={3.5}
                                        fill="#ff6200" style={{ filter: 'drop-shadow(0 0 7px #ff6200)' }} />
                                    <circle cx={p.topCenter.x} cy={p.topCenter.y} r={1.2} fill="#fff" />
                                </>}
                            </g>
                        );
                    })}

                    {/* ── AI ANTENNA ── */}
                    {(() => {
                        const ai = NODES.find(n => n.id === 'ai')!;
                        const p = cubePoints(ai.tx, ai.ty, ai.W, ai.D, ai.H);
                        const hot = hotNodes.has('ai');
                        const ax = p.fr.x - 5, ay = p.fr.y - 2;
                        return (
                            <g>
                                <line x1={ax} y1={ay} x2={ax} y2={ay - 36}
                                    stroke={hot ? '#ff6200' : '#ffffff28'} strokeWidth="1.8"
                                    style={{ filter: hot ? 'drop-shadow(0 0 5px #ff6200)' : 'none', transition: 'all 0.3s' }} />
                                {[10, 19, 28].map((off, i) => (
                                    <line key={i} x1={ax - (6 - i * 1.5)} y1={ay - off} x2={ax + (6 - i * 1.5)} y2={ay - off}
                                        stroke={hot ? '#ff620070' : '#ffffff18'} strokeWidth="1"
                                        style={{ transition: 'stroke 0.3s' }} />
                                ))}
                                <circle cx={ax} cy={ay - 36} r={hot ? 7 : 5}
                                    fill="none" stroke={hot ? '#ff6200' : '#ffffff25'} strokeWidth="1.2"
                                    style={{ filter: hot ? 'drop-shadow(0 0 6px #ff6200)' : 'none', transition: 'all 0.3s' }} />
                                <circle cx={ax} cy={ay - 36} r={2.5}
                                    fill={hot ? '#ff6200' : '#ffffff35'}
                                    style={{ filter: hot ? 'drop-shadow(0 0 9px #ff6200)' : 'none', transition: 'all 0.3s' }} />
                                {hot && mounted && [1, 2].map(ri => {
                                    const pr = ((tick * 1.5 + ri * 9) % 22);
                                    return <circle key={ri} cx={ax} cy={ay - 36} r={pr}
                                        fill="none" stroke="#ff6200" strokeWidth="0.8"
                                        strokeOpacity={1 - pr / 22} />;
                                })}
                            </g>
                        );
                    })()}

                    {/* ── FLOATING METRICS PANEL ── */}
                    <motion.g
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <rect x={340} y={40} width={130} height={86} rx={10}
                            fill="url(#ha-panel)" stroke="#ffffff14" strokeWidth="1" />
                        <rect x={340} y={40} width={130} height={86} rx={10}
                            fill="none" stroke="#ff620018" strokeWidth="1" />
                        {/* Header */}
                        <rect x={340} y={40} width={130} height={18} rx={10} fill="#ff620015" />
                        <circle cx={353} cy={49} r={3.5} fill="#ff6200"
                            style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />
                        <text x={361} y={54} fontSize="7" fill="#ff6200" fontFamily="monospace" letterSpacing="1">
                            WORKFLOW ACTIVE
                        </text>
                        {/* Metrics */}
                        {[
                            { l: 'NODES', v: '8 live' },
                            { l: 'LATENCY', v: '43ms avg' },
                            { l: 'SUCCESS', v: '99.8%' },
                            { l: 'RUNS', v: '12,481' },
                        ].map((s, i) => (
                            <g key={i}>
                                <text x={348} y={72 + i * 15} fontSize="6" fill="#ffffff28"
                                    fontFamily="monospace" letterSpacing="0.5">{s.l}</text>
                                <text x={466} y={72 + i * 15} fontSize="6" fill="#ffffff75"
                                    fontFamily="monospace" textAnchor="end">{s.v}</text>
                                <line x1={346} y1={76 + i * 15} x2={468} y2={76 + i * 15}
                                    stroke="#ffffff07" strokeWidth="1" />
                            </g>
                        ))}
                        {/* Connector to AI node */}
                        <line x1={340} y1={75} x2={253} y2={145}
                            stroke="#ff620025" strokeWidth="1" strokeDasharray="3 5" />
                        <circle cx={340} cy={75} r={2} fill="#ff6200" fillOpacity="0.5" />
                    </motion.g>

                    {/* ── LEFT STRUCTURAL ACCENT ── */}
                    <line x1={30} y1={200} x2={30} y2={370} stroke="#ff620035" strokeWidth="1" strokeDasharray="4 8" />
                    <circle cx={30} cy={200} r={4} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 5px #ff6200)' }} />

                </svg>
            </motion.div>
        </div>
    );
}
