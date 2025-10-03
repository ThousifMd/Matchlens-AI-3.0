// Meta Pixel Event Tracking Utilities

declare global {
    interface Window {
        fbq: (action: string, event: string, data?: any, options?: { eventID?: string }) => void;
    }
}

// Meta Pixel Event Types
export const META_PIXEL_EVENTS = {
    LEAD: 'Lead',
    INITIATE_CHECKOUT: 'InitiateCheckout',
    COMPLETE_REGISTRATION: 'CompleteRegistration',
    PURCHASE: 'Purchase',
    ADD_TO_CART: 'AddToCart',
    VIEW_CONTENT: 'ViewContent',
    PAGE_VIEW: 'PageView'
} as const;

// Utility function to track Meta Pixel events
export const trackMetaPixelEvent = (event: string, data?: any, eventId?: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
        try {
            if (eventId) {
                // Use track with eventID parameter for deduplication
                window.fbq('track', event, data, { eventID: eventId });
            } else {
                // Use regular track for events without event_id
                window.fbq('track', event, data);
            }
            console.log(`Meta Pixel Event Tracked: ${event}`, data, eventId ? `(ID: ${eventId})` : '');
        } catch (error) {
            console.error('Error tracking Meta Pixel event:', error);
        }
    }
};

// Specific event tracking functions
export const trackLead = (source?: string) => {
    trackMetaPixelEvent(META_PIXEL_EVENTS.LEAD, {
        content_name: source || 'CTA Button Click',
        content_category: 'lead_generation'
    });
};

export const trackInitiateCheckout = (formType?: string) => {
    trackMetaPixelEvent(META_PIXEL_EVENTS.INITIATE_CHECKOUT, {
        content_name: formType || 'Onboarding Form',
        content_category: 'form_start'
    });
};

export const trackCompleteRegistration = (formData?: any) => {
    trackMetaPixelEvent(META_PIXEL_EVENTS.COMPLETE_REGISTRATION, {
        content_name: 'Onboarding Form Submission',
        content_category: 'form_completion',
        ...formData
    });
};

export const trackPurchase = (value: number, currency: string = 'USD', packageName?: string, eventId?: string) => {
    trackMetaPixelEvent(META_PIXEL_EVENTS.PURCHASE, {
        value: value,
        currency: currency,
        content_name: packageName || 'Matchlens Package',
        content_category: 'purchase'
    }, eventId);
};

export const trackAddToCart = (packageName?: string, price?: number) => {
    trackMetaPixelEvent(META_PIXEL_EVENTS.ADD_TO_CART, {
        content_name: packageName || 'Pricing Package',
        content_category: 'pricing_selection',
        value: price,
        currency: 'USD'
    });
};

export const trackViewContent = (contentName?: string, contentType?: string) => {
    trackMetaPixelEvent(META_PIXEL_EVENTS.VIEW_CONTENT, {
        content_name: contentName || 'FAQ Section',
        content_category: contentType || 'faq_interaction'
    });
};

// CTA Button tracking with specific identifiers
export const trackCTAClick = (buttonText: string, location: string) => {
    trackLead(`${buttonText} - ${location}`);
};

// Form step tracking
export const trackFormStep = (step: number, stepName: string) => {
    trackMetaPixelEvent('CustomEvent', {
        event_name: 'FormStep',
        step_number: step,
        step_name: stepName,
        content_category: 'form_progress'
    });
};

// CAPI (Conversions API) tracking functions
export const sendCAPIPurchaseEvent = async (purchaseData: {
    orderId: string;
    value: number;
    currency?: string;
    packageName?: string;
    packageId?: string;
    userInfo: {
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    eventTime?: number;
    eventSourceUrl?: string;
    testEventCode?: string;
}): Promise<{ success: boolean; response?: any; error?: string }> => {
    try {
        const response = await fetch('/api/meta-capi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'purchase',
                ...purchaseData
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending CAPI purchase event:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send CAPI event'
        };
    }
};

export const sendCAPILeadEvent = async (leadData: {
    leadId: string;
    source?: string;
    userInfo: {
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
    };
    eventTime?: number;
    eventSourceUrl?: string;
    testEventCode?: string;
}): Promise<{ success: boolean; response?: any; error?: string }> => {
    try {
        const response = await fetch('/api/meta-capi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'lead',
                ...leadData
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending CAPI lead event:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send CAPI event'
        };
    }
};

// Combined tracking function that sends both pixel and CAPI events
export const trackPurchaseComplete = async (purchaseData: {
    orderId: string;
    value: number;
    currency?: string;
    packageName?: string;
    packageId?: string;
    userInfo: {
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    eventSourceUrl?: string;
    testEventCode?: string;
}): Promise<{ pixelSuccess: boolean; capiSuccess: boolean; errors: string[] }> => {
    const errors: string[] = [];
    let pixelSuccess = false;
    let capiSuccess = false;

    // 1. Send Pixel event (client-side)
    try {
        trackPurchase(
            purchaseData.value,
            purchaseData.currency || 'USD',
            purchaseData.packageName,
            purchaseData.orderId // Use orderId as event_id for deduplication
        );
        pixelSuccess = true;
        console.log('✅ Pixel Purchase event sent');
    } catch (error) {
        const errorMsg = `Pixel event failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error('❌ Pixel event failed:', error);
    }

    // 2. Send CAPI event (server-side)
    try {
        const capiResult = await sendCAPIPurchaseEvent({
            ...purchaseData,
            eventTime: Math.floor(Date.now() / 1000) // Current timestamp
        });

        if (capiResult.success) {
            capiSuccess = true;
            console.log('✅ CAPI Purchase event sent');
        } else {
            const errorMsg = `CAPI event failed: ${capiResult.error}`;
            errors.push(errorMsg);
            console.error('❌ CAPI event failed:', capiResult.error);
        }
    } catch (error) {
        const errorMsg = `CAPI event failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error('❌ CAPI event failed:', error);
    }

    return {
        pixelSuccess,
        capiSuccess,
        errors
    };
};
