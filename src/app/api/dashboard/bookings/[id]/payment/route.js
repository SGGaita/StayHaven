import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import serverLogger from '@/lib/server-logger';

// M-Pesa Configuration
const MPESA_CONFIG = {
  consumerKey: process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY,
  consumerSecret: process.env.NEXT_PUBLIC_MPESA_CONSUMER_SECRET,
  businessShortCode: process.env.NEXT_PUBLIC_MPESA_BUSINESS_SHORTCODE || '174379',
  passkey: process.env.NEXT_PUBLIC_MPESA_PASSKEY,
  environment: process.env.NEXT_PUBLIC_MPESA_ENVIRONMENT || 'sandbox', // 'sandbox' or 'production'
  callbackUrl: process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mpesa/callback`,
};

// Get M-Pesa access token
async function getMpesaAccessToken() {
  const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
  
  const baseUrl = MPESA_CONFIG.environment === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke';
  
  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  console.log('M-Pesa access token response:', response);

  if (!response.ok) {
    throw new Error('Failed to get M-Pesa access token');
  }

  const data = await response.json();
  return data.access_token;
}

// Generate M-Pesa password
function generateMpesaPassword(timestamp) {
  const data = MPESA_CONFIG.businessShortCode + MPESA_CONFIG.passkey + timestamp;
  return Buffer.from(data).toString('base64');
}

// Initiate STK Push
async function initiateStkPush(phoneNumber, amount, accountReference, transactionDesc) {
  const accessToken = await getMpesaAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = generateMpesaPassword(timestamp);
  
  const baseUrl = MPESA_CONFIG.environment === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke';

  const stkPushPayload = {
    BusinessShortCode: MPESA_CONFIG.businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(1),
    PartyA: phoneNumber,
    PartyB: MPESA_CONFIG.businessShortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: MPESA_CONFIG.callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  console.log('M-Pesa Config:', {
    businessShortCode: MPESA_CONFIG.businessShortCode,
    environment: MPESA_CONFIG.environment,
    callbackUrl: MPESA_CONFIG.callbackUrl,
    hasConsumerKey: !!MPESA_CONFIG.consumerKey,
    hasConsumerSecret: !!MPESA_CONFIG.consumerSecret,
    hasPasskey: !!MPESA_CONFIG.passkey,
  });

  console.log('STK Push Payload:', JSON.stringify(stkPushPayload, null, 2));

  const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stkPushPayload),
  });

  console.log('STK Push response status:', response.status);
  console.log('STK Push response headers:', response.headers);

  if (!response.ok) {
    const errorData = await response.json();
    console.log('STK Push error response:', errorData);
    throw new Error(`STK Push failed: ${errorData.errorMessage || 'Unknown error'}`);
  }

  return await response.json();
}

// Authentication helper
async function authenticateUser(request) {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth');
    
    if (!authCookie) {
      return { error: 'No authentication cookie found', status: 401 };
    }

    let session;
    try {
      session = JSON.parse(authCookie.value);
    } catch (parseError) {
      return { error: 'Invalid authentication cookie', status: 401 };
    }

    if (!session?.user?.id || !session.isAuthenticated) {
      return { error: 'User not authenticated', status: 401 };
    }

    return { user: session.user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

export async function POST(request, { params }) {
  try {
    // Validate M-Pesa configuration
    const missingVars = [];
    if (!MPESA_CONFIG.consumerKey) missingVars.push('NEXT_PUBLIC_MPESA_CONSUMER_KEY');
    if (!MPESA_CONFIG.consumerSecret) missingVars.push('NEXT_PUBLIC_MPESA_CONSUMER_SECRET');
    if (!MPESA_CONFIG.passkey) missingVars.push('NEXT_PUBLIC_MPESA_PASSKEY');
    if (!MPESA_CONFIG.callbackUrl) missingVars.push('NEXT_PUBLIC_MPESA_CALLBACK_URL or NEXT_PUBLIC_APP_URL');

    if (missingVars.length > 0) {
      console.error('Missing M-Pesa environment variables:', missingVars);
      return NextResponse.json(
        { error: `Missing required environment variables: ${missingVars.join(', ')}` },
        { status: 500 }
      );
    }

    console.log('M-Pesa environment check passed');

    const authResult = await authenticateUser(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id: bookingId } = params;
    const body = await request.json();
    const { paymentMethod, amount, phoneNumber } = body;

    if (!bookingId || !paymentMethod || !amount) {
      return NextResponse.json(
        { error: 'Booking ID, payment method, and amount are required' },
        { status: 400 }
      );
    }

    // Handle M-Pesa payments
    if (paymentMethod === 'mpesa') {
      if (!phoneNumber) {
        return NextResponse.json(
          { error: 'Phone number is required for M-Pesa payments' },
          { status: 400 }
        );
      }

      // Validate phone number format
      const phoneRegex = /^254[17]\d{8}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          { error: 'Invalid phone number format. Use 254XXXXXXXXX' },
          { status: 400 }
        );
      }

      try {
        // TODO: Fetch actual booking details from database
        const booking = {
          id: bookingId,
          propertyName: 'Sample Property',
          customerName: authResult.user.firstName,
        };

        const accountReference = `BOOKING-${bookingId}`;
        const transactionDesc = `Payment for ${booking.propertyName}`;

        // Initiate STK Push
        const stkResponse = await initiateStkPush(
          phoneNumber,
          amount,
          accountReference,
          transactionDesc
        );

        if (stkResponse.ResponseCode === '0') {
          // STK Push initiated successfully
          // TODO: Store the CheckoutRequestID in database for later verification
          
          return NextResponse.json({
            success: true,
            message: 'STK Push sent successfully',
            checkoutRequestId: stkResponse.CheckoutRequestID,
            merchantRequestId: stkResponse.MerchantRequestID,
          });
        } else {
          return NextResponse.json(
            { error: `STK Push failed: ${stkResponse.ResponseDescription}` },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('M-Pesa STK Push error:', error);
        return NextResponse.json(
          { error: 'Failed to initiate M-Pesa payment. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Handle other payment methods (placeholder)
    // TODO: Implement other payment methods
    return NextResponse.json(
      { error: 'Payment method not yet implemented' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 