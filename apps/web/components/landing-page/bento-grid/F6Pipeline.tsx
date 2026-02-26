"use client";
import { useState, useEffect } from 'react';

// Isometric pipeline / execution flow section
// Shows data packets flowing through a stylised isometric pipe/network grid
export function F6Pipeline() {
    const [tick, setTick] = useState(0);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setTick(p => (p + 1) % 12), 180);
        return () => clearInterval(t);
    }, []);

    // Node positions in screen space (isometric projected)
    const nodes = [
        { id: 'trigger', cx: 72, cy: 170, label: 'Trigger' },
        { id: 'enrich', cx: 148, cy: 128, label: 'Enrich' },
        { id: 'ai', cx: 224, cy: 86, label: 'AI' },
        { id: 'route', cx: 224, cy: 170, label: 'Route' },
        { id: 'output', cx: 300, cy: 128, label: 'Output' },
    ];

    const edges = [
        { from: nodes[0]!, to: nodes[1]!, delay: 0 },
        { from: nodes[1]!, to: nodes[2]!, delay: 3 },
        { from: nodes[1]!, to: nodes[3]!, delay: 6 },
        { from: nodes[2]!, to: nodes[4]!, delay: 9 },
        { from: nodes[3]!, to: nodes[4]!, delay: 6 },
    ];

    const PACKET_STEPS = 10;

    return (
        <div className="relative bg-[#111111] rounded-[28px] sm:rounded-[32px] lg:rounded-[38px] xl:rounded-[46px] h-[460px] sm:h-[480px] md:h-[500px] lg:h-[620px] xl:h-[660px] overflow-hidden">

            {/* Bottom-left text */}
            <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-6 lg:px-7 xl:px-8 pb-5 sm:pb-6 lg:pb-7 xl:pb-8">
                <h3 className="text-xl sm:text-2xl lg:text-[30px] xl:text-[36px] leading-snug lg:leading-[34px] xl:leading-[40px] text-white font-normal mb-2 lg:mb-3">
                    Watch your data move in real time
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-[#7D7D87] leading-[17px] sm:leading-[19px] lg:leading-[22px]">
                    Every execution step tracked. Every packet traced. No black boxes.
                </p>
            </div>

            {/* Isometric pipeline SVG */}
            <div
                className="absolute inset-0 flex items-center justify-center pb-36 sm:pb-40 lg:pb-44"
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovered(true); }}
                onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHovered(false); }}
            >
                <svg
                    viewBox="0 0 372 280"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full max-w-none"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <linearGradient id="pipe-orange-lr" x1="0" y1=".5" x2="1" y2=".5" gradientUnits="objectBoundingBox">
                            <stop stopColor="#ff6200" />
                            <stop offset="1" stopColor="#993b00" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="pipe-orange-rl" x1="1" y1=".5" x2="0" y2=".5" gradientUnits="objectBoundingBox">
                            <stop stopColor="#ff6200" />
                            <stop offset="1" stopColor="#993b00" stopOpacity="0" />
                        </linearGradient>
                        <filter id="pipe-glow-filter">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* === ISOMETRIC BASE GRID PLATFORM === */}
                    {/* Horizontal grid lines (top face of platform) */}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <path
                            key={`hg-${i}`}
                            transform={`matrix(0.86603 0.5 -0.86603 0.5 36 ${200 + i * 12})`}
                            d="M0 0 h300"
                            stroke="#ffffff08"
                            strokeWidth="1"
                            strokeDasharray="4 8"
                        />
                    ))}
                    {/* Vertical grid lines */}
                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <path
                            key={`vg-${i}`}
                            transform={`matrix(0.86603 0.5 -0.86603 0.5 ${36 + i * 42} 200)`}
                            d="M0 0 v60"
                            stroke="#ffffff08"
                            strokeWidth="1"
                            strokeDasharray="4 8"
                        />
                    ))}

                    {/* === PIPELINE TUBES (isometric-ish connector rails) === */}
                    {edges.map((edge, i) => {
                        const x1 = edge.from.cx;
                        const y1 = edge.from.cy;
                        const x2 = edge.to.cx;
                        const y2 = edge.to.cy;
                        const len = Math.hypot(x2 - x1, y2 - y1);

                        // Draw the tube as two rails slightly offset
                        return (
                            <g key={i}>
                                {/* Lower rail */}
                                <line
                                    x1={x1} y1={y1 + 2}
                                    x2={x2} y2={y2 + 2}
                                    stroke="#ffffff12"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                                {/* Top rail (brighter) */}
                                <line
                                    x1={x1} y1={y1}
                                    x2={x2} y2={y2}
                                    stroke="#ffffff20"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeDasharray="6 4"
                                />
                                {/* Orange accent line */}
                                <line
                                    x1={x1} y1={y1}
                                    x2={x2} y2={y2}
                                    stroke="#ff6200"
                                    strokeWidth="1"
                                    strokeOpacity={hovered ? 0.5 : 0.25}
                                    strokeLinecap="round"
                                    strokeDasharray="3 80"
                                    style={{ transition: 'stroke-opacity 0.4s' }}
                                />

                                {/* === ANIMATED PACKET ALONG EDGE === */}
                                {(() => {
                                    const stepInCycle = (tick - edge.delay + 12) % 12;
                                    const progress = stepInCycle / PACKET_STEPS;
                                    if (progress < 0 || progress > 1) return null;
                                    const px = x1 + (x2 - x1) * progress;
                                    const py = y1 + (y2 - y1) * progress;
                                    return (
                                        <g key={`pkt-${i}`}>
                                            {/* Glow halo */}
                                            <circle cx={px} cy={py} r={8}
                                                fill="#ff6200"
                                                fillOpacity="0.12"
                                                style={{ filter: 'blur(4px)' }}
                                            />
                                            {/* Packet dot */}
                                            <circle cx={px} cy={py} r={3.5}
                                                fill="#ff6200"
                                                style={{ filter: 'drop-shadow(0 0 5px #ff6200)' }}
                                            />
                                        </g>
                                    );
                                })()}
                            </g>
                        );
                    })}

                    {/* === NODE BOXES (isometric mini-panels) === */}
                    {nodes.map((node, i) => {
                        const isActive = edges.some(
                            e => {
                                const stepInCycle = (tick - e.delay + 12) % 12;
                                const progress = stepInCycle / PACKET_STEPS;
                                return (e.from.id === node.id || e.to.id === node.id) && progress >= 0 && progress <= 1;
                            }
                        );
                        const W = 38;
                        const H = 18;

                        return (
                            <g key={node.id} transform={`translate(${node.cx - W / 2}, ${node.cy - H / 2})`}>
                                {/* Top face of isometric node box */}
                                <path
                                    transform={`matrix(0.86603 0.5 -0.86603 0.5 0 0)`}
                                    d={`M0 0 h${W} v${H} h-${W}Z`}
                                    fill={isActive ? "#1a1a1a" : "#131313"}
                                    stroke={isActive ? "#ff6200" : "#ffffff25"}
                                    strokeWidth={isActive ? "1.5" : "1"}
                                    style={{
                                        filter: isActive ? 'drop-shadow(0 0 6px #ff6200)' : 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                                {/* Front face */}
                                <path
                                    transform={`matrix(0.86603 0.5 0 1 0 0)`}
                                    d={`M0 0 h${W} v10 h-${W}Z`}
                                    fill={isActive ? "#141414" : "#0e0e0e"}
                                    stroke={isActive ? "#ff620050" : "#ffffff15"}
                                    strokeWidth="1"
                                    style={{ transition: 'all 0.2s ease' }}
                                />
                                {/* Node label */}
                                <text
                                    x={W / 2} y={H / 2 + 1}
                                    textAnchor="middle" dominantBaseline="middle"
                                    fontSize="7"
                                    fill={isActive ? "#ff6200" : "#ffffff55"}
                                    fontFamily="monospace"
                                    letterSpacing="0.5"
                                    style={{ transition: 'fill 0.2s ease' }}
                                >
                                    {node.label}
                                </text>
                                {/* Status dot */}
                                <circle
                                    cx={W - 4} cy={4}
                                    r={2}
                                    fill={isActive ? "#ff6200" : "#ffffff20"}
                                    style={{
                                        filter: isActive ? 'drop-shadow(0 0 4px #ff6200)' : 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                            </g>
                        );
                    })}

                    {/* === ORANGE GLOW HALOS at active edge sources === */}
                    <circle cx={nodes[0]!.cx} cy={nodes[0]!.cy} r={12}
                        fill="#ff6200"
                        fillOpacity={hovered ? "0.12" : "0.06"}
                        style={{ filter: 'blur(6px)', transition: 'fill-opacity 0.4s' }}
                    />

                    {/* === ISOMETRIC FLOATING LABEL PLANES === */}
                    {/* "LIVE" pill at top right */}
                    <rect x={280} y={58} width={48} height={16} rx={8}
                        fill="#ff620015" stroke="#ff6200" strokeWidth="1"
                    />
                    <circle cx={292} cy={66} r={3} fill="#ff6200"
                        style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }}
                    />
                    <text x={299} y={70}
                        fontSize="7" fill="#ff6200"
                        fontFamily="monospace" letterSpacing="1"
                    >
                        LIVE
                    </text>

                    {/* === VERTICAL COLUMN LINES (depth rails) === */}
                    {nodes.map((node, i) => (
                        <line
                            key={`rail-${i}`}
                            x1={node.cx} y1={node.cy + 16}
                            x2={node.cx} y2={node.cy + 50}
                            stroke="#ffffff08"
                            strokeWidth="1"
                            strokeDasharray="3 5"
                        />
                    ))}

                    {/* === ORANGE CORNER CONNECTORS === */}
                    <circle cx={36} cy={200} r={5} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 6px #ff6200)' }} />
                    <circle cx={336} cy={200} r={5} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />

                    {/* Platform front-left edge — orange */}
                    <path
                        transform="matrix(0.86603 0.5 -0.86603 0.5 36 200)"
                        d="M0 0 h300"
                        stroke="url(#pipe-orange-lr)"
                        strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 5px #ff6200)' }}
                    />
                </svg>
            </div>
        </div>
    );
}
