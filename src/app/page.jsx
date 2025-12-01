import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=8`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories()
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary-100 py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-focus mb-6">
              Discover Premium Quality
            </h1>
            <p className="text-muted text-lg mb-8">
              Curated collection of finest products. 
              Experience luxury in every detail.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link href="/categories" className="btn-secondary">
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl md:text-3xl">Categories</h2>
              <Link href="/categories" className="text-gold hover:underline flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((category) => (
                <Link 
                  key={category._id} 
                  href={`/shop?category=${category.slug}`}
                  className="group relative aspect-square bg-primary-200 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-focus/40 group-hover:bg-focus/60 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white font-heading text-xl md:text-2xl text-center px-4">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl md:text-3xl">Featured Products</h2>
            <Link href="/shop" className="text-gold hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted">
              <p>No products available yet.</p>
              <p className="text-sm mt-2">Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-primary-200">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold text-xl">🚚</span>
              </div>
              <h3 className="font-medium mb-2">Free Shipping</h3>
              <p className="text-muted text-sm">On orders over ৳1000</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold text-xl">↩️</span>
              </div>
              <h3 className="font-medium mb-2">Easy Returns</h3>
              <p className="text-muted text-sm">7 days return policy</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold text-xl">💳</span>
              </div>
              <h3 className="font-medium mb-2">Secure Payment</h3>
              <p className="text-muted text-sm">100% secure checkout</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
