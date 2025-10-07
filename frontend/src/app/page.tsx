import * as React from "react";
import { Suspense, lazy } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { DatingAppContext } from "@/components/DatingAppContext";
import { StatsSection } from "@/components/StatsSection";
import Footer from "@/components/Footer";
import { MobileStickyCTA } from "@/components/MobileStickyCTA";

// Lazy load below-the-fold components
const DatingPlatformsSection = lazy(() => import("@/components/DatingPlatformsSection"));
const SimpleProcessSection = lazy(() => import("@/components/SimpleProcessSection").then(module => ({ default: module.SimpleProcessSection })));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection").then(module => ({ default: module.TestimonialsSection })));
const CompaniesSection = lazy(() => import("@/components/CompaniesSection"));
const FAQSection = lazy(() => import("@/components/FAQSection").then(module => ({ default: module.FAQSection })));
const FinalCTASection = lazy(() => import("@/components/FinalCTASection").then(module => ({ default: module.FinalCTASection })));

export default function HomePage() {
  const ctaHref = "/pricing";

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Glass morphism background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0E0E0F] to-black"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#d4ae36]/5 via-transparent to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#d4ae36]/3 via-transparent to-transparent"></div>

      <Navbar ctaHref={ctaHref} />

      <main className="relative z-10">
        {/* Hero section - above the fold */}
        <div className="pt-16">
          <HeroSection
            ctaHref={ctaHref}
            className="mx-auto"
          />
        </div>

        {/* Dating App Context Section */}
        <DatingAppContext />

        {/* Stats Section */}
        <StatsSection />

        {/* Simple Process Section */}
        <Suspense fallback={<div className="py-16"></div>}>
          <SimpleProcessSection />
        </Suspense>

        {/* Dating Platforms Section */}
        <Suspense fallback={<div className="py-16"></div>}>
          <DatingPlatformsSection />
        </Suspense>

        {/* Testimonials Section */}
        <Suspense fallback={<div className="py-16"></div>}>
          <TestimonialsSection />
        </Suspense>

        {/* Companies Section */}
        <Suspense fallback={<div className="py-16"></div>}>
          <CompaniesSection />
        </Suspense>

        {/* FAQ Section */}
        <Suspense fallback={<div className="py-16"></div>}>
          <FAQSection />
        </Suspense>

        {/* Final CTA Section */}
        <Suspense fallback={<div className="py-16"></div>}>
          <FinalCTASection />
        </Suspense>
      </main>

      <Footer
        customersCount={2847}
        rating={4.9}
        trustCopy="GDPR‑compliant • Secure checkout"
      />

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA
        href="/onboarding"
        customersCount={2847}
      />
    </div>
  );
}