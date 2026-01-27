'use client';

import { useState, useEffect } from 'react';
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

  const getHeroSlide = () => {
    const slides = settings?.hero_slides || [];
    const deviceType = isMobile ? 'mobile' : 'desktop';
    const deviceSlide = slides.find(s => (s.type || 'desktop') === deviceType && s.is_active !== false);
    if (!deviceSlide && slides.length > 0) {
      return slides.find(s => s.is_active !== false) || slides[0];
    }
    return deviceSlide;
  };

  const heroSlide = getHeroSlide();

  const getCategoryLink = (category) => {
    if (category.url) return category.url;
    return '/' + category.slug;
  };

  const MobileFeaturedSection = ({ title, products, viewAllLink }) => {
    if (!products || products.length === 0) return null;
    return (
      <section style={{ backgroundColor: '#FFFFFF', paddingTop: 40, paddingBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: 2, textAlign: 'center', marginBottom: 24, color: '#0C0C0C', textTransform: 'uppercase', padding: '0 16px' }}>{title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, padding: '0 16px' }}>
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
        <div style={{ maxWidth: 1800, margin: '0 auto', padding: '0 50px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 400, lineHeight: '40px', letterSpacing: 8, textAlign: 'center', marginBottom: 40, color: '#0C0C0C', textTransform: 'uppercase' }}>{title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
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
      {/* Hero Section */}
      <section style={{ position: 'relative', height: isMobile ? '85vh' : '100vh', width: '100%' }}>
        {heroSlide?.image_url ? (
          <Image src={heroSlide.image_url} alt="PRISMIN" fill style={{ objectFit: 'cover' }} priority />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
            <p style={{ color: '#666', fontSize: 14 }}>{isMobile ? 'Upload mobile hero image from Admin Panel' : 'Upload desktop hero image from Admin Panel'}</p>
          </div>
        )}
        
        {categories.length > 0 && (
          <div style={{ position: 'absolute', bottom: isMobile ? 60 : 80, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'row', gap: 12 }}>
            {categories.slice(0, 2).map((cat) => (
              <Link key={cat._id} href={getCategoryLink(cat)} style={{ padding: isMobile ? '12px 24px' : '14px 36px', backgroundColor: '#FFFFFF', color: '#0C0C0C', fontSize: isMobile ? 11 : 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Category Section */}
      <section style={{ backgroundColor: '#FFFFFF', paddingTop: isMobile ? 40 : 70, paddingBottom: isMobile ? 20 : 50 }}>
        <h2 style={{ fontSize: isMobile ? 20 : 32, fontWeight: isMobile ? 600 : 400, letterSpacing: isMobile ? 2 : 8, textAlign: 'center', marginBottom: isMobile ? 24 : 50, color: '#0C0C0C', textTransform: 'uppercase', padding: isMobile ? '0 16px' : 0 }}>
          {isMobile ? 'EXPLORE THE NEW STYLES' : 'Explore Our Collection'}
        </h2>
        
        {isMobile ? (
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
                <h3 style={{ textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#0C0C0C', padding: '12px 8px', margin: 0 }}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 50 }}>
            {categories.slice(0, 4).map((cat) => (
              <Link key={cat._id} href={getCategoryLink(cat)} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ position: 'relative', width: 405, height: 545, backgroundColor: '#E8E8E8', overflow: 'hidden', marginBottom: 16 }} className="category-image">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E0E0E0' }}>
                      <span style={{ color: '#999', fontSize: 13 }}>No Image</span>
                    </div>
                  )}
                </div>
                <h3 style={{ textAlign: 'center', fontSize: 16, fontWeight: 500, lineHeight: '24px', color: '#0C0C0C', margin: 0 }}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Sections */}
      {categories.slice(0, 4).map((cat) => (
        isMobile ? (
          <MobileFeaturedSection key={cat._id} title={'FEATURED ' + cat.name.toUpperCase()} products={categoryProducts[cat.slug] || []} viewAllLink={getCategoryLink(cat)} />
        ) : (
          <DesktopFeaturedSection key={cat._id} title={'Featured ' + cat.name} products={categoryProducts[cat.slug] || []} viewAllLink={getCategoryLink(cat)} />
        )
      ))}

      <style jsx global>{`.category-image:hover img { transform: scale(1.05); }`}</style>
    </div>
  );
}
