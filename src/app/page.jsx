'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [watchProducts, setWatchProducts] = useState([]);
  const [menswearProducts, setMenswearProducts] = useState([]);
  const [womenswearProducts, setWomenswearProducts] = useState([]);
  const [accessoriesProducts, setAccessoriesProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings
        const settingsRes = await api.get('/settings');
        setSettings(settingsRes.data);

        // Fetch categories
        const catRes = await api.get('/categories');
        setCategories(catRes.data || []);

        // Fetch Watch products
        try {
          const watchRes = await api.get('/products?category=watch&limit=4');
          setWatchProducts(watchRes.data.products || []);
        } catch (e) {
          setWatchProducts([]);
        }

        // Fetch Menswear products
        try {
          const menswearRes = await api.get('/products?category=menswear&limit=4');
          setMenswearProducts(menswearRes.data.products || []);
        } catch (e) {
          setMenswearProducts([]);
        }

        // Fetch Womenswear products
        try {
          const womenswearRes = await api.get('/products?category=womenswear&limit=4');
          setWomenswearProducts(womenswearRes.data.products || []);
        } catch (e) {
          setWomenswearProducts([]);
        }

        // Fetch Accessories products
        try {
          const accessoriesRes = await api.get('/products?category=accessories&limit=4');
          setAccessoriesProducts(accessoriesRes.data.products || []);
        } catch (e) {
          setAccessoriesProducts([]);
        }

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle scroll for PRISMIN logo animation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroSlide = settings?.hero_slides?.[0];

  // Featured Products Section Component
  const FeaturedSection = ({ title, products, categorySlug }) => {
    if (!products || products.length === 0) return null;

    return (
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl text-center tracking-[0.15em] mb-12 md:mb-16 font-light uppercase">
            {title}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href={`/shop?category=${categorySlug}`}
              className="inline-block px-10 py-4 border border-[#0C0C0C] text-sm tracking-[0.2em] hover:bg-[#0C0C0C] hover:text-white transition-colors uppercase"
            >
              View All
            </Link>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="bg-[#F7F7F7]">
      {/* PRISMIN Logo - Fixed position, moves to nav on scroll */}
      <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <h1 className="text-5xl md:text-6xl font-light tracking-[0.3em] text-[#0C0C0C]">
          PRISMIN
        </h1>
      </div>

      {/* Hero Section - Full Screen */}
      <section className="relative h-screen bg-[#F7F7F7]">
        {heroSlide?.image_url ? (
          <Image
            src={heroSlide.image_url}
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#919191] tracking-[0.2em] uppercase text-sm">
              Upload hero image from Admin Panel
            </p>
          </div>
        )}
        
        {/* Hero Text Overlay - Optional */}
        {heroSlide?.title && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl md:text-6xl font-light tracking-[0.2em] mb-4">
                {heroSlide.title}
              </h2>
              {heroSlide.subtitle && (
                <p className="text-lg tracking-[0.15em]">{heroSlide.subtitle}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Hero Buttons - Centered at bottom */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-6">
          <Link 
            href="/shop?category=womenswear"
            className="px-16 py-5 bg-white/90 backdrop-blur text-[#0C0C0C] text-xs tracking-[0.3em] hover:bg-[#0C0C0C] hover:text-white transition-all duration-300 uppercase font-light"
          >
            FOR HER
          </Link>
          <Link 
            href="/shop?category=menswear"
            className="px-16 py-5 bg-white/90 backdrop-blur text-[#0C0C0C] text-xs tracking-[0.3em] hover:bg-[#0C0C0C] hover:text-white transition-all duration-300 uppercase font-light"
          >
            FOR HIM
          </Link>
        </div>
      </section>

      {/* Categories Section - Gucci Style */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container-custom">
          {/* Section Title with proper spacing */}
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-xs tracking-[0.3em] text-[#919191] mb-4 uppercase">
              Explore
            </h2>
            <h3 className="text-3xl md:text-4xl font-light tracking-[0.2em] text-[#0C0C0C] uppercase">
              Our Collections
            </h3>
          </div>
          
          {/* Category Grid - Gucci style with taller images */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {categories.slice(0, 4).map((category) => (
              <Link 
                key={category._id} 
                href={`/shop?category=${category.slug}`}
                className="group"
              >
                {/* Taller aspect ratio like Gucci (3:4) */}
                <div className="relative aspect-[3/4] bg-[#F7F7F7] overflow-hidden mb-6">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[#919191] text-sm tracking-[0.2em] uppercase">No Image</span>
                    </div>
                  )}
                </div>
                {/* Category Name with proper spacing */}
                <h4 className="text-center text-sm tracking-[0.25em] font-light text-[#0C0C0C] uppercase">
                  {category.name}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Watch Products */}
      <FeaturedSection 
        title="Watch Collection" 
        products={watchProducts} 
        categorySlug="watch" 
      />

      {/* Featured Menswear Products */}
      <div className="bg-white">
        <FeaturedSection 
          title="Menswear" 
          products={menswearProducts} 
          categorySlug="menswear" 
        />
      </div>

      {/* Featured Womenswear Products */}
      <FeaturedSection 
        title="Womenswear" 
        products={womenswearProducts} 
        categorySlug="womenswear" 
      />

      {/* Featured Accessories Products */}
      <div className="bg-white">
        <FeaturedSection 
          title="Accessories" 
          products={accessoriesProducts} 
          categorySlug="accessories" 
        />
      </div>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-[#0C0C0C] text-white">
        <div className="container-custom max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl tracking-[0.15em] mb-4 font-light uppercase">
            Stay Updated
          </h2>
          <p className="text-[#919191] mb-8 text-sm">
            Subscribe to receive updates on new arrivals and special offers
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-transparent border border-[#919191] text-white placeholder:text-[#919191] focus:border-white outline-none text-sm"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-[#0C0C0C] text-sm tracking-[0.15em] hover:bg-[#B08B5C] hover:text-white transition-colors uppercase"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
