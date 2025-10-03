// Test script for Meta CAPI backfill
// Run this with: node test-backfill.js

const META_ACCESS_TOKEN = "EAALWNPyueGcBPgmMq7zbNMMiZAimW6qNloAXQLMSzwB0LdqFAukvtUvc3xfwnwFer9LOP308wU0pLwZCYnJypxZBQoM4d6YFpQfosEPtGAaezJAAZCaIPGEVD9LPGyZCst6DoPffBARQL6Sb9Ikd6GsKeWmQxAB8P1mT80e1L8Gs0w1WZAvGkHqPrL7zot3eNgRQZDZD";
const META_PIXEL_ID = "1276626097276316";
const META_API_VERSION = "v19.0";

// Sample purchase data for your 2 historical purchases
const historicalPurchases = [
    {
        orderId: "order_12345",
        value: 27.99,
        currency: "USD",
        packageName: "Most Attention",
        packageId: "most-matches",
        userInfo: {
            email: "customer1@example.com", // Replace with actual customer email
            firstName: "John", // Replace with actual customer name
            lastName: "Doe"
        },
        eventTime: 1727312400, // Replace with actual purchase timestamp (Unix seconds)
        eventSourceUrl: "https://matchlensai.com/checkout"
    },
    {
        orderId: "order_12346",
        value: 27.99,
        currency: "USD",
        packageName: "Most Attention",
        packageId: "most-matches",
        userInfo: {
            email: "customer2@example.com", // Replace with actual customer email
            phone: "+1234567890" // Replace with actual customer phone
        },
        eventTime: 1727318700, // Replace with actual purchase timestamp (Unix seconds)
        eventSourceUrl: "https://matchlensai.com/checkout"
    }
];

// Function to hash strings (simplified version)
function hashString(input) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(input.toLowerCase().trim()).digest('hex');
}

// Function to create CAPI event
function createPurchaseEvent(purchase) {
    const userData = {};

    if (purchase.userInfo.email) {
        userData.em = [hashString(purchase.userInfo.email)];
    }

    if (purchase.userInfo.phone) {
        const digitsOnly = purchase.userInfo.phone.replace(/\D/g, '');
        userData.ph = [hashString(digitsOnly)];
    }

    if (purchase.userInfo.firstName) {
        userData.fn = [hashString(purchase.userInfo.firstName)];
    }

    if (purchase.userInfo.lastName) {
        userData.ln = [hashString(purchase.userInfo.lastName)];
    }

    return {
        event_name: "Purchase",
        event_time: purchase.eventTime,
        event_id: purchase.orderId,
        action_source: "website",
        event_source_url: purchase.eventSourceUrl,
        user_data: userData,
        custom_data: {
            currency: purchase.currency || "USD",
            value: purchase.value,
            content_name: purchase.packageName || "Matchlens Package",
            content_category: "purchase",
            content_ids: purchase.packageId ? [purchase.packageId] : undefined,
            content_type: "product",
            num_items: 1
        }
    };
}

// Function to send events to Meta CAPI
async function sendCAPIEvents(events, testEventCode = null) {
    const requestData = {
        data: events,
        partner_agent: "matchlens-ai"
    };

    if (testEventCode) {
        requestData.test_event_code = testEventCode;
    }

    try {
        const response = await fetch(
            `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
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
            console.error('❌ CAPI Error Response:', responseData);
            return {
                success: false,
                error: responseData.error?.message || `HTTP ${response.status}: ${response.statusText}`
            };
        }

        console.log('✅ CAPI Success Response:', responseData);
        return {
            success: true,
            response: responseData
        };

    } catch (error) {
        console.error('❌ CAPI Request Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Main function to backfill purchases
async function backfillPurchases() {
    console.log('🚀 Starting Meta CAPI backfill...');
    console.log(`📊 Backfilling ${historicalPurchases.length} purchases`);

    // Create CAPI events from purchases
    const events = historicalPurchases.map(createPurchaseEvent);

    console.log('📝 Created events:', events.map(e => ({
        event_name: e.event_name,
        event_id: e.event_id,
        value: e.custom_data.value,
        hasEmail: !!e.user_data.em,
        hasPhone: !!e.user_data.ph
    })));

    // Send events to Meta CAPI
    const result = await sendCAPIEvents(events);

    if (result.success) {
        console.log('🎉 Backfill successful!');
        console.log(`📈 Events received: ${result.response?.events_received || 0}`);
        console.log(`📋 Messages:`, result.response?.messages || []);
    } else {
        console.log('❌ Backfill failed:', result.error);
    }

    return result;
}

// Run the backfill
if (require.main === module) {
    backfillPurchases().catch(console.error);
}

module.exports = { backfillPurchases, createPurchaseEvent, sendCAPIEvents };

