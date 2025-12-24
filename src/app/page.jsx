import Link from 'next/link';
import Image from 'next/image';
import ProductGrid from '@/components/product/ProductGrid';

async function getHomeData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    
    const [slidersRes, categoriesRes, watchRes, menswearRes, womenswearRes] = await Promise.all([
      fetch(`${baseUrl}/settings`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/categories`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/products?category=watch&limit=8`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/products?category=menswear&limit=8`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/products?category=womenswear&limit=8`, { next: { revalidate: 60 } })
    ]);

    const settings = slidersRes.ok ? await slidersRes.json() : {};
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
    const watchData = watchRes.ok ? await watchRes.json() : { products: [] };
    const menswearData = menswearRes.ok ? await menswearRes.json() : { products: [] };
    const womenswearData = womenswearRes.ok ? await womenswearRes.json() : { products: [] };

    return {
      sliders: settings.sliders || [],
      categories: categoriesData,
      watchProducts: watchData.products || [],
      menswearProducts: menswearData.products || [],
      womenswearProducts: womenswearData.products || []
    };
  } catch (error) {
    console.error('Failed to fetch home data:', error);
    return {
      sliders: [],
      categories: [],
      watchProducts: [],
      menswearProducts: [],
      womenswearProducts: []
    };
  }
}

export default async function HomePage() {
  const { sliders, categories, watchProducts, menswearProducts, womenswearProducts } = await getHomeData();
  
  const heroSlide = sliders?.[0];

  return (
    <div>
      {/* Hero Section */}
      <section style={{ position: 'relative', height: '90vh', backgroundColor: '#E8E8E8' }}>
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
            backgroundColor: '#E8E8E8'
          }}>
            <p style={{ color: '#919191' }}>Upload hero image from Admin Panel</p>
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
            href="/shop?category=womenswear"
            style={{
              padding: '16px 40px',
              backgroundColor: '#FFFFFF',
              color: '#0C0C0C',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 3,
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease'
            }}
          >
            For Her
          </Link>
          <Link 
            href="/shop?category=menswear"
            style={{
              padding: '16px 40px',
              backgroundColor: '#FFFFFF',
              color: '#0C0C0C',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 3,
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease'
            }}
          >
            For Him
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: 4,
            textAlign: 'center',
            marginBottom: 48,
            color: '#0C0C0C',
            textTransform: 'uppercase'
          }}>
            Shop by Category
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24
          }}>
            {categories.slice(0, 4).map((category) => (
              <Link 
                key={category._id} 
                href={`/shop?category=${category.slug}`}
                style={{ textDecoration: 'none', textAlign: 'center' }}
              >
                <div style={{ 
                  position: 'relative', 
                  aspectRatio: '3/4', 
                  backgroundColor: '#F5F5F5',
                  overflow: 'hidden',
                  marginBottom: 16
                }}>
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                  ) : (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#919191'
                    }}>
                      No Image
                    </div>
                  )}
                </div>
                <h3 style={{
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: 2,
                  color: '#0C0C0C',
                  textTransform: 'uppercase'
                }}>
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Responsive Styles for Categories */}
        <style jsx>{`
          @media (max-width: 1024px) {
            div > div:last-child {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
        `}</style>
      </section>

      {/* Watch Collection */}
      {watchProducts.length > 0 && (
        <section style={{ padding: '60px 0' }}>
          <ProductGrid 
            products={watchProducts.slice(0, 4)} 
            title="Watch Collection" 
            viewAllLink="/watch" 
          />
        </section>
      )}

      {/* Menswear - Alternate Background */}
      {menswearProducts.length > 0 && (
        <section style={{ padding: '60px 0', backgroundColor: '#FAFAFA' }}>
          <ProductGrid 
            products={menswearProducts.slice(0, 4)} 
            title="Menswear" 
            viewAllLink="/menswear" 
          />
        </section>
      )}

      {/* Womenswear */}
      {womenswearProducts.length > 0 && (
        <section style={{ padding: '60px 0' }}>
          <ProductGrid 
            products={womenswearProducts.slice(0, 4)} 
            title="Womenswear" 
            viewAllLink="/womenswear" 
          />
        </section>
      )}

      {/* Newsletter Section */}
      <section style={{ 
        padding: '80px 24px', 
        backgroundColor: '#0C0C0C',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: 4,
            color: '#FFFFFF',
            marginBottom: 16,
            textTransform: 'uppercase'
          }}>
            Stay Updated
          </h2>
          <p style={{ 
            fontSize: 14, 
            color: '#919191',
            marginBottom: 32
          }}>
            Subscribe to receive updates on new arrivals and special offers
          </p>
          
          <form style={{ display: 'flex', gap: 12, maxWidth: 450, margin: '0 auto' }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: '16px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                color: '#FFFFFF',
                fontSize: 14,
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
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: 'pointer'
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
