'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slider interval
  const SLIDE_INTERVAL = 5000; // 5 seconds

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
            const prodRes = await api.get('/products?category=' + cat.slug + '&limit=8');
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

  // Get slides for current device
  const getHeroSlides = useCallback(() => {
    const slides = settings?.hero_slides || [];
    const deviceType = isMobile ? 'mobile' : 'desktop';
    const deviceSlides = slides.filter(s => (s.type || 'desktop') === deviceType && s.is_active !== false);
    
    if (deviceSlides.length === 0) {
      return slides.filter(s => s.is_active !== false);
    }
    return deviceSlides;
  }, [settings, isMobile]);

  const heroSlides = getHeroSlides();

  // Auto slide
  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Reset slide when device changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [isMobile]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const getCategoryLink = (category) => {
    if (category.url) return category.url;
    return '/' + category.slug;
  };

  // Find Original and Inspired categories for buttons
  const getButtonCategories = () => {
    const original = categories.find(c => 
      c.slug?.toLowerCase().includes('original') || c.name?.toLowerCase().includes('original')
    );
    const inspired = categories.find(c => 
      c.slug?.toLowerCase().includes('inspired') || c.name?.toLowerCase().includes('inspired')
    );
    return { original, inspired };
  };

  const { original, inspired } = getButtonCategories();

  const MobileFeaturedSection = ({ title, products, viewAllLink }) => {
    if (!products || products.length === 0) return null;
    return (
      <section style={{ backgroundColor: '#FFFFFF', paddingTop: 40, paddingBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: 2, textAlign: 'center', marginBottom: 24, color: '#0C0C0C', textTransform: 'uppercase', padding: '0 16px' }}>{title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '0 16px' }}>
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} isMobile={true} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, padding: '0 16px' }}>
          <Link href={viewAllLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0C0C0C', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            View All <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </section>
    );
  };

  const DesktopFeaturedSection = ({ title, products, viewAllLink }) => {
    if (!products || products.length === 0) return null;
    return (
      <section style={{ backgroundColor: '#FFFFFF', paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 400, lineHeight: '36px', letterSpacing: 6, textAlign: 'center', marginBottom: 40, color: '#0C0C0C', textTransform: 'uppercase' }}>{title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href={viewAllLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#0C0C0C', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
              View All <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', paddingBottom: isMobile ? 90 : 0 }}>
      {/* Hero Section with Auto Slider */}
      <section style={{ position: 'relative', height: isMobile ? '62vh' : '100vh', width: '100%', overflow: 'hidden' }}>
        {/* Slides */}
        {heroSlides.length > 0 ? (
          <>
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: currentSlide === index ? 1 : 0,
                  transition: 'opacity 0.8s ease-in-out',
                  zIndex: currentSlide === index ? 1 : 0
                }}
              >
                <Image 
                  src={slide.image_url} 
                  alt={slide.title || 'PRISMIN'} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  priority={index === 0}
                />
              </div>
            ))}

            {/* Slide Indicators */}
            {heroSlides.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: isMobile ? 130 : 150,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
                zIndex: 10
              }}>
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    style={{
                      width: currentSlide === index ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: currentSlide === index ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: 0
                    }}
                  />
                ))}
              </div>
            )}

            {/* Desktop Navigation Arrows */}
            {!isMobile && heroSlides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  style={{
                    position: 'absolute',
                    left: 30,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 50,
                    height: 50,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
                >
                  <ChevronLeft size={24} color="#0C0C0C" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  style={{
                    position: 'absolute',
                    right: 30,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 50,
                    height: 50,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
                >
                  <ChevronRight size={24} color="#0C0C0C" />
                </button>
              </>
            )}
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
            <p style={{ color: '#666', fontSize: 14 }}>{isMobile ? 'Upload mobile hero image from Admin Panel' : 'Upload desktop hero image from Admin Panel'}</p>
          </div>
        )}
        
        {/* CTA Section - Tagline + Buttons */}
        <div style={{
          position: 'absolute',
          bottom: isMobile ? 45 : 60,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isMobile ? 14 : 18,
          zIndex: 10
        }}>
          {/* Tagline */}
          <p style={{
            fontSize: isMobile ? 11 : 13,
            fontWeight: 300,
            letterSpacing: isMobile ? 2 : 4,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            textShadow: '0 2px 10px rgba(0,0,0,0.4)',
            margin: 0
          }}>
            Two Expressions · One Signature
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: isMobile ? 10 : 14 }}>
            <Link 
              href={original ? getCategoryLink(original) : (categories[0] ? getCategoryLink(categories[0]) : '/shop')} 
              style={{
                padding: isMobile ? '11px 26px' : '13px 36px',
                backgroundColor: '#FFFFFF',
                color: '#0C0C0C',
                fontSize: isMobile ? 10 : 11,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s'
              }}
            >
              Original
            </Link>
            <Link 
              href={inspired ? getCategoryLink(inspired) : (categories[1] ? getCategoryLink(categories[1]) : '/shop')} 
              style={{
                padding: isMobile ? '11px 26px' : '13px 36px',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                fontSize: isMobile ? 10 : 11,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid #FFFFFF',
                transition: 'all 0.3s'
              }}
            >
              Inspired
            </Link>
          </div>
        </div>
      </section>

      {/* Category Section - Responsive */}
      <section style={{ backgroundColor: '#FFFFFF', paddingTop: isMobile ? 40 : 70, paddingBottom: isMobile ? 24 : 50 }}>
        <h2 style={{
          fontSize: isMobile ? 16 : 24,
          fontWeight: 600,
          letterSpacing: isMobile ? 2 : 5,
          textAlign: 'center',
          marginBottom: isMobile ? 24 : 45,
          color: '#0C0C0C',
          textTransform: 'uppercase',
          padding: isMobile ? '0 16px' : 0
        }}>
          Explore Our Collection
        </h2>
        
        {isMobile ? (
          /* Mobile: 2 column grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, padding: '0 16px' }}>
            {categories.slice(0, 4).map((cat) => (
              <Link key={cat._id} href={getCategoryLink(cat)} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ position: 'relative', aspectRatio: '1/1.2', backgroundColor: '#F5F5F5', overflow: 'hidden' }}>
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8E8E8' }}>
                      <span style={{ color: '#999', fontSize: 12 }}>No Image</span>
                    </div>
                  )}
                </div>
                <h3 style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#0C0C0C', padding: '14px 8px', margin: 0, letterSpacing: 1 }}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        ) : (
          /* Desktop/Tablet: Responsive grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0 40px'
          }}>
            {categories.slice(0, 4).map((cat) => (
              <Link key={cat._id} href={getCategoryLink(cat)} style={{ textDecoration: 'none', display: 'block' }}>
                <div 
                  style={{
                    position: 'relative',
                    aspectRatio: '3/4',
                    backgroundColor: '#E8E8E8',
                    overflow: 'hidden',
                    marginBottom: 14
                  }} 
                  className="category-image"
                >
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E0E0E0' }}>
                      <span style={{ color: '#999', fontSize: 13 }}>No Image</span>
                    </div>
                  )}
                </div>
                <h3 style={{ textAlign: 'center', fontSize: 15, fontWeight: 600, lineHeight: '22px', color: '#0C0C0C', margin: 0, letterSpacing: 1 }}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Sections */}
      {categories.slice(0, 4).map((cat) => (
        isMobile ? (
          <MobileFeaturedSection key={cat._id} title={'Featured ' + cat.name} products={categoryProducts[cat.slug] || []} viewAllLink={getCategoryLink(cat)} />
        ) : (
          <DesktopFeaturedSection key={cat._id} title={'Featured ' + cat.name} products={categoryProducts[cat.slug] || []} viewAllLink={getCategoryLink(cat)} />
        )
      ))}

      <style jsx global>{`
        .category-image:hover img { 
          transform: scale(1.05); 
        }
        
        @media (max-width: 1200px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
