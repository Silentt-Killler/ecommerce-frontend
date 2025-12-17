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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRes = await api.get('/settings');
        setSettings(settingsRes.data);

        const catRes = await api.get('/categories');
        setCategories(catRes.data || []);

        // Fetch products for each category
        try {
          const watchRes = await api.get('/products?category=watch&limit=4');
          setWatchProducts(watchRes.data.products || []);
        } catch (e) { setWatchProducts([]); }

        try {
          const menswearRes = await api.get('/products?category=menswear&limit=4');
          setMenswearProducts(menswearRes.data.products || []);
        } catch (e) { setMenswearProducts([]); }

        try {
          const womenswearRes = await api.get('/products?category=womenswear&limit=4');
          setWomenswearProducts(womenswearRes.data.products || []);
        } catch (e) { setWomenswearProducts([]); }

        try {
          const accessoriesRes = await api.get('/products?category=accessories&limit=4');
          setAccessoriesProducts(accessoriesRes.data.products || []);
        } catch (e) { setAccessoriesProducts([]); }

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroSlide = settings?.hero_slides?.[0];

  // Category data with proper links
  const categoryData = [
    { name: 'Watches', slug: 'watch', link: '/watch' },
    { name: 'Menswear', slug: 'menswear', link: '/menswear' },
    { name: 'Womenswear', slug: 'womenswear', link: '/womenswear' },
    { name: 'Accessories', slug: 'accessories', link: '/shop?category=accessories' }
  ];

  // Featured Section Component
  const FeaturedSection = ({ title, products, viewAllLink, bgColor = 'bg-white' }) => {
  // Featured Section Component - Gucci Style
  const FeaturedSection = ({ title, products, viewAllLink, bgColor = '#FFFFFF' }) => {
    if (!products || products.length === 0) return null;

    return (
      <section className={`py-20 md:py-28 ${bgColor}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl tracking-[0.2em] font-light uppercase text-focus">
              {title}
            </h2>
          </div>
      <section style={{ backgroundColor: bgColor, paddingTop: 100, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px' }}>
          {/* Section Title - Gucci Style */}
          <h2 style={{ 
            fontSize: 28, 
            fontWeight: 400, 
            letterSpacing: 8, 
            textAlign: 'center', 
            marginBottom: 60,
            color: '#0C0C0C',
            textTransform: 'uppercase'
          }}>
            {title}
          </h2>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 30,
            marginBottom: 60
          }}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-14">
          {/* View All Button - Gucci Style */}
          <div style={{ textAlign: 'center' }}>
            <Link 
              href={viewAllLink}
              className="inline-block px-12 py-4 border border-focus text-xs tracking-[0.25em] hover:bg-focus hover:text-white transition-all duration-300 uppercase font-light"
              style={{
                display: 'inline-block',
                padding: '18px 50px',
                border: '1px solid #0C0C0C',
                color: '#0C0C0C',
                fontSize: 12,
                fontWeight: 400,
                letterSpacing: 3,
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: 'transparent'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0C0C0C';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#0C0C0C';
              }}
            >
              View All
            </Link>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="bg-base">
      {/* Hero Section */}
      <section className="relative h-[85vh] md:h-[95vh]">
    <div style={{ backgroundColor: '#F7F7F7' }}>
      {/* Hero Section - Full Screen with Gucci Style Buttons */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 700 }}>
        {heroSlide?.image_url ? (
          <Image
            src={heroSlide.image_url}
            alt="Hero"
            fill
            className="object-cover"
            style={{ objectFit: 'cover' }}
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-200">
            <p className="text-muted text-sm tracking-wider">Upload hero image from Admin Panel</p>
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: '#E0E0E0' 
          }}>
            <p style={{ color: '#919191', fontSize: 14, letterSpacing: 2 }}>
              Upload hero image from Admin Panel
            </p>
          </div>
        )}

        {/* Dark Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/20" />
        {/* Dark Overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />

        {/* Hero Content */}
        <div className="absolute bottom-20 md:bottom-28 left-1/2 transform -translate-x-1/2 text-center">
          {/* Optional Title */}
          {heroSlide?.title && (
            <h1 className="text-white text-3xl md:text-5xl tracking-[0.3em] font-light mb-8">
              {heroSlide.title}
            </h1>
          )}
          
        {/* Hero Content - Bottom Center */}
        <div style={{ 
          position: 'absolute', 
          bottom: 80, 
          left: '50%', 
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          {/* Gucci-style Buttons */}
          <div className="flex gap-4 md:gap-6 justify-center">
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            <Link 
              href="/womenswear"
              className="px-8 md:px-10 py-3 md:py-3.5 bg-white text-focus text-xs md:text-sm tracking-[0.2em] font-light hover:bg-focus hover:text-white transition-all duration-300 uppercase"
              style={{
                padding: '16px 45px',
                backgroundColor: '#FFFFFF',
                color: '#0C0C0C',
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: 2,
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0C0C0C';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#0C0C0C';
              }}
            >
              For Her
            </Link>
            <Link 
              href="/menswear"
              className="px-8 md:px-10 py-3 md:py-3.5 bg-white text-focus text-xs md:text-sm tracking-[0.2em] font-light hover:bg-focus hover:text-white transition-all duration-300 uppercase"
              style={{
                padding: '16px 45px',
                backgroundColor: '#FFFFFF',
                color: '#0C0C0C',
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: 2,
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0C0C0C';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#0C0C0C';
              }}
            >
              For Him
            </Link>
          </div>
        </div>
      </section>

      {/* Explore Our Collection - Category Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-2xl md:text-3xl tracking-[0.2em] font-light uppercase text-focus">
              Explore Our Collection
            </h2>
          </div>
      {/* Explore Our Collection - Category Section - Gucci Style */}
      <section style={{ backgroundColor: '#FFFFFF', paddingTop: 100, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px' }}>
          {/* Section Title */}
          <h2 style={{ 
            fontSize: 28, 
            fontWeight: 400, 
            letterSpacing: 8, 
            textAlign: 'center', 
            marginBottom: 80,
            color: '#0C0C0C',
            textTransform: 'uppercase'
          }}>
            Explore Our Collection
          </h2>

          {/* Categories Grid - Gucci Style */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Categories Grid - Centered, Gucci Style */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 30,
            maxWidth: 1200,
            margin: '0 auto'
          }}>
            {categoryData.map((cat) => {
              const categoryInfo = categories.find(c => c.slug === cat.slug);
              return (
                <Link 
                  key={cat.slug} 
                  href={cat.link}
                  className="group block"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  {/* Category Image */}
                  <div className="relative aspect-[3/4] bg-primary-100 overflow-hidden mb-5">
                  {/* Category Image - Square, Centered */}
                  <div style={{ 
                    position: 'relative', 
                    aspectRatio: '1/1', 
                    backgroundColor: '#F5F5F5', 
                    overflow: 'hidden',
                    marginBottom: 20
                  }}>
                    {categoryInfo?.image ? (
                      <Image
                        src={categoryInfo.image}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        style={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.6s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary-200">
                        <span className="text-muted text-sm tracking-wider">No Image</span>
                      <div style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#E8E8E8'
                      }}>
                        <span style={{ color: '#919191', fontSize: 13 }}>No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Category Name - Simple like Gucci */}
                  <h3 className="text-center text-sm md:text-base tracking-[0.15em] font-light text-focus">
                  {/* Category Name - Below Image, Centered */}
                  <h3 style={{ 
                    textAlign: 'center', 
                    fontSize: 15, 
                    fontWeight: 400, 
                    letterSpacing: 2,
                    color: '#0C0C0C',
                    margin: 0
                  }}>
                    {cat.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Watches */}
      <FeaturedSection 
        title="Featured Watches" 
        products={watchProducts} 
        viewAllLink="/watch"
        bgColor="bg-base"
        bgColor="#F7F7F7"
      />

      {/* Featured Menswear */}
      <FeaturedSection 
        title="Featured Menswear" 
        products={menswearProducts} 
        viewAllLink="/menswear"
        bgColor="bg-white"
        bgColor="#FFFFFF"
      />

      {/* Featured Womenswear */}
      <FeaturedSection 
        title="Featured Womenswear" 
        products={womenswearProducts} 
        viewAllLink="/womenswear"
        bgColor="bg-base"
        bgColor="#F7F7F7"
      />

      {/* Featured Accessories */}
      <FeaturedSection 
        title="Featured Accessories" 
        products={accessoriesProducts} 
        viewAllLink="/shop?category=accessories"
        bgColor="bg-white"
        bgColor="#FFFFFF"
      />

      {/* Newsletter Section */}
      <section className="py-20 md:py-28 bg-focus text-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl tracking-[0.2em] mb-5 font-light uppercase">
      <section style={{ backgroundColor: '#0C0C0C', paddingTop: 100, paddingBottom: 100 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 400, 
            letterSpacing: 6, 
            marginBottom: 16,
            color: '#FFFFFF',
            textTransform: 'uppercase'
          }}>
            Stay Updated
          </h2>
          <p className="text-primary-400 mb-10 text-sm tracking-wide">
          <p style={{ 
            color: '#919191', 
            marginBottom: 40, 
            fontSize: 14, 
            letterSpacing: 1 
          }}>
            Subscribe to receive updates on new arrivals and special offers
          </p>

          <form className="flex flex-col sm:flex-row gap-4">
          <form style={{ display: 'flex', gap: 0 }}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 bg-transparent border border-primary-600 text-white placeholder:text-primary-500 focus:border-white outline-none text-sm tracking-wide"
              style={{
                flex: 1,
                padding: '18px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #444',
                borderRight: 'none',
                color: '#FFFFFF',
                fontSize: 13,
                letterSpacing: 1,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              className="px-10 py-4 bg-white text-focus text-xs tracking-[0.2em] hover:bg-gold hover:text-white transition-all duration-300 uppercase font-light"
              style={{
                padding: '18px 40px',
                backgroundColor: '#FFFFFF',
                color: '#0C0C0C',
                border: 'none',
                fontSize: 12,
                fontWeight: 400,
                letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
