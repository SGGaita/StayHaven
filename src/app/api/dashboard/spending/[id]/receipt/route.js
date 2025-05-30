import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import serverLogger from '@/lib/server-logger';

export async function GET(request, { params }) {
  try {
    // Get user from cookie
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth');
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user;
    try {
      user = JSON.parse(authCookie.value);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid auth cookie' }, { status: 401 });
    }

    if (!user || !user.id) {
      return NextResponse.json({ error: 'User not found in session' }, { status: 401 });
    }

    // Only allow customers to access their receipts
    if (user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Access denied. Customer role required.' }, { status: 403 });
    }

    const bookingId = params.id;

    // Fetch the booking with property details
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: user.id, // Ensure user can only access their own bookings
      },
      include: {
        property: {
          select: {
            name: true,
            location: true,
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Generate receipt data
    const receiptData = {
      bookingRef: booking.bookingRef,
      propertyName: booking.property.name,
      location: booking.property.location,
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      customerEmail: booking.customer.email,
      checkIn: booking.startDate.toISOString().split('T')[0],
      checkOut: booking.endDate.toISOString().split('T')[0],
      nights: Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)),
      baseAmount: booking.price * 0.85, // Assuming 85% is base accommodation
      serviceFee: booking.price * 0.08,
      cleaningFee: booking.price * 0.05,
      taxes: booking.price * 0.02,
      totalAmount: booking.price,
      status: booking.status,
      bookingDate: booking.createdAt.toISOString().split('T')[0],
    };

    // Generate simple HTML receipt
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>StayHaven Receipt - ${receiptData.bookingRef}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #FF385C; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #FF385C; font-size: 24px; font-weight: bold; }
          .receipt-title { color: #333; margin: 10px 0; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; color: #FF385C; margin-bottom: 10px; }
          .row { display: flex; justify-content: space-between; margin: 5px 0; }
          .total-row { border-top: 1px solid #ddd; padding-top: 10px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">StayHaven</div>
          <h2 class="receipt-title">Booking Receipt</h2>
          <p>Receipt #: ${receiptData.bookingRef}</p>
        </div>

        <div class="section">
          <div class="section-title">Booking Details</div>
          <div class="row"><span>Property:</span><span>${receiptData.propertyName}</span></div>
          <div class="row"><span>Location:</span><span>${receiptData.location}</span></div>
          <div class="row"><span>Check-in:</span><span>${receiptData.checkIn}</span></div>
          <div class="row"><span>Check-out:</span><span>${receiptData.checkOut}</span></div>
          <div class="row"><span>Nights:</span><span>${receiptData.nights}</span></div>
          <div class="row"><span>Status:</span><span>${receiptData.status}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Guest Information</div>
          <div class="row"><span>Name:</span><span>${receiptData.customerName}</span></div>
          <div class="row"><span>Email:</span><span>${receiptData.customerEmail}</span></div>
          <div class="row"><span>Booking Date:</span><span>${receiptData.bookingDate}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Payment Breakdown</div>
          <div class="row"><span>Accommodation (${receiptData.nights} nights):</span><span>$${receiptData.baseAmount.toFixed(2)}</span></div>
          <div class="row"><span>Service Fee:</span><span>$${receiptData.serviceFee.toFixed(2)}</span></div>
          <div class="row"><span>Cleaning Fee:</span><span>$${receiptData.cleaningFee.toFixed(2)}</span></div>
          <div class="row"><span>Taxes:</span><span>$${receiptData.taxes.toFixed(2)}</span></div>
          <div class="row total-row"><span>Total Amount:</span><span>$${receiptData.totalAmount.toFixed(2)}</span></div>
        </div>

        <div class="footer">
          <p>Thank you for choosing StayHaven!</p>
          <p>For support, contact us at support@stayhaven.com</p>
        </div>
      </body>
      </html>
    `;

    serverLogger.apiInfo('receipt-generation', 'Receipt generated successfully', {
      userId: user.id,
      bookingId: bookingId,
      bookingRef: booking.bookingRef,
    });

    // Return HTML receipt
    return new NextResponse(receiptHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="receipt-${receiptData.bookingRef}.html"`,
      },
    });

  } catch (error) {
    serverLogger.apiError('receipt-generation', 'Error generating receipt', { error });
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
} 