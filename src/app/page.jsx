'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import CategorySection from '@/components/home/CategorySection';
import TrustSection from '@/components/home/TrustSection';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const response = await fetch('/api/properties/featured');
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured properties');
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setProperties(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturedProperties properties={properties} loading={loading} error={error} />
      <CategorySection />
      <TrustSection />
      <Footer />
    </main>
  );
} 