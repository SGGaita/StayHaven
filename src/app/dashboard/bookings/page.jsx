'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/auth/signin');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/dashboard/bookings', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, router, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No bookings found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {booking.property.photos && booking.property.photos[0] && (
                <div className="relative h-48 w-full">
                  <Image
                    src={booking.property.photos[0]}
                    alt={booking.property.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{booking.property.name}</h3>
                <div className="text-gray-600 space-y-2">
                  <p>Check-in: {formatDate(booking.startDate)}</p>
                  <p>Check-out: {formatDate(booking.endDate)}</p>
                  <p>Status: <span className="capitalize">{booking.status.toLowerCase()}</span></p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold">Total Cost: ${booking.subtotal.toFixed(2)}</p>
                    {booking.cleaningFee > 0 && (
                      <p className="text-sm">Cleaning Fee: ${booking.cleaningFee.toFixed(2)}</p>
                    )}
                    {booking.securityDeposit > 0 && (
                      <p className="text-sm">Security Deposit: ${booking.securityDeposit.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage; 