# Meta Conversions API (CAPI) Setup Guide

This guide explains how to set up and use the Meta Conversions API implementation for backfilling historical purchases and tracking future conversions.

## 🚀 Quick Setup

### 1. Get Your Meta Access Token

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel (ID: `1276626097276316`)
3. Go to **Settings** → **Conversions API**
4. Click **Generate Access Token**
5. Copy the access token

### 2. Configure Environment Variables

Add to your `.env.local` file:

```bash
# Meta Conversions API Configuration
META_ACCESS_TOKEN=your_meta_access_token_here
```

### 3. Test the Implementation

Visit these endpoints to verify setup:

- **Health Check**: `GET /api/meta-capi`
- **Backfill Instructions**: `GET /api/meta-capi/backfill`

## 📊 Backfilling Historical Purchases

### Option A: Use the Backfill API Endpoint

Send a POST request to `/api/meta-capi/backfill`:

```bash
curl -X POST "https://your-domain.com/api/meta-capi/backfill" \
  -H "Content-Type: application/json" \
  -d '{
    "purchases": [
      {
        "orderId": "order_12345",
        "value": 27.99,
        "currency": "USD",
        "packageName": "Most Attention",
        "packageId": "most-matches",
        "userInfo": {
          "email": "customer@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "eventTime": 1727312400,
        "eventSourceUrl": "https://matchlensai.com/checkout"
      },
      {
        "orderId": "order_12346",
        "value": 27.99,
        "currency": "USD",
        "packageName": "Most Attention",
        "packageId": "most-matches",
        "userInfo": {
          "email": "customer2@example.com",
          "phone": "+1234567890"
        },
        "eventTime": 1727318700,
        "eventSourceUrl": "https://matchlensai.com/checkout"
      }
    ]
  }'
```

### Option B: Use cURL Directly to Meta API

```bash
curl -X POST "https://graph.facebook.com/v19.0/1276626097276316/events?access_token=YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "event_name": "Purchase",
        "event_time": 1727312400,
        "event_id": "order_12345",
        "action_source": "website",
        "event_source_url": "https://matchlensai.com/checkout",
        "user_data": {
          "em": ["<sha256_hashed_email>"],
          "fn": ["<sha256_hashed_first_name>"],
          "ln": ["<sha256_hashed_last_name>"]
        },
        "custom_data": {
          "currency": "USD",
          "value": 27.99,
          "content_name": "Most Attention",
          "content_ids": ["most-matches"]
        }
      }
    ]
  }'
```

## 🔄 Going Forward - Automatic Tracking

The implementation now automatically sends both Pixel and CAPI events for all new purchases:

### What Happens on Purchase:

1. **Pixel Event** (client-side): Fires immediately with `event_id` for deduplication
2. **CAPI Event** (server-side): Sends hashed user data to Meta's API
3. **Deduplication**: Both events use the same `event_id` (order ID) to prevent double counting

### Key Features:

- ✅ **Automatic Deduplication**: Same `event_id` used for both pixel and CAPI
- ✅ **Data Hashing**: All PII is SHA-256 hashed before sending to Meta
- ✅ **Error Handling**: Payment process continues even if tracking fails
- ✅ **Comprehensive Logging**: Detailed console logs for debugging

## 🧪 Testing

### Test Mode

Add a `testEventCode` to your requests for testing:

```javascript
// In your API calls
{
  "type": "purchase",
  "orderId": "test_order_123",
  "value": 27.99,
  "userInfo": { "email": "test@example.com" },
  "testEventCode": "TEST12345" // Get this from Events Manager
}
```

### Verify Events

1. Go to Events Manager → Test Events
2. Use your test event code
3. Check that events appear in the test events tab

## 📋 API Endpoints

### `/api/meta-capi` (Main CAPI Endpoint)

**POST** - Send CAPI events
- `type: "purchase"` - Send purchase event
- `type: "lead"` - Send lead event  
- `type: "bulk"` - Send multiple events

**GET** - Health check and configuration status

### `/api/meta-capi/backfill` (Backfill Endpoint)

**POST** - Backfill historical purchases
- Accepts array of purchase objects
- Validates event times (must be within 7 days)
- Returns detailed success/error information

**GET** - Get backfill instructions and API documentation

## 🔧 Troubleshooting

### Common Issues:

1. **"Meta Access Token not configured"**
   - Add `META_ACCESS_TOKEN` to your `.env.local` file
   - Restart your development server

2. **"Event time is older than 7 days"**
   - Meta only accepts events up to 7 days old
   - Use the actual purchase timestamp, not current time

3. **"At least one user identifier required"**
   - Each event needs either email or phone number
   - Both are hashed automatically

4. **Events not appearing in Events Manager**
   - Check your access token permissions
   - Verify pixel ID is correct
   - Use test event code for debugging

### Debug Mode:

Enable detailed logging by checking browser console and server logs. All tracking events are logged with success/error status.

## 📈 Benefits

- **Better Attribution**: Server-side events work even with ad blockers
- **Improved Match Rates**: Hashed user data improves event matching
- **Deduplication**: Prevents double counting with `event_id`
- **Compliance**: PII is properly hashed before transmission
- **Reliability**: Server-side events are more reliable than client-side only

## 🔒 Privacy & Compliance

- All PII (emails, phones, names) is SHA-256 hashed before sending to Meta
- No raw personal data is transmitted to Meta's API
- Complies with Meta's data processing requirements
- Follows best practices for user privacy protection

