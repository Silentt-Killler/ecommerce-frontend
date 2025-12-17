'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

export default function HomePage() {
  const [sliders, setSliders] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState({
    watch: [],
    menswear: [],
    womenswear: [],
    accessories: []
  });
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Handle scroll for hero text animation
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (sliders.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [sliders]);

  const fetchData = async () => {
    try {
      // Fetch sliders
      const slidersRes = await fetch('https://ecommerce-backend-silk.onrender.com/api/v1/settings');
      const slidersData = await slidersRes.json();
      if (slidersData.hero_sliders) {
        setSliders(slidersData.hero_sliders);
      }

      // Fetch categories
      const categoriesRes = await fetch('https://ecommerce-backend-silk.onrender.com/api/v1/categories');
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData);

      // Fetch featured products for each category
      const categoryPromises = ['watch', 'menswear', 'womenswear', 'accessories'].map(async (cat) => {
        const res = await fetch(`https://ecommerce-backend-silk.onrender.com/api/v1/products?category=${cat}&limit=4`);
        const data = await res.json();
        return { category: cat, products: data.items || [] };
      });

      const results = await Promise.all(categoryPromises);
      const productsMap = {};
      results.forEach(({ category, products }) => {
        productsMap[category] = products;
      });
      setFeaturedProducts(productsMap);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F7F7F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, letterSpacing: 8, fontWeight: 300, color: '#0C0C0C' }}>LOADING</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F7F7' }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        height: '85vh', // Reduced from 100vh
        overflow: 'hidden'
      }}>
        {/* Hero Brand Text - Overlaid on image */}
        <div style={{
          position: 'absolute',
          top: scrolled ? '-100px' : '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          opacity: scrolled ? 0 : 1,
          pointerEvents: 'none'
        }}>
          <h1 style={{
            fontSize: '120px',
            fontWeight: 200,
            letterSpacing: '32px',
            color: '#FFFFFF',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            textAlign: 'center',
            marginBottom: 0
          }}>
            PRISMIN
          </h1>
        </div>

        {/* Hero Slider */}
        {sliders.length > 0 && (
          <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <Image
              src={sliders[currentSlide].image}
              alt={sliders[currentSlide].title || 'Hero'}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            
            {/* Dark overlay for better text visibility */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              zIndex: 10
            }} />

            {/* Hero Buttons - Bottom Center */}
            <div style={{
              position: 'absolute',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              display: 'flex',
              gap: '30px'
            }}>
              <Link href="/shop?gender=women" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '18px 60px',
                  backgroundColor: '#F7F7F7',
                  color: '#0C0C0C',
                  border: 'none',
                  fontSize: '13px',
                  letterSpacing: '3px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0C0C0C';
                  e.currentTarget.style.color = '#F7F7F7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F7F7F7';
                  e.currentTarget.style.color = '#0C0C0C';
                }}>
                  For Her
                </button>
              </Link>

              <Link href="/shop?gender=men" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '18px 60px',
                  backgroundColor: 'transparent',
                  color: '#F7F7F7',
                  border: '1px solid #F7F7F7',
                  fontSize: '13px',
                  letterSpacing: '3px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F7F7F7';
                  e.currentTarget.style.color = '#0C0C0C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#F7F7F7';
                }}>
                  For Him
                </button>
              </Link>
            </div>

            {/* Slide Indicators */}
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '12px',
              zIndex: 30
            }}>
              {sliders.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    width: index === currentSlide ? '40px' : '8px',
                    height: '8px',
                    backgroundColor: index === currentSlide ? '#F7F7F7' : 'rgba(247, 247, 247, 0.5)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Category Section */}
      <section style={{ 
        padding: '120px 0',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
          {/* Section Title */}
          <h2 style={{
            fontSize: '32px',
            fontWeight: 300,
            letterSpacing: '8px',
            textAlign: 'center',
            marginBottom: '80px',
            color: '#0C0C0C',
            textTransform: 'uppercase'
          }}>
            Explore Our Collection
          </h2>

          {/* Category Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '40px'
          }}>
            {categories.map((category) => (
              <Link 
                key={category._id} 
                href={`/${category.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.4s ease',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                  {/* Category Image */}
                  <div style={{
                    position: 'relative',
                    paddingBottom: '100%', // 1:1 aspect ratio
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5'
                  }}>
                    <Image
                      src={category.image || '/placeholder.jpg'}
                      alt={category.name}
                      fill
                      style={{ 
                        objectFit: 'cover',
                        transition: 'transform 0.6s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </div>
                  
                  {/* Category Name */}
                  <h3 style={{
                    marginTop: '24px',
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '2px',
                    textAlign: 'center',
                    color: '#0C0C0C',
                    textTransform: 'uppercase'
                  }}>
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Sections */}
      {/* Add featured sections here - keeping same structure */}
    </div>
  );
}
