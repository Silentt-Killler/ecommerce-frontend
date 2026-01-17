'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
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

  // Mobile Featured Section with horizontal scroll
  const MobileFeaturedSection = ({ title, products, viewAllLink }) => {
    const scrollRef = useRef(null);
    
    if (!products || products.length === 0) return null;

    const scroll = (direction) => {
      if (scrollRef.current) {
        const scrollAmount = scrollRef.current.offsetWidth * 0.8;
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    return (
      <section style={{ backgroundColor: '#FFFFFF', padding: '40px 0' }}>
        <h2 style={{ 
          fontSize: 16, 
          fontWeight: 500, 
          letterSpacing: 3, 
          textAlign: 'center', 
          marginBottom: 24,
          color: '#0C0C0C',
          textTransform: 'uppercase',
          padding: '0 16px'
        }}>
          {title}
        </h2>
        
        {/* Scrollable Products */}
        <div style={{ position: 'relative' }}>
          <div
            ref={scrollRef}
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              paddingLeft: 16,
              paddingRight: 16,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            className="hide-scrollbar"
          >
            {products.map((product, idx) => (
              <div 
                key={product._id} 
                style={{ 
                  flex: '0 0 calc(50% - 6px)',
                  scrollSnapAlign: 'start',
                  minWidth: 'calc(50% - 6px)'
                }}
              >
                <ProductCard product={product} isMobile={true} />
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div style={{ textAlign: 'center', marginTop: 24, padding: '0 16px' }}>
          <Link 
            href={viewAllLink}
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#0C0C0C',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: '1px solid #0C0C0C'
            }}
          >
            View All
          </Link>
        </div>
      </section>
    );
  };

  // Desktop Featured Section
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
    <div style={{ backgroundColor: '#FFFFFF', paddingBottom: isMobile ? 80 : 0 }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        height: isMobile ? '85vh' : '100vh', 
        width: '100%' 
      }}>
        {/* Hero Image - Use mobile_image on mobile */}
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
          bottom: isMobile ? 60 : 80,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 16,
          width: isMobile ? 'calc(100% - 48px)' : 'auto'
        }}>
          <Link 
            href="/womenswear"
            style={{
              padding: isMobile ? '14px 24px' : '14px 36px',
              backgroundColor: '#FFFFFF',
              color: '#0C0C0C',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            For Her
          </Link>
          <Link 
            href="/menswear"
            style={{
              padding: isMobile ? '14px 24px' : '14px 36px',
              backgroundColor: '#FFFFFF',
              color: '#0C0C0C',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            For Him
          </Link>
        </div>
      </section>

      {/* Category Section */}
      <section style={{ 
        backgroundColor: '#FFFFFF', 
        paddingTop: isMobile ? 40 : 70, 
        paddingBottom: isMobile ? 20 : 50 
      }}>
        <h2 style={{ 
          fontSize: isMobile ? 16 : 32, 
          fontWeight: isMobile ? 500 : 400, 
          letterSpacing: isMobile ? 3 : 8, 
          textAlign: 'center', 
          marginBottom: isMobile ? 24 : 50,
          color: '#0C0C0C',
          textTransform: 'uppercase',
          padding: isMobile ? '0 16px' : 0
        }}>
          {isMobile ? 'Explore The New Styles' : 'Explore Our Collection'}
        </h2>
        
        {/* Mobile: 2x2 Grid like Gucci */}
        {isMobile ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 2,
            padding: '0 16px'
          }}>
            {categories.slice(0, 4).map((cat) => (
              <Link 
                key={cat._id} 
                href={getCategoryLink(cat.slug)}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div style={{ 
                  position: 'relative', 
                  aspectRatio: '1/1.2',
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
                </div>
                
                <h3 style={{ 
                  textAlign: 'center', 
                  fontSize: 13, 
                  fontWeight: 500, 
                  color: '#0C0C0C',
                  padding: '12px 8px',
                  margin: 0
                }}>
                  {cat.name}
                </h3>
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
        padding: isMobile ? '50px 16px' : '70px 0' 
      }}>
        <div style={{ 
          maxWidth: 550, 
          margin: '0 auto', 
          padding: isMobile ? 0 : '0 24px', 
          textAlign: 'center' 
        }}>
          <h2 style={{ 
            fontSize: isMobile ? 18 : 24, 
            fontWeight: 400, 
            letterSpacing: isMobile ? 3 : 6, 
            marginBottom: 12,
            color: '#FFFFFF',
            textTransform: 'uppercase'
          }}>
            Stay Updated
          </h2>
          <p style={{ 
            color: '#888', 
            marginBottom: 24, 
            fontSize: isMobile ? 12 : 13, 
            letterSpacing: 1 
          }}>
            Subscribe to receive updates on new arrivals and special offers
          </p>
          
          <form style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 12 : 0 
          }}>
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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
