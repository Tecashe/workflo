'use client';

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function AnimatedNumber({ value }: { value: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const spring = useSpring(0, { duration: 2500, bounce: 0 });
    const [display, setDisplay] = useState("0");

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    useEffect(() => {
        return spring.on("change", (latest) => {
            if (value > 999) {
                setDisplay(Math.floor(latest).toLocaleString());
            } else if (value < 100) {
                setDisplay(latest.toFixed(2));
            } else {
                setDisplay(Math.floor(latest).toString());
            }
        });
    }, [spring, value]);

    return <span ref={ref}>{display}</span>;
}

export function StatsSection() {
    return (
        <section className="relative py-24 lg:py-32 bg-[#151515] overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(ellipse at center, rgba(240,77,38,0.08) 0%, transparent 70%)',
            }} />

            <div className="relative z-10 w-[92%] md:w-[88%] lg:w-[90%] max-w-[1240px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-centertext-center md:items-start md:text-left px-4 lg:px-8 py-8 md:py-0"
                    >
                        <h4 className="text-[50px] lg:text-[72px] font-serif font-medium text-white tracking-tighter leading-none mb-4 flex items-baseline">
                            <AnimatedNumber value={99.99} />
                            <span className="text-3xl lg:text-4xl text-[#F04D26] ml-1">%</span>
                        </h4>
                        <p className="text-[#A1A1AA] text-lg lg:text-xl font-medium">Uptime SLA guarantee<br className="hidden md:block" /> for enterprise execution.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex flex-col items-centertext-center md:items-start md:text-left px-4 lg:px-12 py-8 md:py-0"
                    >
                        <h4 className="text-[50px] lg:text-[72px] font-serif font-medium text-white tracking-tighter leading-none mb-4 flex items-baseline">
                            <AnimatedNumber value={100} />
                            <span className="text-3xl lg:text-4xl text-[#F04D26] ml-1">M+</span>
                        </h4>
                        <p className="text-[#A1A1AA] text-lg lg:text-xl font-medium">Nodes executed successfully<br className="hidden md:block" /> every single day.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col items-centertext-center md:items-start md:text-left px-4 lg:px-12 py-8 md:py-0"
                    >
                        <h4 className="text-[50px] lg:text-[72px] font-serif font-medium text-white tracking-tighter leading-none mb-4 flex items-baseline">
                            <AnimatedNumber value={500} />
                            <span className="text-3xl lg:text-4xl text-[#F04D26] ml-1">ms</span>
                        </h4>
                        <p className="text-[#A1A1AA] text-lg lg:text-xl font-medium">Average end-to-end latency<br className="hidden md:block" /> for triggered events.</p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
