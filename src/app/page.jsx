import Link from 'next/link';
import Image from 'next/image';
import ProductGridServer from '@/components/product/ProductGridServer';

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
      {/* Hero Section code */}
      <section className="relative h-[90vh] bg-[#E8E8E8]">
        {heroSlide?.image_url ? (
          <Image
            src={heroSlide.image_url}
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#E8E8E8]">
            <p className="text-[#919191]">Upload hero image from Admin Panel</p>
          </div>
        )}
        
        {/* Hero Buttons */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4">
          <Link 
            href="/shop?category=womenswear"
            className="px-10 py-4 bg-white text-[#0C0C0C] text-xs font-medium tracking-[3px] uppercase hover:bg-[#0C0C0C] hover:text-white transition-colors"
          >
            For Her
          </Link>
          <Link 
            href="/shop?category=menswear"
            className="px-10 py-4 bg-white text-[#0C0C0C] text-xs font-medium tracking-[3px] uppercase hover:bg-[#0C0C0C] hover:text-white transition-colors"
          >
            For Him
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-2xl font-normal tracking-[4px] text-center mb-12 text-[#0C0C0C] uppercase">
            Shop by Category
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category) => (
              <Link 
                key={category._id} 
                href={`/shop?category=${category.slug}`}
                className="text-center group"
              >
                <div className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden mb-4">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#919191]">
                      No Image
                    </div>
                  )}
                </div>
                <h3 className="text-[13px] font-medium tracking-[2px] text-[#0C0C0C] uppercase">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Watch Collection */}
      {watchProducts.length > 0 && (
        <section className="py-16">
          <ProductGridServer 
            products={watchProducts.slice(0, 4)} 
            title="Watch Collection" 
            viewAllLink="/watch" 
          />
        </section>
      )}

      {/* Menswear - Alternate Background */}
      {menswearProducts.length > 0 && (
        <section className="py-16 bg-[#FAFAFA]">
          <ProductGridServer 
            products={menswearProducts.slice(0, 4)} 
            title="Menswear" 
            viewAllLink="/menswear" 
          />
        </section>
      )}

      {/* Womenswear */}
      {womenswearProducts.length > 0 && (
        <section className="py-16">
          <ProductGridServer 
            products={womenswearProducts.slice(0, 4)} 
            title="Womenswear" 
            viewAllLink="/womenswear" 
          />
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-20 px-6 bg-[#0C0C0C] text-center">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-2xl font-normal tracking-[4px] text-white mb-4 uppercase">
            Stay Updated
          </h2>
          <p className="text-sm text-[#919191] mb-8">
            Subscribe to receive updates on new arrivals and special offers
          </p>
          
          <form className="flex gap-3 max-w-[450px] mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 bg-transparent border border-[#333] text-white text-sm outline-none focus:border-white"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-[#0C0C0C] text-xs font-semibold tracking-[2px] uppercase hover:bg-[#B08B5C] hover:text-white transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
