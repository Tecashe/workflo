"use client";
import { useState, useEffect } from 'react';

export function F5Security() {
    const [pulse, setPulse] = useState(0);
    const [locked, setLocked] = useState(true);
    const [hovered, setHovered] = useState(false);

    // Animate pulse rings every 2s
    useEffect(() => {
        const t = setInterval(() => setPulse(p => (p + 1) % 3), 700);
        return () => clearInterval(t);
    }, []);

    const handleToggle = () => {
        setLocked(p => !p);
    };

    return (
        <div className="relative bg-[#111111] rounded-[28px] sm:rounded-[32px] lg:rounded-[38px] xl:rounded-[46px] h-[460px] sm:h-[480px] md:h-[500px] lg:h-[620px] xl:h-[660px] overflow-hidden">

            {/* Top left text */}
            <div className="absolute top-0 left-0 right-0 px-5 sm:px-6 lg:px-7 pt-6 sm:pt-7 lg:pt-[32px] xl:pt-[38px]">
                <h3 className="text-xl sm:text-2xl lg:text-[30px] xl:text-[36px] leading-snug lg:leading-[34px] xl:leading-[40px] text-white font-normal mb-2 lg:mb-3">
                    Built for security,<br />by design
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-[#7D7D87] leading-[17px] sm:leading-[19px] lg:leading-[22px]">
                    AES-256 encrypted credentials. Zero plaintext exposure. Ever.
                </p>
            </div>

            {/* Isometric vault illustration */}
            <div
                className="absolute inset-0 flex items-center justify-center pt-28 sm:pt-32 lg:pt-36"
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovered(true); }}
                onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHovered(false); }}
                onClick={handleToggle}
            >
                <svg
                    viewBox="0 0 320 260"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer w-full h-full max-w-none"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <linearGradient id="sec-grad-a" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                            <stop stopColor="#ff6200" />
                            <stop offset="1" stopColor="#993b00" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="sec-grad-b" x1="1" y1="0" x2="0" y2="0" gradientUnits="objectBoundingBox">
                            <stop stopColor="#ff6200" />
                            <stop offset="1" stopColor="#993b00" stopOpacity="0" />
                        </linearGradient>
                        <filter id="sec-glow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* === ISOMETRIC PLATFORM BASE (flat ground) === */}
                    {/* Left face of base platform */}
                    <path
                        transform="matrix(0.86603 0.5 0 1 48 170)"
                        d="M0 0 h120 v30 h-120Z"
                        fill="#0D0D0D" stroke="#ffffff20" strokeWidth="1"
                    />
                    {/* Right face of base platform */}
                    <path
                        transform="matrix(0.86603 -0.5 0 1 151.96 185)"
                        d="M0 0 h80 v30 h-80Z"
                        fill="#080808" stroke="#ffffff15" strokeWidth="1"
                    />
                    {/* Top face of base platform */}
                    <path
                        transform="matrix(0.86603 0.5 -0.86603 0.5 48 170)"
                        d="M0 0 h120 v80 h-120Z"
                        fill="#141414" stroke="#ffffff18" strokeWidth="1"
                    />

                    {/* === VAULT BODY - LEFT FACE === */}
                    <path
                        transform="matrix(0.86603 0.5 0 1 60 60)"
                        d="M0 0 h110 v110 h-110Z"
                        fill="#0f0f0f"
                        stroke="#fff"
                        strokeWidth="1"
                        strokeDasharray="5 5"
                    />
                    {/* === VAULT BODY - TOP FACE === */}
                    <path
                        transform="matrix(0.86603 0.5 -0.86603 0.5 60 60)"
                        d="M0 0 h110 v80 h-110Z"
                        fill="#161616"
                        stroke="#fff"
                        strokeWidth="1"
                        strokeDasharray="5 5"
                    />
                    {/* === VAULT BODY - RIGHT FACE === */}
                    <path
                        transform="matrix(0.86603 -0.5 0 1 155.27 115)"
                        d="M0 0 h80 v110 h-80Z"
                        fill="#0c0c0c"
                        stroke="#fff"
                        strokeWidth="0.5"
                        strokeDasharray="5 5"
                    />

                    {/* === VAULT DOOR PANEL (on left face) === */}
                    <path
                        transform="matrix(0.86603 0.5 0 1 80 78)"
                        d="M0 0 h72 v72 h-72Z"
                        fill="#191919"
                        stroke="#ffffff30"
                        strokeWidth="1"
                    />

                    {/* === DIAL / WHEEL (isometric circle on door) === */}
                    {/* Outer ring */}
                    <ellipse
                        cx="136" cy="133"
                        rx="26" ry="14"
                        fill="none"
                        stroke={hovered || !locked ? "#ff6200" : "#ffffff40"}
                        strokeWidth="2"
                        style={{
                            filter: (hovered || !locked) ? 'drop-shadow(0 0 8px #ff6200)' : 'none',
                            transition: 'all 0.4s ease'
                        }}
                    />
                    {/* Inner ring */}
                    <ellipse
                        cx="136" cy="133"
                        rx="16" ry="8.5"
                        fill="none"
                        stroke={hovered || !locked ? "#ff6200" : "#ffffff30"}
                        strokeWidth="1.5"
                        style={{
                            filter: (hovered || !locked) ? 'drop-shadow(0 0 5px #ff6200)' : 'none',
                            transition: 'all 0.4s ease'
                        }}
                    />
                    {/* Center dial dot */}
                    <ellipse
                        cx="136" cy="133"
                        rx="4" ry="2.2"
                        fill={hovered || !locked ? "#ff6200" : "#ffffff50"}
                        style={{
                            filter: (hovered || !locked) ? 'drop-shadow(0 0 8px #ff6200)' : 'none',
                            transition: 'all 0.4s ease'
                        }}
                    />
                    {/* Dial notch indicators (4 marks on rim) */}
                    {[0, 90, 180, 270].map((deg, i) => {
                        const angle = (deg * Math.PI) / 180;
                        const x1 = 136 + Math.cos(angle) * 20;
                        const y1 = 133 + Math.sin(angle) * 10.5;
                        const x2 = 136 + Math.cos(angle) * 24;
                        const y2 = 133 + Math.sin(angle) * 12.5;
                        return (
                            <line
                                key={i}
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke={hovered || !locked ? "#ff6200" : "#ffffff40"}
                                strokeWidth="1.5"
                                style={{ transition: 'stroke 0.4s ease' }}
                            />
                        );
                    })}

                    {/* === HANDLE BAR === */}
                    <rect
                        x="165" y="126" width="8" height="14" rx="3"
                        fill={locked ? "#ffffff20" : "#ff6200"}
                        stroke={locked ? "#ffffff30" : "#ff6200"}
                        strokeWidth="1"
                        style={{ transition: 'all 0.4s ease', filter: locked ? 'none' : 'drop-shadow(0 0 6px #ff6200)' }}
                    />

                    {/* === ANIMATED PULSE RINGS (emanate from vault when unlocked) === */}
                    {!locked && [0, 1, 2].map((i) => (
                        <ellipse
                            key={i}
                            cx="136" cy="133"
                            rx={26 + (pulse === i ? 36 : pulse > i ? 46 : 16)}
                            ry={14 + (pulse === i ? 19 : pulse > i ? 24 : 8)}
                            fill="none"
                            stroke="#ff6200"
                            strokeWidth="1"
                            style={{
                                opacity: pulse === i ? 0.6 : 0.1,
                                transition: 'all 0.7s ease',
                                filter: 'drop-shadow(0 0 4px #ff6200)'
                            }}
                        />
                    ))}

                    {/* === ORANGE ACCENT EDGES (top of vault edge, angled) === */}
                    {/* Front top edge — orange */}
                    <path
                        transform="matrix(0.86603 0.5 -0.86603 0.5 60 60)"
                        d="M0 0 h110"
                        stroke="url(#sec-grad-a)"
                        strokeWidth="1.5"
                        style={{
                            filter: 'drop-shadow(0 0 6px #ff6200)',
                        }}
                    />
                    {/* Right edge — orange fade */}
                    <path
                        transform="matrix(0.86603 -0.5 0 1 155.27 115)"
                        d="M0 0 v110"
                        stroke="url(#sec-grad-b)"
                        strokeWidth="1.5"
                        style={{
                            filter: 'drop-shadow(0 0 4px #ff6200)',
                        }}
                    />

                    {/* === ORANGE NODE CONNECTORS at vault corners === */}
                    <circle cx="60" cy="115" r="5" fill="#000" stroke="#ff6200" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 6px #ff6200)' }} />
                    <circle cx="60" cy="170" r="5" fill="#000" stroke="#ff6200" strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 4px #ff6200)' }} />

                    {/* === HORIZONTAL GRID LINES ON VAULT FLOOR === */}
                    {[0, 1, 2, 3].map(i => (
                        <path
                            key={i}
                            transform={`matrix(0.86603 0.5 -0.86603 0.5 60 ${170 + i * 15})`}
                            d="M0 0 h120"
                            stroke="#ffffff10"
                            strokeWidth="1"
                            strokeDasharray="4 6"
                        />
                    ))}

                    {/* === STATUS label (locked / unlocked) — bottom area === */}
                    <text
                        x="136" y="240"
                        textAnchor="middle"
                        fontSize="10"
                        fill={locked ? "#ffffff40" : "#ff6200"}
                        fontFamily="monospace"
                        letterSpacing="2"
                        style={{ transition: 'fill 0.4s ease' }}
                    >
                        {locked ? "● ENCRYPTED" : "○ DECRYPTING..."}
                    </text>
                </svg>
            </div>
        </div>
    );
}
