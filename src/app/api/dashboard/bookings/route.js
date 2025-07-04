import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    if (!session?.user?.id || !session?.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const userRole = session.user.role;

    // Auto-update booking statuses to COMPLETED for bookings where checkout date has passed
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    try {
      const updatedBookings = await prisma.booking.updateMany({
        where: {
          endDate: {
            lt: today  // endDate is before today
          },
          status: {
            in: ['CONFIRMED', 'CHECKED_IN', 'ACTIVE'] // Only update bookings that are still active
          }
        },
        data: {
          status: 'COMPLETED'
        }
      });

      if (updatedBookings.count > 0) {
        console.log(`[API][dashboard/bookings] Auto-updated ${updatedBookings.count} bookings to COMPLETED status`);
      }
    } catch (autoUpdateError) {
      console.error('Error auto-updating booking statuses:', autoUpdateError);
      // Continue with fetching bookings even if auto-update fails
    }

    let bookings;

    if (userRole === 'PROPERTY_MANAGER') {
      // For property managers, get bookings for their properties
      bookings = await prisma.booking.findMany({
        where: {
          property: {
            managerId: userId
          }
        },
        include: {
          property: {
            select: {
              id: true,
              name: true,
              location: true,
              photos: true,
              price: true,
            }
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (userRole === 'CUSTOMER') {
      // For customers, get their own bookings
      bookings = await prisma.booking.findMany({
        where: {
          customerId: userId
        },
        include: {
          property: {
            select: {
              id: true,
              name: true,
              location: true,
              photos: true,
              price: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      // For admins, get all bookings
      bookings = await prisma.booking.findMany({
        include: {
          property: {
            select: {
              id: true,
              name: true,
              location: true,
              photos: true,
              price: true,
              manager: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    console.log(`[API][dashboard/bookings] Fetched ${bookings.length} bookings for ${userRole} user ${userId}`);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 