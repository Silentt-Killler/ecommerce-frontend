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

  const categoryData = [
    { name: 'Watches', slug: 'watch', link: '/watch' },
    { name: 'Menswear', slug: 'menswear', link: '/menswear' },
    { name: 'Womenswear', slug: 'womenswear', link: '/womenswear' },
    { name: 'Accessories', slug: 'accessories', link: '/shop?category=accessories' }
  ];

  // Featured Section Component - Gucci Style
  const FeaturedSection = ({ title, products, viewAllLink, bgColor = '#FFFFFF' }) => {
    if (!products || products.length === 0) return null;

    return (
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

          {/* View All Button - Gucci Style */}
          <div style={{ textAlign: 'center' }}>
            <Link 
              href={viewAllLink}
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
    <div style={{ backgroundColor: '#F7F7F7' }}>
      {/* Hero Section - Full Screen with Gucci Style Buttons */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 700 }}>
        {heroSlide?.image_url ? (
          <Image
            src={heroSlide.image_url}
            alt="Hero"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        ) : (
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
        
        {/* Dark Overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        
        {/* Hero Content - Bottom Center */}
        <div style={{ 
          position: 'absolute', 
          bottom: 80, 
          left: '50%', 
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          {/* Gucci-style Buttons */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            <Link 
              href="/womenswear"
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
                  style={{ textDecoration: 'none', display: 'block' }}
                >
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
                        style={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.6s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ) : (
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
        bgColor="#F7F7F7"
      />

      {/* Featured Menswear */}
      <FeaturedSection 
        title="Featured Menswear" 
        products={menswearProducts} 
        viewAllLink="/menswear"
        bgColor="#FFFFFF"
      />

      {/* Featured Womenswear */}
      <FeaturedSection 
        title="Featured Womenswear" 
        products={womenswearProducts} 
        viewAllLink="/womenswear"
        bgColor="#F7F7F7"
      />

      {/* Featured Accessories */}
      <FeaturedSection 
        title="Featured Accessories" 
        products={accessoriesProducts} 
        viewAllLink="/shop?category=accessories"
        bgColor="#FFFFFF"
      />

      {/* Newsletter Section */}
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
          <p style={{ 
            color: '#919191', 
            marginBottom: 40, 
            fontSize: 14, 
            letterSpacing: 1 
          }}>
            Subscribe to receive updates on new arrivals and special offers
          </p>
          
          <form style={{ display: 'flex', gap: 0 }}>
            <input
              type="email"
              placeholder="Enter your email"
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
