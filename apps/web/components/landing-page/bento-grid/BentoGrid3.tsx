import type { ReactNode } from "react";
import { F7NeuralCore } from "./F7NeuralCore";

type BentoShellProps = {
    children: ReactNode;
    outerRadius: string;
    midRadius: string;
    innerRadius: string;
};

function BentoShell({ children, outerRadius, midRadius, innerRadius }: BentoShellProps) {
    return (
        <div className={`bg-[#1A1A1A] p-[5px] ${outerRadius}`}>
            <div className={`border border-white/10 p-[2px] ${midRadius}`}>
                <div className={`overflow-hidden border border-white/5 ${innerRadius}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export function BentoGrid3() {
    return (
        <div className="relative z-10 w-full max-w-[1200px] xl:max-w-[1240px] mx-auto px-2 sm:px-3 md:px-4 lg:px-0">
            <BentoShell
                outerRadius="rounded-[32px] sm:rounded-[36px] lg:rounded-[42px] xl:rounded-[50px]"
                midRadius="rounded-[29px] sm:rounded-[33px] lg:rounded-[39px] xl:rounded-[47px]"
                innerRadius="rounded-[26px] sm:rounded-[30px] lg:rounded-[36px] xl:rounded-[44px]"
            >
                <F7NeuralCore />
            </BentoShell>
        </div>
    );
}
