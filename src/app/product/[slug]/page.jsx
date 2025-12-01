'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Heart, Share2 } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/slug/${slug}`);
        setProduct(response.data);
      } catch (error) {
        toast.error('Product not found');
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, router]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      await addToCart(product._id);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-primary-200" />
            <div className="space-y-4">
              <div className="h-8 bg-primary-200 w-3/4" />
              <div className="h-6 bg-primary-200 w-1/4" />
              <div className="h-24 bg-primary-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0 
    ? product.images 
    : [{ url: '/placeholder.jpg', is_primary: true }];

  const discount = product.compare_price 
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  return (
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Images */}
        <div>
          {/* Main Image */}
          <div className="relative aspect-square bg-primary-100 mb-4">
            <Image
              src={images[selectedImage]?.url || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-gold text-white px-3 py-1">
                -{discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-primary-100 ${
                    selectedImage === index ? 'ring-2 ring-gold' : ''
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-muted text-sm uppercase tracking-wide mb-2">
            {product.category}
          </p>
          
          <h1 className="font-heading text-3xl md:text-4xl mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-semibold text-gold">
              ৳{product.price.toLocaleString()}
            </span>
            {product.compare_price && (
              <span className="text-lg text-muted line-through">
                ৳{product.compare_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <p className="text-green-600 text-sm">
                ✓ In Stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-red-600 text-sm">
                ✗ Out of Stock
              </p>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
            <div className="flex flex-wrap gap-4 mb-6">
              {/* Quantity */}
              <div className="flex items-center border border-primary-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-primary-100"
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 py-3 min-w-[60px] text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-primary-100"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 py-4 border-t border-primary-200">
            <button className="flex items-center gap-2 text-muted hover:text-focus">
              <Heart size={18} /> Add to Wishlist
            </button>
            <button className="flex items-center gap-2 text-muted hover:text-focus">
              <Share2 size={18} /> Share
            </button>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="pt-4 border-t border-primary-200">
              <p className="text-sm text-muted">
                Tags: {product.tags.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
