"use client";
import { motion } from "framer-motion";

// ─── Original mechanic: 3 independent SVG layers animated apart with framer-motion ───
// Original geometry: flat dense rhombus-mesh grids
// NEW geometry: isometric hexagonal orbit rings — three concentric "data halo" tiers
// that explode apart vertically, like a planet with its rings separating.

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const DUR = 0.9;
const DELAY = 0.55;

// Y offsets for explosion — same distances as original (±108)
const FINAL_Y = { top: -110, mid: 0, bot: 110 } as const;

// Shared gap between layers (for connecting dash lines)
const CONNECTOR_X = [{ x: 328, topY: 215 }, { x: -154, topY: 215 }] as const;
const LINE_H = 110;

interface HeroAnimationProps { className?: string; }

// ─── A single connector dashed line between layers ─────────────────────────
function VLine({ x, top, delay }: { x: number; top: number; delay: number }) {
    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{ left: `calc(50% + ${x}px)`, top, transformOrigin: 'top center' }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: DUR, ease: EASE_OUT, delay }}
        >
            <svg width="2" height={LINE_H} viewBox={`0 0 2 ${LINE_H}`} fill="none">
                <line x1="1" y1="0" x2="1" y2={LINE_H} stroke="#FFFFFF" strokeDasharray="8 8" strokeWidth="1" />
            </svg>
        </motion.div>
    );
}

// ─── TOP LAYER: a dense isometric honeycomb ring ─────────────────────────────
// Bright white/grey — the "crown" tier
function TopRing() {
    return (
        <svg width="661" height="300" viewBox="0 0 661 300" fill="none" aria-hidden>
            {/* Outer solid hexagonal ring — top face */}
            <path d="M330.5 28 L498 125 L498 225 L330.5 322 L163 225 L163 125 Z"
                fill="#111" stroke="#555" strokeWidth="1" />
            {/* Inner ring */}
            <path d="M330.5 82 L454 152 L454 208 L330.5 278 L207 208 L207 152 Z"
                fill="#0d0d0d" stroke="#444" strokeWidth="1" />
            {/* Isometric top-face hex segments — radial spokes */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const r1 = 120, r2 = 190;
                const a = (deg * Math.PI) / 180;
                // isometric projection: y *= 0.5
                const x1 = 330.5 + r1 * Math.cos(a);
                const y1 = 150 + r1 * Math.sin(a) * 0.5;
                const x2 = 330.5 + r2 * Math.cos(a);
                const y2 = 150 + r2 * Math.sin(a) * 0.5;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#ffffff20" strokeWidth="1.5" />;
            })}
            {/* Concentric iso-ellipses */}
            {[48, 80, 112, 150].map((ry, i) => (
                <ellipse key={i} cx={330.5} cy={150} rx={ry * 1.73} ry={ry} fill="none"
                    stroke={i === 3 ? "#ffffff22" : "#ffffff10"} strokeWidth={i === 3 ? 1.5 : 1}
                    strokeDasharray={i % 2 === 0 ? "6 8" : "none"} />
            ))}
            {/* Dense mesh nodes at ring intersections */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const a = (deg * Math.PI) / 180;
                return [84, 120, 157].map((r, j) => {
                    const x = 330.5 + r * 1.73 * Math.cos(a);
                    const y = 150 + r * Math.sin(a) * 0.5;
                    return <circle key={`${i}-${j}`} cx={x} cy={y} r={j === 0 ? 3.5 : 2}
                        fill={j === 0 ? "#1e1e1e" : "#141414"}
                        stroke={j === 0 ? "#666" : "#444"} strokeWidth="1" />;
                });
            }).flat()}
            {/* Orange accent corners */}
            {[0, 120, 240].map((deg, i) => {
                const a = (deg * Math.PI) / 180;
                const x = 330.5 + 172 * 1.73 * Math.cos(a);
                const y = 150 + 172 * Math.sin(a) * 0.5;
                return <circle key={i} cx={x} cy={y} r={5}
                    fill="#000" stroke="#ff6200" strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0 0 5px #ff6200)' }} />;
            })}
        </svg>
    );
}

// ─── MIDDLE LAYER: the broadest, most detailed ring — the "equator" ────────
function MidRing() {
    return (
        <svg width="661" height="340" viewBox="0 0 661 340" fill="none" aria-hidden>
            {/* Thick outer iso-ellipse — the "floor" plane */}
            <ellipse cx={330.5} cy={170} rx={290} ry={148}
                fill="#111" stroke="#3a3a3a" strokeWidth="1.5" />
            <ellipse cx={330.5} cy={170} rx={220} ry={112}
                fill="#0d0d0d" stroke="#2e2e2e" strokeWidth="1" />
            <ellipse cx={330.5} cy={170} rx={150} ry={76}
                fill="#0a0a0a" stroke="#282828" strokeWidth="1" />
            {/* Radial lines — 12 spokes */}
            {Array.from({ length: 12 }).map((_, i) => {
                const a = ((i * 30) * Math.PI) / 180;
                const x1 = 330.5 + 76 * 1.95 * Math.cos(a);
                const y1 = 170 + 76 * Math.sin(a) * 0.51;
                const x2 = 330.5 + 148 * 1.95 * Math.cos(a);
                const y2 = 170 + 148 * Math.sin(a) * 0.51;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#ffffff12" strokeWidth="1" />;
            })}
            {/* Dense arc segments — bandwidth bars between the rings */}
            {Array.from({ length: 24 }).map((_, i) => {
                const a1 = ((i * 15) * Math.PI) / 180;
                const a2 = (((i * 15) + 10) * Math.PI) / 180;
                const r1 = 155, r2 = 218;
                // 4 points for filled band
                const x1 = 330.5 + r1 * 1.9 * Math.cos(a1);
                const y1 = 170 + r1 * Math.sin(a1) * 0.52;
                const x2 = 330.5 + r1 * 1.9 * Math.cos(a2);
                const y2 = 170 + r1 * Math.sin(a2) * 0.52;
                const x3 = 330.5 + r2 * 1.9 * Math.cos(a2);
                const y3 = 170 + r2 * Math.sin(a2) * 0.52;
                const x4 = 330.5 + r2 * 1.9 * Math.cos(a1);
                const y4 = 170 + r2 * Math.sin(a1) * 0.52;
                const active = i % 3 === 0;
                return <polygon key={i}
                    points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
                    fill={active ? "#1e1e1e" : "#141414"}
                    stroke={active ? "#ff6200" : "#333"}
                    strokeWidth={active ? "1.2" : "0.5"} />;
            })}
            {/* Orange connector dots every 60° */}
            {[30, 90, 150, 210, 270, 330].map((deg, i) => {
                const a = (deg * Math.PI) / 180;
                const x = 330.5 + 230 * 1.9 * Math.cos(a);
                const y = 170 + 230 * Math.sin(a) * 0.52;
                return <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 5 : 3.5}
                    fill="#000" stroke="#ff6200" strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0 0 5px #ff6200)' }} />;
            })}
            {/* Orange arc accent — one bright segment */}
            <path
                d={`M ${330.5 + 290 * Math.cos(0.2)} ${170 + 148 * Math.sin(0.2)}
                    A 290 148 0 0 1 ${330.5 + 290 * Math.cos(0.9)} ${170 + 148 * Math.sin(0.9)}`}
                fill="none" stroke="#ff6200" strokeWidth="2.5" strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px #ff6200)' }} />
        </svg>
    );
}

// ─── BOTTOM LAYER: thin sparse rings — the "base" plinth ──────────────────
// Dark, subdued — the foundation plane beneath
function BotRing() {
    return (
        <svg width="661" height="280" viewBox="0 0 661 280" fill="none" aria-hidden>
            {/* Ghost thin ellipses */}
            {[110, 145, 180, 215, 250].map((rx, i) => (
                <ellipse key={i} cx={330.5} cy={140} rx={rx * 1.85} ry={rx * 0.52}
                    fill="none" stroke="#ffffff08" strokeWidth={i === 4 ? 1.5 : 1}
                    strokeDasharray={i % 2 === 0 ? "5 7" : "none"} />
            ))}
            {/* Dense dot ring */}
            {Array.from({ length: 36 }).map((_, i) => {
                const a = ((i * 10) * Math.PI) / 180;
                const x = 330.5 + 200 * 1.85 * Math.cos(a);
                const y = 140 + 200 * 0.52 * Math.sin(a);
                return <circle key={i} cx={x} cy={y} r={1.5}
                    fill="#ffffff15" />;
            })}
            {/* Crosses at 4 cardinal points */}
            {[0, 90, 180, 270].map((deg, i) => {
                const a = (deg * Math.PI) / 180;
                const x = 330.5 + 245 * 1.85 * Math.cos(a);
                const y = 140 + 245 * 0.52 * Math.sin(a);
                return (
                    <g key={i}>
                        <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke="#444" strokeWidth="1.5" />
                        <line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke="#444" strokeWidth="1.5" />
                        <circle cx={x} cy={y} r={3} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                            style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />
                    </g>
                );
            })}
            {/* Sparse radial dashes — like a radar grid */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                const a = (deg * Math.PI) / 180;
                const x1 = 330.5 + 72 * 1.85 * Math.cos(a);
                const y1 = 140 + 72 * 0.52 * Math.sin(a);
                const x2 = 330.5 + 245 * 1.85 * Math.cos(a);
                const y2 = 140 + 245 * 0.52 * Math.sin(a);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#ffffff08" strokeWidth="1" strokeDasharray="4 8" />;
            })}
            {/* Orange accent left/right edge */}
            <path
                d={`M ${330.5 + 250 * 1.85} ${140}
                    A ${250 * 1.85} ${250 * 0.52} 0 0 1 ${330.5 + 250 * 1.85 * Math.cos(0.4)} ${140 + 250 * 0.52 * Math.sin(0.4)}`}
                fill="none" stroke="url(#bot-grad)" strokeWidth="2" strokeLinecap="round" />
            <defs>
                <linearGradient id="bot-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop stopColor="#ff6200" />
                    <stop offset="1" stopColor="#ff6200" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export function HeroAnimation({ className = "" }: HeroAnimationProps) {
    return (
        <div className={`relative ${className}`}>
            <div className="flex flex-col items-center mt-16">

                {/* ── TOP RING: shoots upward ── */}
                <motion.div className="relative z-30 flex justify-center"
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: FINAL_Y.top, opacity: 1 }}
                    transition={{ duration: DUR, ease: EASE_OUT, delay: DELAY }}>
                    <TopRing />
                </motion.div>

                {/* ── CONNECTOR LINES top→mid ── */}
                <div className="absolute inset-0 z-25 pointer-events-none">
                    {CONNECTOR_X.map((c, i) => (
                        <VLine key={i} x={c.x} top={c.topY} delay={DELAY} />
                    ))}
                </div>

                {/* ── MIDDLE RING: stays in place ── */}
                <div className="relative z-20 flex justify-center -mt-64 ml-14">
                    <MidRing />
                </div>

                {/* ── CONNECTOR LINES mid→bot ── */}
                <div className="absolute inset-0 z-15 pointer-events-none">
                    {CONNECTOR_X.map((c, i) => (
                        <VLine key={i} x={c.x} top={c.topY + LINE_H + 80} delay={DELAY} />
                    ))}
                </div>

                {/* ── BOTTOM RING: sinks downward ── */}
                <motion.div className="relative z-10 flex justify-center -mt-64 ml-3"
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: FINAL_Y.bot, opacity: 1 }}
                    transition={{ duration: DUR, ease: EASE_OUT, delay: DELAY }}>
                    <BotRing />
                </motion.div>

            </div>
        </div>
    );
}
