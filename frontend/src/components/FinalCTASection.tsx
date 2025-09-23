"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const FinalCTASection: React.FC = () => {
    const router = useRouter();

    const handleCTAClick = () => {
        window.location.href = '/onboarding';
    };

    return (
        <section className="py-24 px-4 max-w-6xl mx-auto">
            {/* Main Container with Glass Morphism */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">

                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-8">
                        "Don't be invisible. Be the person people actually notice online"
                    </h2>

                    {/* CTA Button */}
                    <Link href="/onboarding">
                        <button
                            onClick={() => {
                                console.log('Final CTA clicked - redirecting to onboarding!');
                            }}
                            className="relative h-auto min-h-[52px] md:min-h-[48px] px-6 md:px-8 py-4 md:py-3 rounded-lg font-semibold text-base md:text-lg bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#FFD700]/20 overflow-hidden group touch-manipulation w-full md:w-auto cursor-pointer"
                            aria-label="Upgrade my photos"
                        >
                            {/* Glass morphism background with flowing colors */}
                            <div className="absolute inset-0 rounded-lg overflow-hidden">
                                {/* Gold wave from left */}
                                <div className="absolute top-0 left-0 w-full h-full">
                                    <div className="w-full h-full bg-gradient-to-r from-[#FFD700]/60 via-[#FFD700]/40 to-transparent opacity-90"
                                        style={{
                                            animation: 'flowingWaveLeft 3s ease-in-out infinite'
                                        }}>
                                    </div>
                                </div>

                                {/* Pink wave from right */}
                                <div className="absolute top-0 right-0 w-full h-full">
                                    <div className="w-full h-full bg-gradient-to-l from-[#FF69B4]/60 via-[#FF69B4]/40 to-transparent opacity-90"
                                        style={{
                                            animation: 'flowingWaveRight 3s ease-in-out infinite'
                                        }}>
                                    </div>
                                </div>
                            </div>

                            <span className="relative z-20 text-white font-bold drop-shadow-lg">Upgrade my photos</span>
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
