"use client";
import { useState, useEffect } from 'react';

// Helper: compute screen coords for an isometric node cube
//   tx, ty = top-left of left face in screen space
//   W = width, D = depth, H = height (all isometric units)
function cubePoints(tx: number, ty: number, W: number, D: number, H: number) {
    const rw = W * 0.866, rh = W * 0.5; // right-step of width
    const dw = D * 0.866, dh = D * 0.5; // right-step of depth
    return {
        // left face corners
        fl: { x: tx, y: ty },                      // front-left (top)
        fr: { x: tx + rw, y: ty + rh },             // front-right (top)
        br: { x: tx + rw, y: ty + rh + H },         // front-right (bottom)
        bl: { x: tx, y: ty + H },                   // front-left (bottom)
        // top face back corners
        tbl: { x: tx - dw, y: ty - dh },            // back-left (top)
        tbr: { x: tx + rw - dw, y: ty + rh - dh },  // back-right (top)
        // right face far corner
        rfar: { x: tx + rw + dw, y: ty + rh - dh }, // far right corner (top)
        rfarB: { x: tx + rw + dw, y: ty + rh - dh + H }, // far right corner (bottom)
        // center of top face (approx)
        topCenter: { x: tx + (rw - dw) / 2, y: ty + (rh - dh) / 2 },
        // center of left face
        leftCenter: { x: tx + rw / 2, y: ty + rh / 2 + H / 2 },
    };
}

const NODES = [
    { id: 'trigger', label: 'Webhook', tag: 'TRIGGER', tx: 55, ty: 152, W: 50, D: 38, H: 56, ledColor: '#ff6200' },
    { id: 'ai', label: 'AI Core', tag: 'AI', tx: 162, ty: 78, W: 60, D: 48, H: 84, ledColor: '#a78bfa' },
    { id: 'transform', label: 'Transform', tag: 'UTIL', tx: 265, ty: 118, W: 46, D: 35, H: 50, ledColor: '#60a5fa' },
    { id: 'condition', label: 'Route', tag: 'LOGIC', tx: 148, ty: 210, W: 46, D: 35, H: 48, ledColor: '#34d399' },
    { id: 'whatsapp', label: 'WhatsApp', tag: 'OUTPUT', tx: 250, ty: 218, W: 50, D: 38, H: 36, ledColor: '#25D366' },
    { id: 'email', label: 'Email', tag: 'OUTPUT', tx: 54, ty: 228, W: 42, D: 32, H: 32, ledColor: '#f472b6' },
];

// Edges: from/to screen-space anchor points + travel delay (ticks)
const EDGES = [
    { id: 'e1', x1: 98, y1: 179, x2: 162, y2: 152, fromId: 'trigger', toId: 'ai', delay: 0 },
    { id: 'e2', x1: 214, y1: 120, x2: 265, y2: 118, fromId: 'ai', toId: 'transform', delay: 5 },
    { id: 'e3', x1: 214, y1: 162, x2: 148, y2: 210, fromId: 'ai', toId: 'condition', delay: 10 },
    { id: 'e4', x1: 194, y1: 234, x2: 250, y2: 218, fromId: 'condition', toId: 'whatsapp', delay: 15 },
    { id: 'e5', x1: 148, y1: 210, x2: 96, y2: 228, fromId: 'condition', toId: 'email', delay: 15 },
];

const TOTAL_TICKS = 22;
const PACKET_TICKS = 8;

export function F7NeuralCore() {
    const [tick, setTick] = useState(0);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => {
        const t = setInterval(() => setTick(p => (p + 1) % TOTAL_TICKS), 155);
        return () => clearInterval(t);
    }, []);

    // Which nodes are "hot" (receiving/sending a packet this tick)
    const hotNodes = new Set<string>();
    EDGES.forEach(e => {
        const step = (tick - e.delay + TOTAL_TICKS) % TOTAL_TICKS;
        if (step < PACKET_TICKS) {
            hotNodes.add(e.fromId);
            if (step > PACKET_TICKS - 2) hotNodes.add(e.toId);
        }
    });

    return (
        <div className="relative bg-[#111111] rounded-[28px] sm:rounded-[32px] lg:rounded-[38px] xl:rounded-[46px] h-[500px] sm:h-[520px] md:h-[540px] lg:h-[640px] xl:h-[680px] overflow-hidden">

            {/* Bottom text */}
            <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-6 lg:px-7 xl:px-8 pb-5 sm:pb-6 lg:pb-7 xl:pb-8 z-10">
                <h3 className="text-xl sm:text-2xl lg:text-[30px] xl:text-[36px] leading-snug text-white font-normal mb-2 lg:mb-3">
                    Your entire workflow,<br />in one living graph
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-[#7D7D87] leading-[17px] sm:leading-[19px] lg:leading-[22px]">
                    Every node, every connection, every execution — visible in real time.
                </p>
            </div>

            {/* Main isometric SVG */}
            <div className="absolute inset-0 flex items-center justify-center mt-[-24px]">
                <svg
                    viewBox="0 0 400 310"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[320px] h-[248px] sm:w-[350px] sm:h-[272px] md:w-[370px] md:h-[287px] lg:w-[400px] lg:h-[310px] xl:w-[430px] xl:h-[334px]"
                >
                    <defs>
                        <linearGradient id="nc-lr" x1="0" y1=".5" x2="1" y2=".5" gradientUnits="objectBoundingBox">
                            <stop stopColor="#ff6200" /><stop offset="1" stopColor="#ff6200" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="nc-rl" x1="1" y1=".5" x2="0" y2=".5" gradientUnits="objectBoundingBox">
                            <stop stopColor="#ff6200" /><stop offset="1" stopColor="#ff6200" stopOpacity="0" />
                        </linearGradient>
                        <filter id="nc-blur-sm"><feGaussianBlur stdDeviation="2.5" /></filter>
                        <filter id="nc-blur-lg"><feGaussianBlur stdDeviation="5" /></filter>
                    </defs>

                    {/* ── GROUND GRID ── */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <path key={`gh-${i}`}
                            transform={`matrix(0.866 0.5 -0.866 0.5 50 ${270 + i * 10})`}
                            d="M0 0 h310" stroke="#ffffff07" strokeWidth="1" strokeDasharray="4 8" />
                    ))}
                    {Array.from({ length: 10 }).map((_, i) => (
                        <path key={`gv-${i}`}
                            transform={`matrix(0.866 0.5 -0.866 0.5 ${50 + i * 31} 270)`}
                            d="M0 0 v80" stroke="#ffffff07" strokeWidth="1" strokeDasharray="4 8" />
                    ))}
                    {/* Ground orange front-edge */}
                    <path transform="matrix(0.866 0.5 -0.866 0.5 50 270)" d="M0 0 h310"
                        stroke="url(#nc-lr)" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />
                    <circle cx={50} cy={270} r={4.5} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 6px #ff6200)' }} />
                    <circle cx={317.5} cy={270} r={4.5} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />

                    {/* ── NODE SHADOWS (ellipses on ground) ── */}
                    {NODES.map(n => {
                        const p = cubePoints(n.tx, n.ty, n.W, n.D, n.H);
                        const gx = (p.bl.x + p.br.x) / 2;
                        const gy = p.bl.y + 12;
                        return (
                            <ellipse key={`sh-${n.id}`} cx={gx} cy={gy}
                                rx={n.W * 0.5} ry={n.W * 0.18}
                                fill="#000" fillOpacity="0.5"
                                style={{ filter: 'blur(6px)' }} />
                        );
                    })}

                    {/* ── CONDUIT LINES (draw behind nodes) ── */}
                    {EDGES.map(e => (
                        <g key={`conduit-${e.id}`}>
                            {/* Thick dark rail */}
                            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                                stroke="#ffffff0a" strokeWidth="5" strokeLinecap="round" />
                            {/* Dashed white rail */}
                            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                                stroke="#ffffff18" strokeWidth="1.5" strokeLinecap="round"
                                strokeDasharray="5 5" />
                            {/* Orange centerline */}
                            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                                stroke="#ff6200" strokeWidth="0.75" strokeOpacity="0.3" strokeLinecap="round" />
                            {/* End caps */}
                            <circle cx={e.x1} cy={e.y1} r={3} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                                style={{ filter: 'drop-shadow(0 0 5px #ff6200)' }} />
                            <circle cx={e.x2} cy={e.y2} r={3} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                                style={{ filter: 'drop-shadow(0 0 5px #ff6200)' }} />
                        </g>
                    ))}

                    {/* ── ANIMATED DATA PACKETS ── */}
                    {EDGES.map(e => {
                        const step = (tick - e.delay + TOTAL_TICKS) % TOTAL_TICKS;
                        const progress = step / PACKET_TICKS;
                        if (progress < 0 || progress > 1) return null;
                        const px = e.x1 + (e.x2 - e.x1) * progress;
                        const py = e.y1 + (e.y2 - e.y1) * progress;
                        return (
                            <g key={`pkt-${e.id}`}>
                                {/* Glow halo */}
                                <circle cx={px} cy={py} r={12} fill="#ff6200" fillOpacity="0.08"
                                    style={{ filter: 'blur(5px)' }} />
                                {/* Bright core */}
                                <circle cx={px} cy={py} r={4} fill="#ff6200"
                                    style={{ filter: 'drop-shadow(0 0 8px #ff6200)' }} />
                                {/* White hot center */}
                                <circle cx={px} cy={py} r={1.5} fill="#fff" />
                                {/* Trail */}
                                {[0.08, 0.16, 0.24].map((offset, ti) => {
                                    const tp = Math.max(0, progress - offset);
                                    const tx2 = e.x1 + (e.x2 - e.x1) * tp;
                                    const ty2 = e.y1 + (e.y2 - e.y1) * tp;
                                    return (
                                        <circle key={ti} cx={tx2} cy={ty2} r={2 - ti * 0.5}
                                            fill="#ff6200" fillOpacity={0.4 - ti * 0.12} />
                                    );
                                })}
                            </g>
                        );
                    })}

                    {/* ── ISOMETRIC NODE CUBES ── */}
                    {NODES.map(n => {
                        const p = cubePoints(n.tx, n.ty, n.W, n.D, n.H);
                        const isHot = hotNodes.has(n.id) || hoveredId === n.id;
                        const isAI = n.id === 'ai';
                        const borderCol = isHot ? '#ff6200' : '#ffffff22';
                        const faceCol = isHot ? (isAI ? '#191212' : '#131313') : (isAI ? '#141414' : '#0e0e0e');
                        const topCol = isHot ? '#1a1a1a' : '#111111';

                        return (
                            <g key={n.id}
                                style={{ cursor: 'pointer' }}
                                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHoveredId(n.id); }}
                                onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHoveredId(null); }}
                            >
                                {/* ── RIGHT FACE ── */}
                                <path
                                    transform={`matrix(0.866 -0.5 0 1 ${p.fr.x} ${p.fr.y})`}
                                    d={`M0,0 h${n.D} v${n.H} h-${n.D} Z`}
                                    fill="#080808"
                                    stroke={borderCol}
                                    strokeWidth={isHot ? '1' : '0.5'}
                                    style={{ transition: 'stroke 0.25s ease, fill 0.25s ease' }}
                                />

                                {/* ── LEFT FACE ── */}
                                <path
                                    transform={`matrix(0.866 0.5 0 1 ${n.tx} ${n.ty})`}
                                    d={`M0,0 h${n.W} v${n.H} h-${n.W} Z`}
                                    fill={faceCol}
                                    stroke={borderCol}
                                    strokeWidth={isHot ? '1.5' : '1'}
                                    style={{
                                        filter: isHot ? `drop-shadow(0 0 8px #ff620055)` : 'none',
                                        transition: 'all 0.25s ease'
                                    }}
                                />

                                {/* ── SCAN LINES on left face ── */}
                                {Array.from({ length: 5 }).map((_, si) => {
                                    const sy = n.ty + (n.H / 6) * (si + 1);
                                    return (
                                        <path key={`sl-${n.id}-${si}`}
                                            transform={`matrix(0.866 0.5 0 1 ${n.tx} 0)`}
                                            d={`M0,${sy} h${n.W}`}
                                            stroke="#ffffff08" strokeWidth="1" />
                                    );
                                })}

                                {/* ── LED ROW on left face (bottom area) ── */}
                                {[n.ledColor, '#ffffff30', '#ffffff20'].map((col, li) => {
                                    // Transform a point (lx, ly) in face-local space → screen space
                                    const lfx = 6 + li * 7;
                                    const lfy = n.H - 8;
                                    const sx = n.tx + lfx * 0.866;
                                    const sy = n.ty + lfx * 0.5 + lfy;
                                    return (
                                        <circle key={`led-${n.id}-${li}`} cx={sx} cy={sy} r={2}
                                            fill={li === 0 && isHot ? n.ledColor : col}
                                            style={{
                                                filter: li === 0 && isHot ? `drop-shadow(0 0 4px ${n.ledColor})` : 'none',
                                                transition: 'all 0.25s ease'
                                            }}
                                        />
                                    );
                                })}

                                {/* ── TAG label on left face (top strip) ── */}
                                <text
                                    x={n.tx + n.W * 0.866 * 0.5}
                                    y={n.ty + n.W * 0.5 * 0.5 + 7}
                                    textAnchor="middle" fontSize="5"
                                    fill={isHot ? '#ff6200' : '#ffffff30'}
                                    fontFamily="monospace"
                                    letterSpacing="1.5"
                                    style={{ transition: 'fill 0.25s ease' }}
                                >{n.tag}</text>

                                {/* ── Node label (center of left face) ── */}
                                <text
                                    x={n.tx + n.W * 0.866 * 0.5}
                                    y={n.ty + n.W * 0.5 * 0.5 + n.H / 2 + 1}
                                    textAnchor="middle" fontSize={isAI ? '8' : '6.5'}
                                    fill={isHot ? '#fff' : '#ffffff55'}
                                    fontFamily="monospace" fontWeight={isAI ? 'bold' : 'normal'}
                                    style={{ transition: 'fill 0.25s ease' }}
                                >{n.label}</text>

                                {/* ── TOP FACE ── */}
                                <path
                                    transform={`matrix(0.866 0.5 -0.866 0.5 ${n.tx} ${n.ty})`}
                                    d={`M0,0 h${n.W} v${n.D} h-${n.W} Z`}
                                    fill={topCol}
                                    stroke={borderCol}
                                    strokeWidth={isHot ? '1.2' : '0.8'}
                                    style={{ transition: 'all 0.25s ease' }}
                                />

                                {/* ── TOP FACE: grid decoration ── */}
                                {[0.33, 0.66].map((f, gi) => (
                                    <path key={`tg-${n.id}-${gi}`}
                                        transform={`matrix(0.866 0.5 -0.866 0.5 ${n.tx} ${n.ty})`}
                                        d={`M${n.W * f},0 v${n.D}`}
                                        stroke="#ffffff08" strokeWidth="1" />
                                ))}
                                {[0.5].map((f, gi) => (
                                    <path key={`tgh-${n.id}-${gi}`}
                                        transform={`matrix(0.866 0.5 -0.866 0.5 ${n.tx} ${n.ty})`}
                                        d={`M0,${n.D * f} h${n.W}`}
                                        stroke="#ffffff08" strokeWidth="1" />
                                ))}

                                {/* ── TOP FACE: active glow dot ── */}
                                {isHot && (
                                    <>
                                        <circle cx={p.topCenter.x} cy={p.topCenter.y} r={10}
                                            fill="#ff6200" fillOpacity="0.15"
                                            style={{ filter: 'blur(6px)' }} />
                                        <circle cx={p.topCenter.x} cy={p.topCenter.y} r={3}
                                            fill="#ff6200"
                                            style={{ filter: 'drop-shadow(0 0 6px #ff6200)' }} />
                                        <circle cx={p.topCenter.x} cy={p.topCenter.y} r={1}
                                            fill="#fff" />
                                    </>
                                )}
                            </g>
                        );
                    })}

                    {/* ── HOLOGRAPHIC PANEL (floating top-right) ── */}
                    <g>
                        {/* Panel background */}
                        <rect x={300} y={22} width={88} height={68} rx={8}
                            fill="#0d0d0d" stroke="#ffffff18" strokeWidth="1" />
                        <rect x={300} y={22} width={88} height={68} rx={8}
                            fill="none" stroke="#ff620020" strokeWidth="1" />
                        {/* Header row */}
                        <rect x={300} y={22} width={88} height={16} rx={8}
                            fill="#ff620012" />
                        <circle cx={311} cy={30} r={3} fill="#ff6200"
                            style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />
                        <text x={318} y={34} fontSize="6.5" fill="#ff6200"
                            fontFamily="monospace" letterSpacing="1">LIVE ENGINE</text>
                        {/* Stats */}
                        {[
                            { label: 'NODES', value: '6 active' },
                            { label: 'PACKETS', value: `${5 - ((tick % 5))} queued` },
                            { label: 'SUCCESS', value: '100%' },
                        ].map((s, i) => (
                            <g key={i}>
                                <text x={308} y={50 + i * 13} fontSize="5.5" fill="#ffffff30"
                                    fontFamily="monospace" letterSpacing="0.5">{s.label}</text>
                                <text x={384} y={50 + i * 13} fontSize="5.5" fill="#ffffff80"
                                    fontFamily="monospace" letterSpacing="0.5"
                                    textAnchor="end">{s.value}</text>
                                <line x1={306} y1={55 + i * 13} x2={386} y2={55 + i * 13}
                                    stroke="#ffffff08" strokeWidth="1" />
                            </g>
                        ))}
                        {/* Connector line to AI node */}
                        <line x1={300} y1={56} x2={230} y2={95}
                            stroke="#ff620030" strokeWidth="1" strokeDasharray="3 4" />
                        <circle cx={300} cy={56} r={2} fill="#ff6200" fillOpacity="0.5" />
                    </g>

                    {/* ── AI NODE: extra antenna tower ── */}
                    {(() => {
                        const ai = NODES.find(n => n.id === 'ai')!;
                        const p = cubePoints(ai.tx, ai.ty, ai.W, ai.D, ai.H);
                        const isHot = hotNodes.has('ai') || hoveredId === 'ai';
                        // Antenna rises from top-right of top face
                        const ax = p.fr.x - 4;
                        const ay = p.fr.y - 2;
                        return (
                            <g>
                                {/* Vertical antenna rod */}
                                <line x1={ax} y1={ay} x2={ax} y2={ay - 30}
                                    stroke={isHot ? '#ff6200' : '#ffffff30'} strokeWidth="1.5"
                                    style={{ filter: isHot ? 'drop-shadow(0 0 5px #ff6200)' : 'none', transition: 'all 0.3s' }} />
                                {/* Horizontal crossbars */}
                                {[10, 18, 26].map((off, i) => (
                                    <line key={i} x1={ax - (5 - i)} y1={ay - off}
                                        x2={ax + (5 - i)} y2={ay - off}
                                        stroke={isHot ? '#ff620080' : '#ffffff18'} strokeWidth="1"
                                        style={{ transition: 'stroke 0.3s' }} />
                                ))}
                                {/* Tip pulse ring */}
                                <circle cx={ax} cy={ay - 30} r={isHot ? 6 : 4}
                                    fill="none" stroke={isHot ? '#ff6200' : '#ffffff25'} strokeWidth="1"
                                    style={{ filter: isHot ? 'drop-shadow(0 0 6px #ff6200)' : 'none', transition: 'all 0.3s' }} />
                                <circle cx={ax} cy={ay - 30} r={2}
                                    fill={isHot ? '#ff6200' : '#ffffff40'}
                                    style={{ filter: isHot ? 'drop-shadow(0 0 8px #ff6200)' : 'none', transition: 'all 0.3s' }} />
                                {/* Two animated pulse rings */}
                                {isHot && [1, 2].map(ri => {
                                    const pulseR = ((tick * 1.5 + ri * 8) % 20);
                                    return (
                                        <circle key={ri} cx={ax} cy={ay - 30}
                                            r={pulseR} fill="none"
                                            stroke="#ff6200" strokeWidth="0.8"
                                            strokeOpacity={1 - pulseR / 20} />
                                    );
                                })}
                            </g>
                        );
                    })()}

                    {/* ── ORANGE STRUCTURAL ACCENT: front left edge of scene ── */}
                    <line x1={55} y1={152} x2={55} y2={270} stroke="#ff620040" strokeWidth="1"
                        strokeDasharray="4 8" />
                    <circle cx={55} cy={152} r={4} fill="#000" stroke="#ff6200" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 5px #ff6200)' }} />

                </svg>
            </div>
        </div>
    );
}
