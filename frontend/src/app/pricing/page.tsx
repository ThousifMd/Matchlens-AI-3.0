import * as React from "react";
import Navbar from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import Footer from "@/components/Footer";

export default function PricingPage() {
    const ctaHref = "/onboarding";

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Glass morphism background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0E0E0F] to-black"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#d4ae36]/5 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#d4ae36]/3 via-transparent to-transparent"></div>

            <Navbar ctaHref={ctaHref} />

            <main className="relative z-10">
                {/* Pricing Section */}
                <div id="pricing-section">
                    <PricingSection />
                </div>
            </main>

            <Footer
                customersCount={2847}
                rating={4.9}
                trustCopy="GDPR‑compliant • Secure checkout"
            />
        </div>
    );
}