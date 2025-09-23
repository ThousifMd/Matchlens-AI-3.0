"use client";

import { useState, useEffect } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { storePaymentData, storeOnboardingData, uploadFile, sanitizeFilename } from "@/lib/supabaseUtils";

// Custom styles for PayPal buttons
const paypalStyles = `
  .paypal-button-container {
    width: 100% !important;
    max-width: 600px !important;
    margin: 0 auto !important;
  }
  
  .paypal-button-container > div {
    width: 100% !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }
  
  .paypal-button-container button {
    border-radius: 12px !important;
    margin: 0 !important;
    height: 48px !important;
    font-weight: 600 !important;
    transition: all 0.2s ease !important;
  }
  
  .paypal-button-container button:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
  }
`;

interface SimplePayPalCheckoutProps {
    selectedPackage?: {
        id: string;
        name: string;
        price: number;
    };
    showNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
    onPaymentSuccess?: () => void;
    onboardingFormData?: any;
}

export default function SimplePayPalCheckout({ selectedPackage, showNotification, onPaymentSuccess, onboardingFormData }: SimplePayPalCheckoutProps) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [isPayPalLoaded, setIsPayPalLoaded] = useState(false);
    const [payPalError, setPayPalError] = useState<string | null>(null);

    // Debug: Check if PayPal client ID is available
    useEffect(() => {
        console.log('PayPal Client ID:', process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);
        console.log('PayPal Client ID exists:', !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);

        // Set a timeout to show PayPal buttons even if script takes time to load
        const timer = setTimeout(() => {
            setIsPayPalLoaded(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);
    const handleNotification = (type: 'success' | 'error' | 'info', message: string) => {
        if (showNotification) {
            showNotification(type, message);
        }
    };

    const storePaymentAndOnboarding = async (paymentDetails: any) => {
        try {
            // Always charge $1 for testing
            const actualAmountPaid = "1.00";

            // Use passed form data or fallback to localStorage
            let formDataToUse = onboardingFormData;

            if (!formDataToUse) {
                const storedFormData = localStorage.getItem('onboardingFormData');
                if (storedFormData) {
                    formDataToUse = JSON.parse(storedFormData);
                }
            }

            // Retrieve photos from window object (stored separately to avoid localStorage quota issues)
            let originalPhotos: any[] = [];
            let screenshotPhotos: any[] = [];

            if (typeof window !== 'undefined') {
                const windowAny = window as any;
                originalPhotos = windowAny.onboardingPhotos || [];
                screenshotPhotos = windowAny.onboardingScreenshots || [];
            }

            console.log('📸 Retrieved photos:', {
                originalPhotos: originalPhotos.length,
                screenshotPhotos: screenshotPhotos.length
            });

            // Convert File objects to base64 for upload
            const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
                const base64Promises = files.map(file => {
                    return new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const result = reader.result as string;
                            // Remove data URL prefix to get just base64
                            const base64 = result.split(',')[1];
                            resolve(base64);
                        };
                        reader.readAsDataURL(file);
                    });
                });
                return Promise.all(base64Promises);
            };

            // Convert photos to base64
            const originalPhotosBase64 = await convertFilesToBase64(originalPhotos);
            const screenshotPhotosBase64 = await convertFilesToBase64(screenshotPhotos);

            // Add photos to form data
            formDataToUse = {
                ...formDataToUse,
                originalPhotos: originalPhotosBase64,
                screenshotPhotos: screenshotPhotosBase64
            };

            // STEP 1: Generate a proper UUID for customer ID since we don't have authentication
            const tempCustomerId = crypto.randomUUID();

            // STEP 2: Store onboarding data in Supabase FIRST (required for foreign key)
            const onboardingData = {
                name: formDataToUse?.name || '',
                age: parseInt(formDataToUse?.age) || 0,
                dating_goals: formDataToUse?.datingGoal || '',
                current_dating_apps: formDataToUse?.currentMatches ? [formDataToUse.currentMatches] : [],
                bio: formDataToUse?.currentBio || '',
                interests: formDataToUse?.interests || [],
                email: formDataToUse?.email || '',
                phone: formDataToUse?.phone || '',
                location: formDataToUse?.location || '',
                photos: [], // Will be populated after file uploads
                bio_screenshots: [], // Will be populated after file uploads
                additional_info: JSON.stringify({
                    bodyType: formDataToUse?.bodyType || '',
                    stylePreference: formDataToUse?.stylePreference || '',
                    ethnicity: formDataToUse?.ethnicity || ''
                })
            };

            console.log("📝 Storing onboarding data in Supabase:", onboardingData);
            const onboardingResult = await storeOnboardingData(onboardingData);

            if (!onboardingResult.success) {
                console.error("❌ Failed to store onboarding data in Supabase:", onboardingResult.error);
                throw new Error("Failed to store onboarding data");
            }

            console.log("✅ Onboarding data stored in Supabase successfully:", onboardingResult.data);

            // STEP 3: Store payment data in Supabase (after onboarding exists)
            const paymentData = {
                customer_id: onboardingResult.data?.customer_id || tempCustomerId,
                paypal_order_id: paymentDetails.id,
                paypal_transaction_id: paymentDetails.purchase_units?.[0]?.payments?.captures?.[0]?.id || '',
                amount: parseFloat(actualAmountPaid), // Use the actual amount paid
                currency: 'USD',
                pricing_option: selectedPackage?.name || 'Payment',
                status: 'completed',
                payment_method: 'paypal',
                payer_email: formDataToUse?.email || '',
                payer_name: formDataToUse?.name || ''
            };

            console.log("💳 Storing payment data in Supabase:", paymentData);

            const paymentResult = await storePaymentData(paymentData);

            if (!paymentResult.success) {
                console.error("❌ Failed to store payment data in Supabase:", paymentResult.error);
                throw new Error("Failed to store payment data");
            }

            console.log("✅ Payment data stored in Supabase successfully:", paymentResult.data);

            // STEP 4: Upload photos to Supabase Storage
            const customerId = onboardingResult.data?.customer_id || tempCustomerId;
            if (originalPhotos.length > 0) {
                console.log("📸 Uploading profile photos to Supabase Storage...");
                for (let i = 0; i < originalPhotos.length; i++) {
                    const photo = originalPhotos[i];
                    const sanitizedName = sanitizeFilename(photo.name);
                    const photoPath = `${customerId}/profile-photos/${Date.now()}_${i}_${sanitizedName}`;
                    const uploadResult = await uploadFile(photo, 'profile-photos', photoPath);

                    if (uploadResult.success) {
                        console.log(`✅ Photo ${i + 1} uploaded successfully:`, uploadResult.url);
                    } else {
                        console.error(`❌ Failed to upload photo ${i + 1}:`, uploadResult.error);
                    }
                }
            }

            // STEP 5: Upload screenshots to Supabase Storage
            if (screenshotPhotos.length > 0) {
                console.log("📱 Uploading screenshots to Supabase Storage...");
                for (let i = 0; i < screenshotPhotos.length; i++) {
                    const screenshot = screenshotPhotos[i];
                    const sanitizedName = sanitizeFilename(screenshot.name);
                    const screenshotPath = `${customerId}/screenshots/${Date.now()}_${i}_${sanitizedName}`;
                    const uploadResult = await uploadFile(screenshot, 'screenshots', screenshotPath);

                    if (uploadResult.success) {
                        console.log(`✅ Screenshot ${i + 1} uploaded successfully:`, uploadResult.url);
                    } else {
                        console.error(`❌ Failed to upload screenshot ${i + 1}:`, uploadResult.error);
                    }
                }
            }

            // Set payment verification flag
            localStorage.setItem('paymentCompleted', 'true');
            localStorage.setItem('lastPaymentId', paymentResult.data?.payment_id || ''); // Store payment_id for onboarding

            // Clear stored data after successful payment
            localStorage.removeItem('onboardingFormData');
            if (typeof window !== 'undefined') {
                delete (window as any).onboardingPhotos;
                delete (window as any).onboardingScreenshots;
            }

            handleNotification("success", "Payment successful! Your data has been saved to the database.");
        } catch (error) {
            console.error("Error storing payment:", error);
            handleNotification("error", "Payment successful but failed to save data. Please contact support.");
        }
    };



    const handleStartPayment = () => {
        setShowForm(true);
    };


    // Auto-start payment process to reduce friction
    useEffect(() => {
        if (!showForm) {
            handleStartPayment();
        }
    }, [showForm]);

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2 text-center text-white">Complete Your Order</h2>
            <p className="text-white/70 mb-6 text-center">
                {selectedPackage ? `${selectedPackage.name}: $${selectedPackage.price}` : 'Payment'}
            </p>

            {/* PayPal Integration */}
            <div className="mt-6 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
                <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white">Complete Payment</h3>
                </div>
                <p className="text-white/70 mb-6 text-center text-sm">Secure payment powered by PayPal</p>

                <div className="space-y-3">
                    <style dangerouslySetInnerHTML={{ __html: paypalStyles }} />
                    <div className="paypal-button-container">
                        {!isPayPalLoaded ? (
                            <div className="text-center p-6 bg-white/5 border border-white/10 rounded-lg">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4ae36] mx-auto mb-3"></div>
                                <p className="text-white/70 text-sm">Loading payment options...</p>
                            </div>
                        ) : (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "Aa3Qhzd--_8MNtB9U8LctWUzDXw3eO7XPw2cyHUzwa9e_sYlD1pXnQK_K3iXNIXD2i64F8AUfPiWL-AT") ? (
                            <PayPalScriptProvider
                                options={{
                                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "Aa3Qhzd--_8MNtB9U8LctWUzDXw3eO7XPw2cyHUzwa9e_sYlD1pXnQK_K3iXNIXD2i64F8AUfPiWL-AT",
                                    currency: "USD",
                                    intent: "capture"
                                }}
                            >
                                <PayPalButtons
                                    createOrder={async (data, actions) => {
                                        try {
                                            const amount = "1.00"; // Always charge $1 for testing
                                            console.log('🔄 Creating PayPal order directly...');
                                            console.log('📦 Package data:', { selectedPackage, amount });

                                            // Create order directly using PayPal's actions.order.create()
                                            const order = await actions.order.create({
                                                purchase_units: [{
                                                    amount: {
                                                        currency_code: "USD",
                                                        value: amount
                                                    },
                                                    description: selectedPackage?.name || "Payment",
                                                    custom_id: selectedPackage?.id || "payment"
                                                }],
                                                intent: "CAPTURE"
                                            });

                                            console.log('✅ PayPal order created directly:', order);
                                            return order;
                                        } catch (error) {
                                            console.error('❌ Error creating order:', error);
                                            throw error;
                                        }
                                    }}
                                    onApprove={async (data, actions) => {
                                        console.log("✅ Order approved:", data.orderID);
                                        console.log("🔄 Starting payment capture...");

                                        try {
                                            // Use PayPal's recommended approach
                                            if (actions.order) {
                                                const details = await actions.order.capture();
                                                console.log("✅ Payment captured successfully:", details);

                                                // Store payment details AND onboarding data in database
                                                await storePaymentAndOnboarding(details);

                                                handleNotification("success", "Payment successful! Order ID: " + details.id);

                                                // Call the payment success callback
                                                if (onPaymentSuccess) {
                                                    console.log('🚀 Calling onPaymentSuccess callback!');
                                                    onPaymentSuccess();
                                                } else {
                                                    console.log('❌ onPaymentSuccess callback not provided!');
                                                }
                                            } else {
                                                throw new Error("PayPal order actions not available");
                                            }
                                        } catch (error) {
                                            console.error("❌ Payment capture failed:", error);
                                            handleNotification("error", "Payment capture failed: " + (error instanceof Error ? error.message : "Unknown error"));
                                        }
                                    }}
                                    onError={(err) => {
                                        console.error("PayPal error:", err);
                                        setPayPalError("PayPal error: " + JSON.stringify(err));
                                        handleNotification("error", "PayPal error: " + JSON.stringify(err));
                                    }}
                                    onCancel={(data) => {
                                        console.log("Payment cancelled:", data);
                                        handleNotification("info", "Payment was cancelled");
                                    }}
                                />
                            </PayPalScriptProvider>
                        ) : (
                            <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-400 text-sm">
                                    PayPal configuration error. Please check environment variables.
                                </p>
                                <p className="text-red-300 text-xs mt-1">
                                    Client ID: Missing - Using fallback
                                </p>
                            </div>
                        )}

                        {payPalError && (
                            <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg mt-3">
                                <p className="text-red-400 text-sm">{payPalError}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
