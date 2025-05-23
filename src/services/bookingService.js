// Simulates API calls for booking functionality
export const bookingService = {
  // Check if dates are available
  checkAvailability: async (propertyId, checkIn, checkOut) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock availability check (randomly available 80% of the time)
    const isAvailable = Math.random() < 0.8;
    
    if (!isAvailable) {
      throw new Error('Selected dates are not available');
    }
    
    return true;
  },

  // Create a booking
  createBooking: async (bookingData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a random booking reference
    const bookingRef = 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    return {
      ...bookingData,
      bookingRef,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
  }
}; 