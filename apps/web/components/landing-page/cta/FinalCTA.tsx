'use client';

import { motion } from "framer-motion";

export function FinalCTA() {
    return (
        <section className="relative py-32 lg:py-48 bg-[#151515] overflow-hidden flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="w-[800px] h-[800px] bg-[#F04D26]/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-serif leading-[1.1] tracking-tight text-white mb-6">
                        Stop coding <br />
                        <span className="italic text-white/50">integration glue.</span>
                    </h2>

                    <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-12 leading-relaxed">
                        Deploy production-grade internal workflows in minutes. Get retries, structured logging, and crash-recovery out of the box.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="/signup"
                            className="group relative inline-flex items-center justify-center gap-2 bg-[#F04D26] text-white rounded-[14px] px-8 h-14 text-lg font-medium shadow-[0_0_40px_rgba(240,77,38,0.3)] hover:shadow-[0_0_60px_rgba(240,77,38,0.5)] transition-all duration-300 active:scale-[0.98] overflow-hidden"
                        >
                            <span className="relative z-10">Start Building for Free</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="relative z-10 size-5 transition-transform duration-300 ease-out group-hover:translate-x-1">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.167 10h11.666m-5-5 5 5-5 5"></path>
                            </svg>
                            {/* Inner shine effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </a>

                        <a
                            href="/docs"
                            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-[14px] px-8 h-14 text-lg font-medium border border-white/10 transition-colors duration-200 active:scale-[0.98]"
                        >
                            Read the Docs
                        </a>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </section>
    );
}
