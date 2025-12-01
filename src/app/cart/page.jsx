'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';

export default function CartPage() {
  const { items, subtotal, fetchCart, updateQuantity, removeFromCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-muted mb-4" />
        <h1 className="font-heading text-2xl mb-4">Please login to view your cart</h1>
        <Link href="/login" className="btn-primary inline-block">
          Login
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-muted mb-4" />
        <h1 className="font-heading text-2xl mb-4">Your cart is empty</h1>
        <p className="text-muted mb-6">Add some products to get started</p>
        <Link href="/shop" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + shipping;

  return (
    <div className="container-custom py-8">
      <h1 className="font-heading text-3xl mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm">
            {items.map((item) => (
              <div 
                key={item.product_id} 
                className="flex gap-4 p-4 border-b border-primary-200 last:border-0"
              >
                {/* Image */}
                <div className="relative w-24 h-24 bg-primary-100 shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{item.name}</h3>
                  <p className="text-gold font-semibold">
                    ৳{item.price.toLocaleString()}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-primary-300">
                      <button
                        onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-primary-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 py-2 min-w-[50px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-2 hover:bg-primary-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Line Total */}
                <div className="text-right">
                  <p className="font-semibold">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm p-6 sticky top-24">
            <h2 className="font-heading text-xl mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `৳${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted">
                  Free shipping on orders over ৳1000
                </p>
              )}
              <div className="border-t border-primary-200 pt-3 mt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-gold">৳{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full mt-6 text-center block">
              Proceed to Checkout
            </Link>

            <Link href="/shop" className="block text-center text-muted hover:text-focus mt-4 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
