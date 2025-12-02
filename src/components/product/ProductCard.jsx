'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }) {
  const { addToCart, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    await addToCart(product._id);
  };

  const primaryImage = product.images?.find(img => img.is_primary)?.url 
    || product.images?.[0]?.url 
    || null;

  const discount = product.compare_price 
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-primary-100 overflow-hidden mb-4">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag size={40} className="text-primary-300" />
          </div>
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-focus text-white text-xs px-2 py-1 tracking-wide">
            -{discount}%
          </span>
        )}

        {/* Out of Stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-focus text-sm tracking-[0.1em]">SOLD OUT</span>
          </div>
        )}

        {/* Quick Add Button */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="absolute bottom-4 left-4 right-4 py-3 bg-white/90 text-focus text-xs tracking-[0.15em] 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       hover:bg-focus hover:text-white"
          >
            ADD TO BAG
          </button>
        )}
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-xs text-muted tracking-[0.1em] uppercase mb-1">
          {product.category}
        </p>
        <h3 className="text-sm font-light mb-2 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm">
            ৳{product.price.toLocaleString()}
          </span>
          {product.compare_price && (
            <span className="text-muted text-xs line-through">
              ৳{product.compare_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
