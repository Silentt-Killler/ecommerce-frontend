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
  const [showLogo, setShowLogo] = useState(true);

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

    // Hide large logo on scroll
    const handleScroll = () => {
      setShowLogo(window.scrollY < 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroSlide = settings?.hero_slides?.[0];

  const categoryData = [
    { name: 'Watches', slug: 'watch', link: '/watch' },
    { name: 'Menswear', slug: 'menswear', link: '/menswear' },
    { name: 'Womenswear', slug: 'womenswear', link: '/womenswear' },
    { name: 'Accessories', slug: 'accessories', link: '/shop?category=accessories' }
  ];

  // Featured Section Component
  const FeaturedSection = ({ title, products, viewAllLink, bgColor = '#FFFFFF' }) => {
    if (!products || products.length === 0) return null;

    return (
      <section style={{ backgroundColor: bgColor, padding: '80px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px' }}>
          {/* Section Title */}
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 400, 
            letterSpacing: 6, 
            textAlign: 'center', 
            marginBottom: 50,
            color: '#0C0C0C',
            textTransform: 'uppercase'
          }}>
            {title}
          </h2>
          
          {/* Products Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 24
          }}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* View All Button */}
          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <Link 
              href={viewAllLink}
              style={{
                display: 'inline-block',
                padding: '16px 48px',
                border: '1px solid #0C0C0C',
                color: '#0C0C0C',
                fontSize: 12,
                fontWeight: 400,
                letterSpacing: 2,
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
      {/* Hero Section - Full Screen */}
      <section style={{ position: 'relative', height: '100vh', width: '100%' }}>
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
            backgroundColor: '#D0D0D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <p style={{ color: '#919191', fontSize: 14, letterSpacing: 2 }}>
              Upload hero image from Admin Panel
            </p>
          </div>
        )}
        
        {/* Large Logo - Gucci Style (centered on hero, fades out on scroll) */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: showLogo ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none'
        }}>
          <h1 style={{
            fontSize: 'clamp(80px, 15vw, 200px)',
            fontWeight: 300,
            letterSpacing: '0.15em',
            color: '#FFFFFF',
            margin: 0,
            textShadow: '0 2px 40px rgba(0,0,0,0.1)'
          }}>
            PRISMIN
          </h1>
        </div>
        
        {/* Hero Content - Bottom Center */}
        <div style={{ 
          position: 'absolute', 
          bottom: 100, 
          left: '50%', 
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          {/* Optional Title above buttons */}
          <p style={{
            fontSize: 18,
            fontWeight: 300,
            letterSpacing: 3,
            color: '#FFFFFF',
            marginBottom: 24,
            fontStyle: 'italic'
          }}>
            Premium Collection
          </p>
          
          {/* Gucci-style Buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link 
              href="/womenswear"
              style={{
                padding: '14px 40px',
                backgroundColor: '#FFFFFF',
                color: '#0C0C0C',
                fontSize: 12,
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
                padding: '14px 40px',
                backgroundColor: '#FFFFFF',
                color: '#0C0C0C',
                fontSize: 12,
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

      {/* Category Section - Gucci Style */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '100px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px' }}>
          {/* Section Title - with proper spacing */}
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 400, 
            letterSpacing: 6, 
            textAlign: 'center', 
            marginBottom: 70,
            color: '#0C0C0C',
            textTransform: 'uppercase'
          }}>
            Explore Our Collection
          </h2>
          
          {/* Categories Grid - Large Images like Gucci */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 24
          }}>
            {categoryData.map((cat) => {
              const categoryInfo = categories.find(c => c.slug === cat.slug);
              return (
                <Link 
                  key={cat.slug} 
                  href={cat.link}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  {/* Category Image - Tall like Gucci */}
                  <div 
                    style={{ 
                      position: 'relative', 
                      paddingBottom: '130%', /* Tall aspect ratio like Gucci */
                      backgroundColor: '#F0F0F0', 
                      overflow: 'hidden',
                      marginBottom: 16
                    }}
                    className="category-image"
                  >
                    {categoryInfo?.image ? (
                      <Image
                        src={categoryInfo.image}
                        alt={cat.name}
                        fill
                        style={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.6s ease'
                        }}
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
                  
                  {/* Category Name - Centered below image */}
                  <h3 style={{ 
                    textAlign: 'center', 
                    fontSize: 14, 
                    fontWeight: 400, 
                    letterSpacing: 1,
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
      <section style={{ backgroundColor: '#0C0C0C', padding: '80px 0' }}>
        <div style={{ maxWidth: 550, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 22, 
            fontWeight: 400, 
            letterSpacing: 4, 
            marginBottom: 12,
            color: '#FFFFFF',
            textTransform: 'uppercase'
          }}>
            Stay Updated
          </h2>
          <p style={{ 
            color: '#919191', 
            marginBottom: 32, 
            fontSize: 13, 
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
                padding: '16px 20px',
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
                padding: '16px 32px',
                backgroundColor: '#FFFFFF',
                color: '#0C0C0C',
                border: 'none',
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#B08B5C';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#0C0C0C';
              }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <style jsx global>{`
        .category-image:hover img {
          transform: scale(1.05) !important;
        }
      `}</style>
    </div>
  );
}
