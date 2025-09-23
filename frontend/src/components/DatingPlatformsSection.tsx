"use client";

export default function DatingPlatformsSection() {
    const platforms = [
        {
            name: "Tinder",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Tinder_logo_2019.svg/1200px-Tinder_logo_2019.svg.png"
        },
        {
            name: "Bumble",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Bumble_logo.svg/1200px-Bumble_logo.svg.png"
        },
        {
            name: "Hinge",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Hinge_logo.svg/1200px-Hinge_logo.svg.png"
        },
        {
            name: "Match",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Match_logo.svg/1200px-Match_logo.svg.png"
        },
        {
            name: "OkCupid",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/OkCupid-Logo.svg/1200px-OkCupid-Logo.svg.png"
        },
        {
            name: "Coffee Meets Bagel",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Coffee_Meets_Bagel_logo.svg/1200px-Coffee_Meets_Bagel_logo.svg.png"
        },
        {
            name: "Plenty of Fish",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Plenty_of_Fish_logo.svg/1200px-Plenty_of_Fish_logo.svg.png"
        },
        {
            name: "eHarmony",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Eharmony_logo.svg/1200px-Eharmony_logo.svg.png"
        },
        {
            name: "Zoosk",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Zoosk_logo.svg/1200px-Zoosk_logo.svg.png"
        },
        {
            name: "Elite Singles",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/EliteSingles_logo.svg/1200px-EliteSingles_logo.svg.png"
        },
    ];

    return (
        <div className="py-16 bg-black/50 backdrop-blur-sm border-y border-white/10">
            <div className="container">
                <h3 className="text-center text-2xl font-bold text-white mb-8 tracking-wider">
                    SUCCESSFULLY TESTED AND APPROVED ON
                </h3>

                <div className="relative overflow-hidden">
                    {/* Scrolling container */}
                    <div className="flex animate-scroll space-x-20 items-center">
                        {/* First set of platforms */}
                        {platforms.map((platform, index) => (
                            <div
                                key={`first-${index}`}
                                className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity duration-300"
                            >
                                <span className="text-white font-semibold text-lg px-4">
                                    {platform.name}
                                </span>
                            </div>
                        ))}

                        {/* Second set for seamless scrolling */}
                        {platforms.map((platform, index) => (
                            <div
                                key={`second-${index}`}
                                className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity duration-300"
                            >
                                <span className="text-white font-semibold text-lg px-4">
                                    {platform.name}
                                </span>
                            </div>
                        ))}

                        {/* Third set for extra smoothness */}
                        {platforms.map((platform, index) => (
                            <div
                                key={`third-${index}`}
                                className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity duration-300"
                            >
                                <span className="text-white font-semibold text-lg px-4">
                                    {platform.name}
                                </span>
                            </div>
                        ))}

                        {/* Fourth set for perfect seamless loop */}
                        {platforms.map((platform, index) => (
                            <div
                                key={`fourth-${index}`}
                                className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity duration-300"
                            >
                                <span className="text-white font-semibold text-lg px-4">
                                    {platform.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
