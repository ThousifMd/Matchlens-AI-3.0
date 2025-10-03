// Meta Conversions API (CAPI) Backfill endpoint
// Handles backfilling historical purchase events

import { NextRequest, NextResponse } from 'next/server';
import {
    sendCAPIEvents,
    createPurchaseEvent,
    CAPIEvent
} from '@/lib/conversionsApi';

// Environment variables
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

// Backfill request interface
interface BackfillRequest {
    purchases: {
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
        eventTime: number; // Unix timestamp when the purchase actually happened
        eventSourceUrl?: string;
    }[];
    testEventCode?: string;
}

/**
 * POST /api/meta-capi/backfill
 * Backfill historical purchase events to Meta CAPI
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
        const { purchases, testEventCode } = body as BackfillRequest;

        // Validate request
        if (!purchases || !Array.isArray(purchases) || purchases.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing or invalid purchases array'
                },
                { status: 400 }
            );
        }

        // Validate each purchase
        for (const purchase of purchases) {
            if (!purchase.orderId || !purchase.value || !purchase.userInfo || !purchase.eventTime) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Each purchase must have orderId, value, userInfo, and eventTime'
                    },
                    { status: 400 }
                );
            }

            // Check if user info has at least one identifier
            const hasIdentifier = purchase.userInfo.email || purchase.userInfo.phone;
            if (!hasIdentifier) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Each purchase must have at least one user identifier (email or phone)'
                    },
                    { status: 400 }
                );
            }

            // Validate event time (should be within last 7 days for Meta)
            const now = Math.floor(Date.now() / 1000);
            const sevenDaysAgo = now - (7 * 24 * 60 * 60);

            if (purchase.eventTime < sevenDaysAgo) {
                console.warn(`Purchase ${purchase.orderId} event time is older than 7 days. Meta may not accept it.`);
            }

            if (purchase.eventTime > now) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Purchase ${purchase.orderId} event time cannot be in the future`
                    },
                    { status: 400 }
                );
            }
        }

        console.log('Backfilling purchases to Meta CAPI:', {
            purchaseCount: purchases.length,
            orderIds: purchases.map(p => p.orderId),
            testMode: !!testEventCode
        });

        // Create CAPI events from purchases
        const events: CAPIEvent[] = purchases.map(purchase =>
            createPurchaseEvent({
                orderId: purchase.orderId,
                value: purchase.value,
                currency: purchase.currency,
                packageName: purchase.packageName,
                packageId: purchase.packageId,
                userInfo: purchase.userInfo,
                eventTime: purchase.eventTime,
                eventSourceUrl: purchase.eventSourceUrl
            })
        );

        // Send events to Meta CAPI
        const result = await sendCAPIEvents(
            META_ACCESS_TOKEN!,
            events,
            testEventCode
        );

        if (result.success) {
            console.log('✅ Backfill successful:', {
                eventsReceived: result.response?.events_received || 0,
                messages: result.response?.messages || []
            });
        } else {
            console.error('❌ Backfill failed:', result.error);
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Backfill API Error:', error);
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
 * GET /api/meta-capi/backfill
 * Get backfill status and instructions
 */
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Meta Conversions API Backfill endpoint',
        instructions: {
            method: 'POST',
            endpoint: '/api/meta-capi/backfill',
            requiredFields: {
                purchases: 'Array of purchase objects',
                testEventCode: 'Optional test event code for testing'
            },
            purchaseObject: {
                orderId: 'string (required)',
                value: 'number (required)',
                currency: 'string (optional, defaults to USD)',
                packageName: 'string (optional)',
                packageId: 'string (optional)',
                userInfo: 'object (required)',
                eventTime: 'number (required, Unix timestamp)',
                eventSourceUrl: 'string (optional)'
            },
            userInfoObject: {
                email: 'string (optional)',
                phone: 'string (optional)',
                firstName: 'string (optional)',
                lastName: 'string (optional)',
                city: 'string (optional)',
                state: 'string (optional)',
                zipCode: 'string (optional)',
                country: 'string (optional)'
            },
            notes: [
                'At least one user identifier (email or phone) is required per purchase',
                'Event time should be when the purchase actually happened (within last 7 days)',
                'Use testEventCode for testing before sending real events',
                'Each purchase will be sent as a separate Purchase event to Meta'
            ]
        },
        configured: !!META_ACCESS_TOKEN,
        pixelId: '1276626097276316'
    });
}

