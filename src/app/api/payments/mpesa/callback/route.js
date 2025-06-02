import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));
    
    // Extract callback data
    const { Body } = body;
    if (!Body || !Body.stkCallback) {
      console.error('Invalid callback format');
      return NextResponse.json({ 
        ResultCode: 1, 
        ResultDesc: 'Invalid callback format' 
      });
    }

    const { 
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata 
    } = Body.stkCallback;

    console.log('Processing callback for CheckoutRequestID:', CheckoutRequestID);
    console.log('Result Code:', ResultCode, 'Result Description:', ResultDesc);

    if (ResultCode === 0) {
      // Payment successful
      console.log('Payment successful!');
      
      // Extract payment details from metadata
      let amount = null;
      let mpesaReceiptNumber = null;
      let phoneNumber = null;
      let transactionDate = null;

      if (CallbackMetadata && CallbackMetadata.Item) {
        CallbackMetadata.Item.forEach(item => {
          switch (item.Name) {
            case 'Amount':
              amount = item.Value;
              break;
            case 'MpesaReceiptNumber':
              mpesaReceiptNumber = item.Value;
              break;
            case 'PhoneNumber':
              phoneNumber = item.Value;
              break;
            case 'TransactionDate':
              transactionDate = item.Value;
              break;
          }
        });
      }

      console.log('Payment Details:', {
        amount,
        mpesaReceiptNumber,
        phoneNumber,
        transactionDate
      });

      // Find and update booking based on CheckoutRequestID
      try {
        // We need to find the booking associated with this CheckoutRequestID
        // Since we don't store CheckoutRequestID directly, we'll need to use other methods
        // For now, we'll log the successful payment and handle it via the status polling
        
        console.log(`✅ Payment confirmed via callback for CheckoutRequestID: ${CheckoutRequestID}`);
        console.log(`📧 M-Pesa Receipt Number: ${mpesaReceiptNumber}`);
        console.log(`💰 Amount: ${amount}`);
        console.log(`📱 Phone: ${phoneNumber}`);
        
        // TODO: If we had CheckoutRequestID stored in booking, we could update directly:
        // const updatedBooking = await prisma.booking.update({
        //   where: { checkoutRequestId: CheckoutRequestID },
        //   data: {
        //     status: 'CONFIRMED',
        //     paymentStatus: 'PAID',
        //     mpesaReceiptNumber: mpesaReceiptNumber,
        //     paymentDate: new Date(transactionDate),
        //     updatedAt: new Date(),
        //   },
        // });
        
      } catch (error) {
        console.error('Error updating booking after payment:', error);
      }
      
    } else {
      // Payment failed or cancelled
      console.log('Payment failed or cancelled. Result Code:', ResultCode);
      console.log('Result Description:', ResultDesc);
      
      // TODO: Update booking status to reflect payment failure
      // TODO: Notify customer of payment failure
    }

    // Always respond with success to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully'
    });

  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    
    // Return success even on error to prevent M-Pesa from retrying
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback received'
    });
  }
} 