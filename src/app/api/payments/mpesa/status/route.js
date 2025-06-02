import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// M-Pesa Configuration
const MPESA_CONFIG = {
  consumerKey: process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY,
  consumerSecret: process.env.NEXT_PUBLIC_MPESA_CONSUMER_SECRET,
  businessShortCode: process.env.NEXT_PUBLIC_MPESA_BUSINESS_SHORTCODE || '174379',
  passkey: process.env.NEXT_PUBLIC_MPESA_PASSKEY,
  environment: process.env.NEXT_PUBLIC_MPESA_ENVIRONMENT || 'sandbox', // 'sandbox' or 'production'
};

// Get M-Pesa access token
async function getMpesaAccessToken() {
  console.log('Status route - Getting M-Pesa access token...');
  console.log('Status route - MPESA_CONFIG:', {
    hasConsumerKey: !!MPESA_CONFIG.consumerKey,
    hasConsumerSecret: !!MPESA_CONFIG.consumerSecret,
    environment: MPESA_CONFIG.environment,
  });

  const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
  
  const baseUrl = MPESA_CONFIG.environment === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke';
  
  console.log('Status route - Request URL:', `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`);

  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  console.log('Status route - Access token response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.log('Status route - Access token error:', errorData);
    throw new Error('Failed to get M-Pesa access token');
  }

  const data = await response.json();
  console.log('Status route - Access token obtained successfully');
  return data.access_token;
}

// Generate M-Pesa password
function generateMpesaPassword(timestamp) {
  const data = MPESA_CONFIG.businessShortCode + MPESA_CONFIG.passkey + timestamp;
  return Buffer.from(data).toString('base64');
}

// Query STK Push status
async function queryStkPushStatus(checkoutRequestId) {
  const accessToken = await getMpesaAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = generateMpesaPassword(timestamp);
  
  const baseUrl = MPESA_CONFIG.environment === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke';

  const queryPayload = {
    BusinessShortCode: MPESA_CONFIG.businessShortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queryPayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`STK Push query failed: ${errorData.errorMessage || 'Unknown error'}`);
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

export async function POST(request) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { checkoutRequestId, bookingId } = body;

    if (!checkoutRequestId || !bookingId) {
      return NextResponse.json(
        { error: 'Checkout Request ID and Booking ID are required' },
        { status: 400 }
      );
    }

    try {
      // Query M-Pesa for payment status
      const queryResponse = await queryStkPushStatus(checkoutRequestId);
      
      let status = 'PENDING';
      let mpesaReceiptNumber = null;
      
      // Parse M-Pesa response
      if (queryResponse.ResponseCode === '0') {
        // Check the result code from the callback
        if (queryResponse.ResultCode === '0') {
          status = 'COMPLETED';
          // Extract M-Pesa receipt number if available
          mpesaReceiptNumber = queryResponse.MpesaReceiptNumber;
          
          // Update booking status in database
          try {
            // Update booking status to CONFIRMED
            const updatedBooking = await prisma.booking.update({
              where: { id: bookingId },
              data: {
                status: 'CONFIRMED',
                updatedAt: new Date(),
              },
            });

            // Create payment record
            const paymentRecord = await prisma.payment.create({
              data: {
                bookingId: bookingId,
                amount: queryResponse.Amount || 1, // Use amount from M-Pesa response if available
                method: 'MPESA',
                status: 'COMPLETED',
                transactionId: mpesaReceiptNumber || `MPESA-${checkoutRequestId}`,
              },
            });

            console.log(`✅ Booking ${bookingId} updated successfully. Status: CONFIRMED`);
            console.log(`💳 Payment record created: ${paymentRecord.id}, Receipt: ${mpesaReceiptNumber}`);
          } catch (dbError) {
            console.error(`❌ Error updating booking ${bookingId}:`, dbError);
            // Continue with response even if DB update fails
          }
          
          console.log(`Payment completed for booking ${bookingId}. M-Pesa Receipt: ${mpesaReceiptNumber}`);
        } else if (queryResponse.ResultCode === '1032') {
          status = 'CANCELLED';
        } else {
          status = 'FAILED';
        }
      } else if (queryResponse.ResponseCode === '1037') {
        // Request in progress
        status = 'PENDING';
      } else {
        status = 'FAILED';
      }

      return NextResponse.json({
        success: true,
        status,
        checkoutRequestId,
        bookingId,
        mpesaReceiptNumber,
        resultDesc: queryResponse.ResultDesc || queryResponse.ResponseDescription,
        responseCode: queryResponse.ResponseCode,
        resultCode: queryResponse.ResultCode,
      });

    } catch (error) {
      console.error('M-Pesa status query error:', error);
      
      // If it's a timeout or pending status, return pending instead of error
      if (error.message.includes('timeout') || error.message.includes('pending')) {
        return NextResponse.json({
          success: true,
          status: 'PENDING',
          checkoutRequestId,
          bookingId,
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to check payment status. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
} 