'use client';

import { motion } from "framer-motion";
import {
    SiStripe, SiSlack, SiGithub, SiDiscord,
    SiNotion, SiOpenai, SiTwilio, SiSendgrid,
    SiMailchimp, SiHubspot, SiJira, SiLinear
} from "react-icons/si";

const INTEGRATIONS = [
    { icon: <SiStripe className="w-8 h-8" />, name: "Stripe" },
    { icon: <SiSlack className="w-8 h-8" />, name: "Slack" },
    { icon: <SiGithub className="w-8 h-8" />, name: "GitHub" },
    { icon: <SiDiscord className="w-8 h-8" />, name: "Discord" },
    { icon: <SiNotion className="w-8 h-8" />, name: "Notion" },
    { icon: <SiOpenai className="w-8 h-8" />, name: "OpenAI" },
    { icon: <SiTwilio className="w-8 h-8" />, name: "Twilio" },
    { icon: <SiSendgrid className="w-8 h-8" />, name: "SendGrid" },
    { icon: <SiMailchimp className="w-8 h-8" />, name: "Mailchimp" },
    { icon: <SiHubspot className="w-8 h-8" />, name: "HubSpot" },
    { icon: <SiJira className="w-8 h-8" />, name: "Jira" },
    { icon: <SiLinear className="w-8 h-8" />, name: "Linear" },
];

// Duplicate for seamless infinite scroll
const SCROLL_ITEMS = [...INTEGRATIONS, ...INTEGRATIONS];

export function IntegrationsMarquee() {
    return (
        <section className="relative py-20 bg-[#151515] overflow-hidden border-y border-white/5">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 z-10 bg-gradient-to-r from-[#151515] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 z-10 bg-gradient-to-l from-[#151515] to-transparent pointer-events-none" />

            <div className="flex flex-col items-center mb-12">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-sm font-medium tracking-widest text-[#7D7D87] uppercase mb-4"
                >
                    Connect your entire stack
                </motion.p>
                <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-3xl text-white font-medium text-center max-w-xl px-4"
                >
                    Trigger workflows from any event. Push data to any destination.
                </motion.h3>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 35, // Adjust speed
                        ease: "linear",
                        repeat: Infinity
                    }}
                    className="flex flex-nowrap gap-12 md:gap-20 items-center px-6 md:px-10"
                >
                    {SCROLL_ITEMS.map((item, idx) => (
                        <div
                            key={`${item.name}-${idx}`}
                            className="flex flex-col items-center justify-center gap-3 w-max opacity-40 hover:opacity-100 transition-opacity duration-300 group-hover:opacity-20 hover:!opacity-100 cursor-default"
                        >
                            <div className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                {item.icon}
                            </div>
                            <span className="text-xs font-medium text-white/70">{item.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Reverse direction row */}
            <div className="relative flex overflow-x-hidden group mt-16">
                <motion.div
                    animate={{ x: ["-50%", "0%"] }}
                    transition={{
                        duration: 40,
                        ease: "linear",
                        repeat: Infinity
                    }}
                    className="flex flex-nowrap gap-12 md:gap-20 items-center px-6 md:px-10"
                >
                    {[...SCROLL_ITEMS].reverse().map((item, idx) => (
                        <div
                            key={`rev-${item.name}-${idx}`}
                            className="flex flex-col items-center justify-center gap-3 w-max opacity-40 hover:opacity-100 transition-opacity duration-300 group-hover:opacity-20 hover:!opacity-100 cursor-default"
                        >
                            <div className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                {item.icon}
                            </div>
                            <span className="text-xs font-medium text-white/70">{item.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
