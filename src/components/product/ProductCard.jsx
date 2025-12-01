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
    <div className="card group">
      <Link href={`/product/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-primary-100">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <ShoppingBag size={48} />
            </div>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-gold text-white text-xs px-2 py-1">
              -{discount}%
            </span>
          )}

          {/* Out of Stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}

          {/* Quick Add Button */}
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="absolute bottom-3 right-3 bg-white p-3 shadow-md 
                         opacity-0 group-hover:opacity-100 transition-opacity
                         hover:bg-gold hover:text-white"
            >
              <ShoppingBag size={18} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-medium text-focus mb-2 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-gold font-semibold">
              ৳{product.price.toLocaleString()}
            </span>
            {product.compare_price && (
              <span className="text-muted text-sm line-through">
                ৳{product.compare_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
