// Meta Conversions API (CAPI) endpoint
// Handles server-side event tracking for Meta Pixel

import { NextRequest, NextResponse } from 'next/server';
import {
    sendCAPIEvents,
    sendPurchaseEvent,
    sendLeadEvent,
    createPurchaseEvent,
    createLeadEvent,
    CAPIEvent
} from '@/lib/conversionsApi';

// Environment variables
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

// Request interfaces
interface PurchaseRequest {
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
}

interface LeadRequest {
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
}

interface BulkEventsRequest {
    events: CAPIEvent[];
    testEventCode?: string;
}

/**
 * POST /api/meta-capi
 * Send Meta Conversions API events
 */
export async function POST(request: NextRequest) {
    try {
        // Check if access token is configured
        if (!META_ACCESS_TOKEN) {
            console.error('Meta Access Token not configured');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Meta Conversions API not configured. Please set META_ACCESS_TOKEN environment variable.'
                },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { type, ...data } = body;

        let result;

        switch (type) {
            case 'purchase':
                result = await handlePurchaseEvent(data as PurchaseRequest);
                break;
            case 'lead':
                result = await handleLeadEvent(data as LeadRequest);
                break;
            case 'bulk':
                result = await handleBulkEvents(data as BulkEventsRequest);
                break;
            default:
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid event type. Must be "purchase", "lead", or "bulk"'
                    },
                    { status: 400 }
                );
        }

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json(result, { status: 400 });
        }

    } catch (error) {
        console.error('CAPI API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}

/**
 * Handle purchase event
 */
async function handlePurchaseEvent(data: PurchaseRequest) {
    try {
        // Validate required fields
        if (!data.orderId || !data.value || !data.userInfo) {
            return {
                success: false,
                error: 'Missing required fields: orderId, value, and userInfo are required'
            };
        }

        // Validate user info has at least one identifier
        const hasIdentifier = data.userInfo.email || data.userInfo.phone;
        if (!hasIdentifier) {
            return {
                success: false,
                error: 'At least one user identifier (email or phone) is required'
            };
        }

        console.log('Sending Purchase event to Meta CAPI:', {
            orderId: data.orderId,
            value: data.value,
            currency: data.currency || 'USD',
            packageName: data.packageName,
            hasEmail: !!data.userInfo.email,
            hasPhone: !!data.userInfo.phone,
            testMode: !!data.testEventCode
        });

        const result = await sendPurchaseEvent(
            META_ACCESS_TOKEN!,
            {
                orderId: data.orderId,
                value: data.value,
                currency: data.currency,
                packageName: data.packageName,
                packageId: data.packageId,
                userInfo: data.userInfo,
                eventTime: data.eventTime,
                eventSourceUrl: data.eventSourceUrl
            },
            data.testEventCode
        );

        return result;

    } catch (error) {
        console.error('Purchase event error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send purchase event'
        };
    }
}

/**
 * Handle lead event
 */
async function handleLeadEvent(data: LeadRequest) {
    try {
        // Validate required fields
        if (!data.leadId || !data.userInfo) {
            return {
                success: false,
                error: 'Missing required fields: leadId and userInfo are required'
            };
        }

        // Validate user info has at least one identifier
        const hasIdentifier = data.userInfo.email || data.userInfo.phone;
        if (!hasIdentifier) {
            return {
                success: false,
                error: 'At least one user identifier (email or phone) is required'
            };
        }

        console.log('Sending Lead event to Meta CAPI:', {
            leadId: data.leadId,
            source: data.source,
            hasEmail: !!data.userInfo.email,
            hasPhone: !!data.userInfo.phone,
            testMode: !!data.testEventCode
        });

        const result = await sendLeadEvent(
            META_ACCESS_TOKEN!,
            {
                leadId: data.leadId,
                source: data.source,
                userInfo: data.userInfo,
                eventTime: data.eventTime,
                eventSourceUrl: data.eventSourceUrl
            },
            data.testEventCode
        );

        return result;

    } catch (error) {
        console.error('Lead event error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send lead event'
        };
    }
}

/**
 * Handle bulk events
 */
async function handleBulkEvents(data: BulkEventsRequest) {
    try {
        // Validate required fields
        if (!data.events || !Array.isArray(data.events) || data.events.length === 0) {
            return {
                success: false,
                error: 'Missing or invalid events array'
            };
        }

        // Validate each event has required fields
        for (const event of data.events) {
            if (!event.event_name || !event.event_time || !event.user_data) {
                return {
                    success: false,
                    error: 'Each event must have event_name, event_time, and user_data'
                };
            }

            // Check if user_data has at least one identifier
            const hasIdentifier = event.user_data.em?.length || event.user_data.ph?.length;
            if (!hasIdentifier) {
                return {
                    success: false,
                    error: 'Each event must have at least one user identifier (email or phone)'
                };
            }
        }

        console.log('Sending bulk events to Meta CAPI:', {
            eventCount: data.events.length,
            eventTypes: data.events.map(e => e.event_name),
            testMode: !!data.testEventCode
        });

        const result = await sendCAPIEvents(
            META_ACCESS_TOKEN!,
            data.events,
            data.testEventCode
        );

        return result;

    } catch (error) {
        console.error('Bulk events error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send bulk events'
        };
    }
}

/**
 * GET /api/meta-capi
 * Health check endpoint
 */
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Meta Conversions API endpoint is active',
        configured: !!META_ACCESS_TOKEN,
        pixelId: '1276626097276316',
        apiVersion: 'v19.0'
    });
}

