'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

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

  const formatPrice = (price) => {
    return `৳ ${price.toLocaleString()}`;
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
        height: '85vh',
        overflow: 'hidden'
      }}>
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
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              zIndex: 10
            }} />

            {/* Hero Brand Text - Medium size overlay */}
            <div style={{
              position: 'absolute',
              top: scrolled ? '-100px' : '45%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
              transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              opacity: scrolled ? 0 : 1,
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: '64px',
                fontWeight: 300,
                letterSpacing: '16px',
                color: '#FFFFFF',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                marginBottom: 0
              }}>
                PRISMIN
              </h1>
            </div>

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
              <Link href="/womenswear" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '16px 50px',
                  backgroundColor: '#F7F7F7',
                  color: '#0C0C0C',
                  border: 'none',
                  fontSize: '12px',
                  letterSpacing: '2.5px',
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

              <Link href="/menswear" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '16px 50px',
                  backgroundColor: 'transparent',
                  color: '#F7F7F7',
                  border: '1px solid #F7F7F7',
                  fontSize: '12px',
                  letterSpacing: '2.5px',
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
                    width: index === currentSlide ? '35px' : '8px',
                    height: '2px',
                    backgroundColor: index === currentSlide ? '#F7F7F7' : 'rgba(247, 247, 247, 0.5)',
                    border: 'none',
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
        padding: '100px 0',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
          {/* Section Title */}
          <h2 style={{
            fontSize: '28px',
            fontWeight: 300,
            letterSpacing: '6px',
            textAlign: 'center',
            marginBottom: '70px',
            color: '#0C0C0C',
            textTransform: 'uppercase'
          }}>
            Explore Our Collection
          </h2>

          {/* Category Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '35px'
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
                  transition: 'transform 0.4s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  {/* Category Image - 4:5 aspect ratio */}
                  <div style={{
                    position: 'relative',
                    paddingBottom: '125%', // 4:5 aspect ratio
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
                    marginTop: '20px',
                    fontSize: '13px',
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

      {/* Featured Watches */}
      {featuredProducts.watch.length > 0 && (
        <section style={{ 
          padding: '100px 0',
          backgroundColor: '#F7F7F7'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '6px',
              textAlign: 'center',
              marginBottom: '70px',
              color: '#0C0C0C',
              textTransform: 'uppercase'
            }}>
              Featured Watches
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '35px'
            }}>
              {featuredProducts.watch.map((product) => (
                <Link 
                  key={product._id}
                  href={`/product/${product.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <div style={{
                      position: 'relative',
                      paddingBottom: '100%',
                      overflow: 'hidden',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <Image
                        src={product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      {product.compare_price && (
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          left: '15px',
                          backgroundColor: '#B08B5C',
                          color: '#FFFFFF',
                          padding: '5px 12px',
                          fontSize: '11px',
                          letterSpacing: '1px',
                          fontWeight: 500
                        }}>
                          SALE
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#0C0C0C',
                        marginBottom: '8px',
                        letterSpacing: '0.5px'
                      }}>
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0C0C0C'
                        }}>
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && (
                          <span style={{
                            fontSize: '13px',
                            color: '#919191',
                            textDecoration: 'line-through'
                          }}>
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <Link href="/watch" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '15px 45px',
                  backgroundColor: 'transparent',
                  color: '#0C0C0C',
                  border: '1px solid #0C0C0C',
                  fontSize: '12px',
                  letterSpacing: '2px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0C0C0C';
                  e.currentTarget.style.color = '#F7F7F7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#0C0C0C';
                }}>
                  View All Watches
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Menswear */}
      {featuredProducts.menswear.length > 0 && (
        <section style={{ 
          padding: '100px 0',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '6px',
              textAlign: 'center',
              marginBottom: '70px',
              color: '#0C0C0C',
              textTransform: 'uppercase'
            }}>
              Featured Menswear
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '35px'
            }}>
              {featuredProducts.menswear.map((product) => (
                <Link 
                  key={product._id}
                  href={`/product/${product.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    backgroundColor: '#F7F7F7',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <div style={{
                      position: 'relative',
                      paddingBottom: '125%',
                      overflow: 'hidden',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <Image
                        src={product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      {product.compare_price && (
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          left: '15px',
                          backgroundColor: '#B08B5C',
                          color: '#FFFFFF',
                          padding: '5px 12px',
                          fontSize: '11px',
                          letterSpacing: '1px',
                          fontWeight: 500
                        }}>
                          SALE
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#0C0C0C',
                        marginBottom: '8px',
                        letterSpacing: '0.5px'
                      }}>
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0C0C0C'
                        }}>
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && (
                          <span style={{
                            fontSize: '13px',
                            color: '#919191',
                            textDecoration: 'line-through'
                          }}>
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <Link href="/menswear" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '15px 45px',
                  backgroundColor: 'transparent',
                  color: '#0C0C0C',
                  border: '1px solid #0C0C0C',
                  fontSize: '12px',
                  letterSpacing: '2px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0C0C0C';
                  e.currentTarget.style.color = '#F7F7F7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#0C0C0C';
                }}>
                  View All Menswear
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Womenswear */}
      {featuredProducts.womenswear.length > 0 && (
        <section style={{ 
          padding: '100px 0',
          backgroundColor: '#F7F7F7'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '6px',
              textAlign: 'center',
              marginBottom: '70px',
              color: '#0C0C0C',
              textTransform: 'uppercase'
            }}>
              Featured Womenswear
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '35px'
            }}>
              {featuredProducts.womenswear.map((product) => (
                <Link 
                  key={product._id}
                  href={`/product/${product.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <div style={{
                      position: 'relative',
                      paddingBottom: '125%',
                      overflow: 'hidden',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <Image
                        src={product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      {product.compare_price && (
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          left: '15px',
                          backgroundColor: '#B08B5C',
                          color: '#FFFFFF',
                          padding: '5px 12px',
                          fontSize: '11px',
                          letterSpacing: '1px',
                          fontWeight: 500
                        }}>
                          SALE
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#0C0C0C',
                        marginBottom: '8px',
                        letterSpacing: '0.5px'
                      }}>
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0C0C0C'
                        }}>
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && (
                          <span style={{
                            fontSize: '13px',
                            color: '#919191',
                            textDecoration: 'line-through'
                          }}>
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <Link href="/womenswear" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '15px 45px',
                  backgroundColor: 'transparent',
                  color: '#0C0C0C',
                  border: '1px solid #0C0C0C',
                  fontSize: '12px',
                  letterSpacing: '2px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0C0C0C';
                  e.currentTarget.style.color = '#F7F7F7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#0C0C0C';
                }}>
                  View All Womenswear
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Accessories */}
      {featuredProducts.accessories.length > 0 && (
        <section style={{ 
          padding: '100px 0',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '6px',
              textAlign: 'center',
              marginBottom: '70px',
              color: '#0C0C0C',
              textTransform: 'uppercase'
            }}>
              Featured Accessories
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '35px'
            }}>
              {featuredProducts.accessories.map((product) => (
                <Link 
                  key={product._id}
                  href={`/product/${product.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    backgroundColor: '#F7F7F7',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <div style={{
                      position: 'relative',
                      paddingBottom: '100%',
                      overflow: 'hidden',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <Image
                        src={product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      {product.compare_price && (
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          left: '15px',
                          backgroundColor: '#B08B5C',
                          color: '#FFFFFF',
                          padding: '5px 12px',
                          fontSize: '11px',
                          letterSpacing: '1px',
                          fontWeight: 500
                        }}>
                          SALE
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#0C0C0C',
                        marginBottom: '8px',
                        letterSpacing: '0.5px'
                      }}>
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0C0C0C'
                        }}>
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && (
                          <span style={{
                            fontSize: '13px',
                            color: '#919191',
                            textDecoration: 'line-through'
                          }}>
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <Link href="/accessories" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '15px 45px',
                  backgroundColor: 'transparent',
                  color: '#0C0C0C',
                  border: '1px solid #0C0C0C',
                  fontSize: '12px',
                  letterSpacing: '2px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0C0C0C';
                  e.currentTarget.style.color = '#F7F7F7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#0C0C0C';
                }}>
                  View All Accessories
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
