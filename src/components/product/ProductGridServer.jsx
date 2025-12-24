import ProductCard from './ProductCard';
import Link from 'next/link';

export default function ProductGridServer({ products, title, viewAllLink }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6">
      {/* Section Header */}
      {title && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-normal tracking-[2px] text-[#0C0C0C] uppercase">
            {title}
          </h2>
          
          {viewAllLink && (
            <Link 
              href={viewAllLink}
              className="text-[13px] font-medium text-[#0C0C0C] tracking-[1px] border-b border-[#0C0C0C] pb-0.5 hover:opacity-70 transition-opacity"
            >
              VIEW ALL
            </Link>
          )}
        </div>
      )}

      {/* Product Grid - 4 columns desktop, 3 tablet, 2 mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-7 gap-y-9">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
