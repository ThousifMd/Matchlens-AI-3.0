"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shield } from "lucide-react";
import { usePackage, Package } from "@/contexts/PackageContext";
import { trackAddToCart, trackCTAClick } from "@/lib/metaPixel";


const pricingTiers = [
  {
    id: "get-noticed",
    name: "Get Noticed",
    price: 14.99,
    originalPrice: 37,
    discount: "Save 60%",
    description: "Perfect for getting started",
    benefit: "Quick upgrade to make your profile stand out instantly.",
    features: [
      "5 enhanced photos",
      "3 style variations",
      "Basic bio tips",
      "Private and secure"
    ],
    buttonText: "Make my profile irresistible",
    popular: false,
    mobileOrder: 2
  },
  {
    id: "most-matches",
    name: "Most Attention",
    price: 27.99,
    originalPrice: 69,
    discount: "Most Popular",
    description: "Most popular choice",
    benefit: "Our proven package that triples your responses fast.",
    features: [
      "10 enhanced photos",
      "6 style variations",
      "Bio optimization",
      "Profile strategy guide",
      "Private and secure"
    ],
    buttonText: "Make my profile irresistible",
    popular: true,
    mobileOrder: 1
  },
  {
    id: "date-ready",
    name: "Complete Makeover",
    price: 38.99,
    originalPrice: 97,
    discount: "Save 60%",
    description: "Ultimate transformation",
    benefit: "Full profile makeover so you're ready for real dates, not just swipes.",
    features: [
      "20 enhanced photos",
      "10 style variations",
      "Complete profile makeover",
      "Bio optimization",
      "Message templates",
      "Private and secure"
    ],
    buttonText: "Make my profile irresistible",
    popular: false,
    mobileOrder: 3
  }
];

export const PricingSection = () => {
  const { selectedPackage, setSelectedPackage } = usePackage();
  const [localSelectedPackage, setLocalSelectedPackage] = React.useState<string | null>(null);
  // Simplified authentication - always allow checkout
  const isSignedIn = true;
  const isLoaded = true;

  const handlePackageSelect = (packageId: string) => {
    setLocalSelectedPackage(packageId);
    const packageData = pricingTiers.find(tier => tier.id === packageId);
    if (packageData) {
      trackAddToCart(packageData.name, packageData.price);
    }
  };

  const handleGetStarted = (packageId: string) => {
    const packageData = pricingTiers.find(tier => tier.id === packageId);
    if (packageData) {
      // Track CTA click
      trackCTAClick(`Get Started - ${packageData.name}`, "Pricing Section");
      // Set global selection
      setSelectedPackage(packageData);
      // Store selected package in localStorage for payment page
      localStorage.setItem('selectedPackage', packageId);

      // Always redirect to checkout (no authentication required)
      console.log('Redirecting to checkout');
      window.location.href = '/checkout';
    }
  };


  return (
    <section className="py-16 lg:py-24" aria-labelledby="pricing-title">
      <div className="container">
        {/* Main Container with Glass Morphism */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-transparent to-[#FFD700]/5 rounded-3xl blur-3xl"></div>

            <div className="relative z-10">


              <h2
                id="pricing-title"
                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 bg-gradient-to-r from-white via-white to-[#FFD700] bg-clip-text text-transparent"
              >
                Pricing
              </h2>

              <div className="max-w-3xl mx-auto">
                <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed mb-4">
                  Why spend <span className="text-red-400 font-bold line-through">$400+</span> on headshots and bio coaching?
                </p>
                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-6">
                  For a fraction of that, we'll transform your online presence into a <span className="text-[#FFD700] font-bold">magnetic profile</span>.
                </p>
                <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 backdrop-blur-sm border border-[#FFD700]/30 rounded-2xl px-6 py-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">Most users see</span>
                  </div>
                  <span className="text-2xl font-bold text-[#FFD700]">3x more attention</span>
                  <span className="text-gray-300">in 7 days</span>
                </div>
                <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/30 rounded-2xl px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">💯 Money-back guarantee</span>
                  </div>
                  <span className="text-green-400 font-bold">Contact within 7 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12 mb-8 items-stretch">
            {pricingTiers
              .map((tier) => (
                <Card
                  key={tier.name}
                  className={`relative group transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer flex flex-col h-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 hover:border-[#FFD700]/30 hover:shadow-[#FFD700]/20 ${localSelectedPackage === tier.id
                    ? "border-2 border-[#FFD700] shadow-lg shadow-[#FFD700]/30"
                    : "border border-white/10 shadow-sm"
                    } ${tier.mobileOrder === 1 ? 'order-1 md:order-none' : tier.mobileOrder === 2 ? 'order-2 md:order-none' : tier.mobileOrder === 3 ? 'order-3 md:order-none' : 'order-4 md:order-none'}`}
                  role="article"
                  aria-label={`${tier.name} pricing plan`}
                  onClick={() => handlePackageSelect(tier.id)}
                >
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black px-4 py-1.5 font-medium">
                      {tier.discount}
                    </Badge>
                  </div>

                  <CardHeader className="text-center pb-2 h-48 flex flex-col justify-center items-center">
                    <div>
                      <CardTitle className="text-xl font-heading font-bold text-white mb-2">
                        {tier.name}
                      </CardTitle>
                      <CardDescription className="text-gray-300 mb-4">
                        {tier.description}
                      </CardDescription>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-4xl lg:text-5xl font-heading font-bold text-white">
                          ${tier.price}
                        </span>
                        <div className="text-sm text-gray-400">
                          <div className="line-through">Was ${tier.originalPrice}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 border-l-2 border-[#d4ae36] pl-4">
                      <p className="text-sm text-gray-300 italic">
                        "{tier.benefit}"
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2 flex flex-col flex-grow">
                    <ul className="space-y-2 mb-4 flex-grow px-3" role="list">
                      {tier.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3"
                          role="listitem"
                        >
                          <Check
                            className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#FFD700]"
                            aria-hidden="true"
                          />
                          <span className="text-white text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {tier.id === "most-matches" ? (
                      <div className="mt-auto">
                        <Link href="/checkout">
                          <button
                            className="w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-[#FFD700] hover:text-white"
                            onClick={() => {
                              console.log('Pricing CTA clicked - redirecting to checkout!');
                              setSelectedPackage(tier);
                              localStorage.setItem('selectedPackage', tier.id);
                              trackCTAClick("Make My Profile Irresistible", "Pricing Section");
                            }}
                          >
                            Make my profile irresistible
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-auto">
                        <Link href="/checkout">
                          <button
                            className="w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-[#FFD700] hover:text-white"
                            onClick={() => {
                              console.log('Pricing CTA 2 clicked - redirecting to checkout!');
                              setSelectedPackage(tier);
                              localStorage.setItem('selectedPackage', tier.id);
                              trackCTAClick("Make My Profile Irresistible", "Pricing Section 2");
                            }}
                          >
                            Make my profile irresistible
                          </button>
                        </Link>
                      </div>
                    )}
                    {/* Temporarily disabled SignedIn section */}
                  </CardContent>
                </Card>
              ))}
          </div>

        </div>
      </div>

    </section >
  );
};