'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings (hero slider)
        const settingsRes = await api.get('/settings');
        setSettings(settingsRes.data);

        // Fetch categories from API
        const catRes = await api.get('/categories');
        const cats = catRes.data || [];
        setCategories(cats);

        // Fetch products for each category dynamically
        const productsMap = {};
        for (const cat of cats.slice(0, 4)) {
          try {
            const prodRes = await api.get(`/products?category=${cat.slug}&limit=4`);
            productsMap[cat.slug] = prodRes.data.products || [];
          } catch (e) {
            productsMap[cat.slug] = [];
          }
        }
        setCategoryProducts(productsMap);

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleScroll = () => {
      setShowLogo(window.scrollY < 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroSlide = settings?.hero_slides?.[0];

  // Helper function to get category link based on slug
  const getCategoryLink = (slug) => {
    const linkMap = {
      'watch': '/watch',
      'menswear': '/menswear',
      'womenswear': '/womenswear',
      'beauty': '/beauty',
    };
    return linkMap[slug] || `/shop?category=${slug}`;
  };

  // Featured Section Component - Standard gap
  const FeaturedSection = ({ title, products, viewAllLink }) => {
    if (!products || products.length === 0) return null;

    return (
      <section style={{ backgroundColor: '#FFFFFF', paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1800, margin: '0 auto', padding: '0 50px' }}>
          {/* Section Title - Standard margin */}
          <h2 style={{ 
            fontSize: 32, 
            fontWeight: 400, 
            lineHeight: '40px',
            letterSpacing: 8, 
            textAlign: 'center', 
            marginBottom: 40,
            color: '#0C0C0C',
            textTransform: 'uppercase'
          }}>
            {title}
          </h2>
          
          {/* Products Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 30
          }}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* View All Button */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link 
              href={viewAllLink}
              style={{
                display: 'inline-block',
                padding: '14px 40px',
                backgroundColor: '#0C0C0C',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: 3,
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid #0C0C0C'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#B08B5C';
                e.currentTarget.style.borderColor = '#B08B5C';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#0C0C0C';
                e.currentTarget.style.borderColor = '#0C0C0C';
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
    <div style={{ backgroundColor: '#FFFFFF' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', height: '100vh', width: '100%' }}>
        {heroSlide?.image_url ? (
          <Image
            src={heroSlide.image_url}
            alt="PRISMIN"
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
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          }}>
            <p style={{ color: '#666', fontSize: 14 }}>Upload hero image from Admin Panel</p>
          </div>
        )}
        
        {/* Hero Buttons */}
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 16
        }}>
          <Link 
            href="/womenswear"
            style={{
              padding: '14px 36px',
              backgroundColor: '#FFFFFF',
              color: '#0C0C0C',
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
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
              padding: '14px 36px',
              backgroundColor: '#FFFFFF',
              color: '#0C0C0C',
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
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
      </section>

      {/* Category Section - DYNAMIC FROM API */}
      <section style={{ backgroundColor: '#FFFFFF', paddingTop: 70, paddingBottom: 50 }}>
        <h2 style={{ 
          fontSize: 32, 
          fontWeight: 400, 
          lineHeight: '40px',
          letterSpacing: 8, 
          textAlign: 'center', 
          marginBottom: 50,
          color: '#0C0C0C',
          textTransform: 'uppercase'
        }}>
          Explore Our Collection
        </h2>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 50
        }}>
          {/* Map through first 4 categories from API */}
          {categories.slice(0, 4).map((cat) => (
            <Link 
              key={cat._id} 
              href={getCategoryLink(cat.slug)}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div 
                style={{ 
                  position: 'relative', 
                  width: 405,
                  height: 545,
                  backgroundColor: '#E8E8E8', 
                  overflow: 'hidden',
                  marginBottom: 16
                }}
                className="category-image"
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
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
                    backgroundColor: '#E0E0E0'
                  }}>
                    <span style={{ color: '#999', fontSize: 13 }}>No Image</span>
                  </div>
                )}
              </div>
              
              <h3 style={{ 
                textAlign: 'center', 
                fontSize: 16, 
                fontWeight: 500, 
                lineHeight: '24px',
                color: '#0C0C0C',
                margin: 0
              }}>
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Sections - FULLY DYNAMIC FROM API */}
      {categories.slice(0, 4).map((cat) => (
        <FeaturedSection 
          key={cat._id}
          title={`Featured ${cat.name}`}
          products={categoryProducts[cat.slug] || []}
          viewAllLink={getCategoryLink(cat.slug)}
        />
      ))}

      {/* Newsletter */}
      <section style={{ backgroundColor: '#0C0C0C', padding: '70px 0' }}>
        <div style={{ maxWidth: 550, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 400, 
            letterSpacing: 6, 
            marginBottom: 12,
            color: '#FFFFFF',
            textTransform: 'uppercase'
          }}>
            Stay Updated
          </h2>
          <p style={{ 
            color: '#888', 
            marginBottom: 30, 
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
                padding: '14px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #444',
                color: '#FFFFFF',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px 30px',
                backgroundColor: '#FFFFFF',
                color: '#0C0C0C',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: 2,
                textTransform: 'uppercase',
                border: 'none',
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

      {/* Hover Effect Styles */}
      <style jsx global>{`
        .category-image:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
