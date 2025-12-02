'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings
        const settingsRes = await api.get('/settings');
        setSettings(settingsRes.data);

        // Fetch categories
        const catRes = await api.get('/categories');
        setCategories(catRes.data || []);

        // Fetch featured products
        const prodRes = await api.get('/products?limit=8');
        setFeaturedProducts(prodRes.data.products || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroSlide = settings?.hero_slides?.[0];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[90vh] bg-primary-200">
        {heroSlide?.image_url ? (
          <Image
            src={heroSlide.image_url}
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-200">
            <p className="text-muted">Upload hero image from Admin Panel</p>
          </div>
        )}
        
        {/* Hero Buttons */}
        <div className="absolute bottom-16 md:bottom-24 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Link 
            href="/shop?category=womenswear"
            className="px-8 py-3 bg-white text-focus text-sm tracking-[0.2em] hover:bg-focus hover:text-white transition-colors"
          >
            FOR HER
          </Link>
          <Link 
            href="/shop?category=menswear"
            className="px-8 py-3 bg-white text-focus text-sm tracking-[0.2em] hover:bg-focus hover:text-white transition-colors"
          >
            FOR HIM
          </Link>
        </div>
      </section>

      {/* Categories Section - Gucci Style */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl text-center tracking-[0.15em] mb-12 md:mb-16 font-light uppercase">
            Shop by Category
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {categories.slice(0, 4).map((category) => (
              <Link 
                key={category._id} 
                href={`/shop?category=${category.slug}`}
                className="group text-center"
              >
                <div className="relative aspect-square bg-primary-100 overflow-hidden mb-4">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary-200">
                      <span className="text-muted text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm tracking-[0.15em] font-light uppercase">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-primary-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl text-center tracking-[0.15em] mb-12 md:mb-16 font-light uppercase">
            New Arrivals
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/shop"
              className="inline-block px-10 py-4 border border-focus text-sm tracking-[0.2em] hover:bg-focus hover:text-white transition-colors uppercase"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* Split Banner Section */}
      <section className="grid md:grid-cols-2">
        <Link 
          href="/shop?category=menswear"
          className="relative h-[50vh] md:h-[70vh] bg-primary-200 group overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl tracking-[0.2em] font-light mb-4 uppercase">Menswear</h3>
              <span className="text-sm tracking-[0.15em] border-b border-focus pb-1 group-hover:border-gold transition-colors uppercase">
                Explore
              </span>
            </div>
          </div>
        </Link>
        
        <Link 
          href="/shop?category=womenswear"
          className="relative h-[50vh] md:h-[70vh] bg-primary-300 group overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl tracking-[0.2em] font-light mb-4 uppercase">Womenswear</h3>
              <span className="text-sm tracking-[0.15em] border-b border-focus pb-1 group-hover:border-gold transition-colors uppercase">
                Explore
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-focus text-white">
        <div className="container-custom max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl tracking-[0.15em] mb-4 font-light uppercase">
            Stay Updated
          </h2>
          <p className="text-primary-400 mb-8 text-sm">
            Subscribe to receive updates on new arrivals and special offers
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-transparent border border-primary-600 text-white placeholder:text-primary-500 focus:border-white outline-none text-sm"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-focus text-sm tracking-[0.15em] hover:bg-gold hover:text-white transition-colors uppercase"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
