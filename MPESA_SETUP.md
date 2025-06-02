# M-Pesa Daraja API Integration Setup

This guide will help you set up M-Pesa STK Push (Lipa Na M-Pesa Online) integration for the StayHaven booking platform.

## Prerequisites

1. **Safaricom Developer Account**: Create an account at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. **M-Pesa API App**: Create a new app and subscribe to the "M-Pesa Express" API
3. **Business Shortcode**: Get your paybill or till number from Safaricom

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY="your_consumer_key_from_safaricom_app"
MPESA_CONSUMER_SECRET="your_consumer_secret_from_safaricom_app"
MPESA_BUSINESS_SHORTCODE="174379"  # Use 174379 for sandbox, your actual shortcode for production
MPESA_PASSKEY="your_passkey_from_safaricom"
MPESA_ENVIRONMENT="sandbox"  # Change to "production" for live environment
MPESA_CALLBACK_URL="http://localhost:3000/api/payments/mpesa/callback"  # Update for production
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Update for production

# Note: Do NOT use NEXT_PUBLIC_ prefix for M-Pesa credentials as they should remain server-side only
```

## Getting Your Credentials

### 1. Consumer Key & Consumer Secret
1. Log into [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Go to "My Apps"
3. Create a new app or select existing one
4. Subscribe to "M-Pesa Express" API
5. Get your Consumer Key and Consumer Secret from the app details

### 2. Passkey
1. In your app dashboard, go to "APIs" → "M-Pesa Express"
2. The passkey is provided in the API documentation
3. For sandbox: Use the test passkey provided
4. For production: Contact Safaricom to get your business passkey

### 3. Business Shortcode
- **Sandbox**: Use `174379` (test paybill)
- **Production**: Use your actual paybill or till number from Safaricom

## Sandbox Testing

For testing, you can use these sandbox phone numbers:
- `254708374149` - Success scenario
- `254700000000` - Failed scenario
- `254711222333` - Insufficient funds scenario

## Testing the Integration

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Login as a customer and go to dashboard
3. Click "Pay Now" on any booking
4. Enter a valid M-Pesa phone number (254XXXXXXXXX format)
5. Click "Pay Now" - you should receive an STK push notification
6. Enter your M-Pesa PIN in the prompt
7. The payment status will be automatically updated

## Production Setup

1. Change `MPESA_ENVIRONMENT` to `"production"`
2. Update `MPESA_BUSINESS_SHORTCODE` to your actual shortcode
3. Get production credentials from Safaricom
4. Update `MPESA_CALLBACK_URL` to your production domain
5. Ensure your callback URL is accessible (not localhost)
6. Test thoroughly before going live

## Callback URL Requirements

- The callback URL must be publicly accessible
- Use HTTPS in production
- The endpoint will receive POST requests from Safaricom
- Must respond with HTTP 200 status code

## Troubleshooting

### Common Issues

1. **"Invalid Access Token"**
   - Check your consumer key and secret
   - Ensure you're using the correct environment (sandbox/production)

2. **"Invalid Phone Number"**
   - Phone numbers must be in format: 254XXXXXXXXX
   - Must be a valid Safaricom number for M-Pesa

3. **"STK Push not received"**
   - Check phone number format
   - Ensure the phone has M-Pesa activated
   - Check if the number has sufficient balance

4. **"Callback not received"**
   - Ensure callback URL is publicly accessible
   - Check server logs for any errors
   - Verify the URL is correct in environment variables

5. **"Invalid CallBackURL" Error**
   - Ensure MPESA_CALLBACK_URL is properly set in .env.local
   - For local development, use ngrok or similar to expose localhost
   - For sandbox: URL must be accessible from Safaricom's servers
   - Check the URL format: should include full domain and path
   - Example for local dev with ngrok: `https://abc123.ngrok.io/api/payments/mpesa/callback`

### Using ngrok for Local Development

Since M-Pesa callbacks need to reach your local server, use ngrok for testing:

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Copy the HTTPS URL and update your .env.local:
   ```env
   MPESA_CALLBACK_URL="https://abc123.ngrok.io/api/payments/mpesa/callback"
   NEXT_PUBLIC_APP_URL="https://abc123.ngrok.io"
   ```
5. Restart your Next.js server

### Logs

Check the server console for detailed logs:
- Payment initiation logs
- Callback processing logs
- Error messages and stack traces

## Security Notes

- Never commit your actual M-Pesa credentials to version control
- Use environment variables for all sensitive data
- Validate all incoming data in callbacks
- Implement proper error handling
- Log transactions for reconciliation purposes

## Support

For M-Pesa API issues, contact Safaricom support or check their developer documentation at [developer.safaricom.co.ke](https://developer.safaricom.co.ke) 