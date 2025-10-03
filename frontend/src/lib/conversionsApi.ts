// Meta Conversions API (CAPI) Utilities
// Server-side event tracking for Meta Pixel

import crypto from 'crypto';

// Meta Pixel Configuration
export const META_PIXEL_ID = '1276626097276316';
export const META_API_VERSION = 'v19.0';

// CAPI Event Types
export const CAPI_EVENTS = {
    PURCHASE: 'Purchase',
    LEAD: 'Lead',
    INITIATE_CHECKOUT: 'InitiateCheckout',
    COMPLETE_REGISTRATION: 'CompleteRegistration',
    ADD_TO_CART: 'AddToCart',
    VIEW_CONTENT: 'ViewContent',
    PAGE_VIEW: 'PageView'
} as const;

// User data interface for CAPI
export interface CAPIUserData {
    em?: string[]; // hashed emails
    ph?: string[]; // hashed phone numbers
    fn?: string[]; // hashed first names
    ln?: string[]; // hashed last names
    ct?: string[]; // hashed cities
    st?: string[]; // hashed states
    zp?: string[]; // hashed zip codes
    country?: string[]; // hashed countries
}

// Custom data interface for CAPI
export interface CAPICustomData {
    currency?: string;
    value?: number;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    num_items?: number;
}

// CAPI Event interface
export interface CAPIEvent {
    event_name: string;
    event_time: number; // Unix timestamp
    event_id?: string; // For deduplication
    action_source: 'website' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
    event_source_url?: string;
    user_data: CAPIUserData;
    custom_data?: CAPICustomData;
    opt_out?: boolean;
    partner_agent?: string;
}

// CAPI Request interface
export interface CAPIRequest {
    data: CAPIEvent[];
    test_event_code?: string; // For testing
    partner_agent?: string;
}

/**
 * Hash a string using SHA-256
 * @param input - String to hash
 * @returns SHA-256 hash in lowercase
 */
export function hashString(input: string): string {
    if (!input) return '';
    return crypto.createHash('sha256').update(input.toLowerCase().trim()).digest('hex');
}

/**
 * Normalize and hash email address
 * @param email - Email address to hash
 * @returns Hashed email or empty string if invalid
 */
export function hashEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return '';

    return hashString(email);
}

/**
 * Normalize and hash phone number
 * @param phone - Phone number to hash
 * @returns Hashed phone or empty string if invalid
 */
export function hashPhone(phone: string): string {
    if (!phone || typeof phone !== 'string') return '';

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // Basic phone validation (7-15 digits)
    if (digitsOnly.length < 7 || digitsOnly.length > 15) return '';

    return hashString(digitsOnly);
}

/**
 * Normalize and hash name
 * @param name - Name to hash
 * @returns Hashed name or empty string if invalid
 */
export function hashName(name: string): string {
    if (!name || typeof name !== 'string') return '';

    // Remove extra spaces and normalize
    const normalized = name.trim().replace(/\s+/g, ' ');
    if (normalized.length < 2) return '';

    return hashString(normalized);
}

/**
 * Create user data object for CAPI
 * @param userInfo - User information
 * @returns CAPI user data object
 */
export function createCAPIUserData(userInfo: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}): CAPIUserData {
    const userData: CAPIUserData = {};

    if (userInfo.email) {
        const hashedEmail = hashEmail(userInfo.email);
        if (hashedEmail) userData.em = [hashedEmail];
    }

    if (userInfo.phone) {
        const hashedPhone = hashPhone(userInfo.phone);
        if (hashedPhone) userData.ph = [hashedPhone];
    }

    if (userInfo.firstName) {
        const hashedFirstName = hashName(userInfo.firstName);
        if (hashedFirstName) userData.fn = [hashedFirstName];
    }

    if (userInfo.lastName) {
        const hashedLastName = hashName(userInfo.lastName);
        if (hashedLastName) userData.ln = [hashedLastName];
    }

    if (userInfo.city) {
        const hashedCity = hashString(userInfo.city);
        if (hashedCity) userData.ct = [hashedCity];
    }

    if (userInfo.state) {
        const hashedState = hashString(userInfo.state);
        if (hashedState) userData.st = [hashedState];
    }

    if (userInfo.zipCode) {
        const hashedZip = hashString(userInfo.zipCode);
        if (hashedZip) userData.zp = [hashedZip];
    }

    if (userInfo.country) {
        const hashedCountry = hashString(userInfo.country);
        if (hashedCountry) userData.country = [hashedCountry];
    }

    return userData;
}

/**
 * Create a Purchase event for CAPI
 * @param purchaseData - Purchase information
 * @returns CAPI Purchase event
 */
export function createPurchaseEvent(purchaseData: {
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
    eventTime?: number; // Unix timestamp, defaults to now
    eventSourceUrl?: string;
}): CAPIEvent {
    const eventTime = purchaseData.eventTime || Math.floor(Date.now() / 1000);

    return {
        event_name: CAPI_EVENTS.PURCHASE,
        event_time: eventTime,
        event_id: purchaseData.orderId,
        action_source: 'website',
        event_source_url: purchaseData.eventSourceUrl,
        user_data: createCAPIUserData(purchaseData.userInfo),
        custom_data: {
            currency: purchaseData.currency || 'USD',
            value: purchaseData.value,
            content_name: purchaseData.packageName || 'Matchlens Package',
            content_category: 'purchase',
            content_ids: purchaseData.packageId ? [purchaseData.packageId] : undefined,
            content_type: 'product',
            num_items: 1
        }
    };
}

/**
 * Create a Lead event for CAPI
 * @param leadData - Lead information
 * @returns CAPI Lead event
 */
export function createLeadEvent(leadData: {
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
}): CAPIEvent {
    const eventTime = leadData.eventTime || Math.floor(Date.now() / 1000);

    return {
        event_name: CAPI_EVENTS.LEAD,
        event_time: eventTime,
        event_id: leadData.leadId,
        action_source: 'website',
        event_source_url: leadData.eventSourceUrl,
        user_data: createCAPIUserData(leadData.userInfo),
        custom_data: {
            content_name: leadData.source || 'CTA Button Click',
            content_category: 'lead_generation'
        }
    };
}

/**
 * Send CAPI events to Meta
 * @param accessToken - Meta access token
 * @param events - Array of CAPI events
 * @param testEventCode - Optional test event code for testing
 * @returns Promise with response
 */
export async function sendCAPIEvents(
    accessToken: string,
    events: CAPIEvent[],
    testEventCode?: string
): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
        const requestData: CAPIRequest = {
            data: events,
            partner_agent: 'matchlens-ai'
        };

        if (testEventCode) {
            requestData.test_event_code = testEventCode;
        }

        const response = await fetch(
            `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${accessToken}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            }
        );

        const responseData = await response.json();

        if (!response.ok) {
            console.error('CAPI Error Response:', responseData);
            return {
                success: false,
                error: responseData.error?.message || `HTTP ${response.status}: ${response.statusText}`
            };
        }

        console.log('CAPI Success Response:', responseData);
        return {
            success: true,
            response: responseData
        };

    } catch (error) {
        console.error('CAPI Request Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Send a single Purchase event to Meta CAPI
 * @param accessToken - Meta access token
 * @param purchaseData - Purchase information
 * @param testEventCode - Optional test event code
 * @returns Promise with response
 */
export async function sendPurchaseEvent(
    accessToken: string,
    purchaseData: {
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
    },
    testEventCode?: string
): Promise<{ success: boolean; response?: any; error?: string }> {
    const purchaseEvent = createPurchaseEvent(purchaseData);
    return sendCAPIEvents(accessToken, [purchaseEvent], testEventCode);
}

/**
 * Send a single Lead event to Meta CAPI
 * @param accessToken - Meta access token
 * @param leadData - Lead information
 * @param testEventCode - Optional test event code
 * @returns Promise with response
 */
export async function sendLeadEvent(
    accessToken: string,
    leadData: {
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
    },
    testEventCode?: string
): Promise<{ success: boolean; response?: any; error?: string }> {
    const leadEvent = createLeadEvent(leadData);
    return sendCAPIEvents(accessToken, [leadEvent], testEventCode);
}

