'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const fetchData = async () => {
      try {
        const settingsRes = await api.get('/settings');
        setSettings(settingsRes.data);

        const catRes = await api.get('/categories');
        const cats = catRes.data || [];
        setCategories(cats);

        const productsMap = {};
        for (const cat of cats.slice(0, 4)) {
          try {
            const prodRes = await api.get(`/products?category=${cat.slug}&limit=8`);
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
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const heroSlide = settings?.hero_slides?.[0];

  const getCategoryLink = (slug) => {
    const linkMap = {
      'watch': '/watch',
      'menswear': '/menswear',
      'womenswear': '/womenswear',
      'beauty': '/beauty',
    };
    return linkMap[slug] || `/shop?category=${slug}`;
  };

  // Mobile Featured Section - Premium Layout
  const MobileFeaturedSection = ({ title, products, viewAllLink }) => {
    if (!products || products.length === 0) return null;

    return (
      <section style={{ 
        backgroundColor: '#FFFFFF', 
        paddingTop: 48,
        paddingBottom: 32
      }}>
        {/* Section Title - Luxury Typography */}
        <h2 style={{ 
          fontSize: 13, 
          fontWeight: 500, 
          letterSpacing: 3, 
          textAlign: 'center', 
          marginBottom: 28,
          color: '#0C0C0C',
          textTransform: 'uppercase'
        }}>
          {title}
        </h2>
        
        {/* Product Grid - Tight Gap for Premium Feel */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1, // Minimal gap - Gucci style
          backgroundColor: '#E8E8E8' // Line color between cards
        }}>
          {products.slice(0, 4).map((product) => (
            <div key={product._id} style={{ backgroundColor: '#FFFFFF' }}>
              <ProductCard product={product} isMobile={true} />
            </div>
          ))}
        </div>

        {/* View All - Minimal */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link 
            href={viewAllLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#0C0C0C',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 1,
              textDecoration: 'none',
              textTransform: 'uppercase'
            }}
          >
            View All
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </section>
    );
  };

  // Desktop Featured Section - Original
  const DesktopFeaturedSection = ({ title, products, viewAllLink }) => {
    if (!products || products.length === 0) return null;

    return (
      <section style={{ backgroundColor: '#FFFFFF', paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1800, margin: '0 auto', padding: '0 50px' }}>
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
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 30
          }}>
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link 
              href={viewAllLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#0C0C0C',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              View All
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', paddingBottom: isMobile ? 90 : 0 }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        height: isMobile ? '90vh' : '100vh', 
        width: '100%' 
      }}>
        {(isMobile ? heroSlide?.mobile_image_url : heroSlide?.image_url) || heroSlide?.image_url ? (
          <Image
            src={(isMobile && heroSlide?.mobile_image_url) ? heroSlide.mobile_image_url : heroSlide?.image_url}
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
          bottom: isMobile ? 50 : 80,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'row',
          gap: isMobile ? 10 : 16
        }}>
          <Link 
            href="/womenswear"
            style={{
              padding: isMobile ? '14px 28px' : '14px 36px',
              backgroundColor: '#FFFFFF',
              color: '#0C0C0C',
              fontSize: isMobile ? 10 : 12,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            For Her
          </Link>
          <Link 
            href="/menswear"
            style={{
              padding: isMobile ? '14px 28px' : '14px 36px',
              backgroundColor: '#FFFFFF',
              color: '#0C0C0C',
              fontSize: isMobile ? 10 : 12,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            For Him
          </Link>
        </div>
      </section>

      {/* Category Section */}
      <section style={{ 
        backgroundColor: '#FFFFFF', 
        paddingTop: isMobile ? 48 : 70, 
        paddingBottom: isMobile ? 32 : 50 
      }}>
        <h2 style={{ 
          fontSize: isMobile ? 13 : 32, 
          fontWeight: isMobile ? 500 : 400, 
          letterSpacing: isMobile ? 3 : 8, 
          textAlign: 'center', 
          marginBottom: isMobile ? 28 : 50,
          color: '#0C0C0C',
          textTransform: 'uppercase'
        }}>
          {isMobile ? 'EXPLORE' : 'Explore Our Collection'}
        </h2>
        
        {/* Mobile: 2x2 Grid - Edge to Edge */}
        {isMobile ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 1,
            backgroundColor: '#E8E8E8'
          }}>
            {categories.slice(0, 4).map((cat) => (
              <Link 
                key={cat._id} 
                href={getCategoryLink(cat.slug)}
                style={{ 
                  textDecoration: 'none', 
                  display: 'block',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ 
                  position: 'relative', 
                  aspectRatio: '3/4',
                  backgroundColor: '#F5F5F5', 
                  overflow: 'hidden'
                }}>
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      style={{ objectFit: 'cover' }}
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
                      <span style={{ color: '#999', fontSize: 12 }}>No Image</span>
                    </div>
                  )}
                  
                  {/* Category Name Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px 12px 16px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.5))'
                  }}>
                    <h3 style={{ 
                      fontSize: 12, 
                      fontWeight: 500, 
                      color: '#FFFFFF',
                      textAlign: 'center',
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      margin: 0
                    }}>
                      {cat.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Desktop: Horizontal layout */
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: 50
          }}>
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
        )}
      </section>

      {/* Featured Sections */}
      {categories.slice(0, 4).map((cat) => (
        isMobile ? (
          <MobileFeaturedSection 
            key={cat._id}
            title={`Featured ${cat.name}`}
            products={categoryProducts[cat.slug] || []}
            viewAllLink={getCategoryLink(cat.slug)}
          />
        ) : (
          <DesktopFeaturedSection 
            key={cat._id}
            title={`Featured ${cat.name}`}
            products={categoryProducts[cat.slug] || []}
            viewAllLink={getCategoryLink(cat.slug)}
          />
        )
      ))}

      {/* Newsletter */}
      <section style={{ 
        backgroundColor: '#0C0C0C', 
        padding: isMobile ? '50px 20px' : '70px 0' 
      }}>
        <div style={{ 
          maxWidth: 500, 
          margin: '0 auto', 
          textAlign: 'center' 
        }}>
          <h2 style={{ 
            fontSize: isMobile ? 12 : 24, 
            fontWeight: isMobile ? 500 : 400, 
            letterSpacing: isMobile ? 3 : 6, 
            marginBottom: 12,
            color: '#FFFFFF',
            textTransform: 'uppercase'
          }}>
            Stay Updated
          </h2>
          <p style={{ 
            color: '#888', 
            marginBottom: 28, 
            fontSize: isMobile ? 12 : 13, 
            letterSpacing: 0.5,
            lineHeight: 1.6
          }}>
            Subscribe for exclusive offers and new arrivals
          </p>
          
          <form style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 12 : 0 
          }}>
            <input
              type="email"
              placeholder="Your email address"
              style={{
                flex: 1,
                padding: '14px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                color: '#FFFFFF',
                fontSize: 13,
                outline: 'none',
                letterSpacing: 0.5
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px 32px',
                backgroundColor: '#FFFFFF',
                color: '#0C0C0C',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: 2,
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Styles */}
      <style jsx global>{`
        .category-image:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
