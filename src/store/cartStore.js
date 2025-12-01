import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      isLoading: false,

      fetchCart: async () => {
        try {
          const response = await api.get('/cart');
          set({ 
            items: response.data.items, 
            subtotal: response.data.subtotal 
          });
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      },

      addToCart: async (productId, quantity = 1) => {
        set({ isLoading: true });
        try {
          await api.post('/cart/items', { 
            product_id: productId, 
            quantity 
          });
          await get().fetchCart();
          toast.success('Added to cart');
          set({ isLoading: false });
        } catch (error) {
          toast.error(error.response?.data?.detail || 'Failed to add item');
          set({ isLoading: false });
        }
      },

      updateQuantity: async (productId, quantity) => {
        try {
          await api.put(`/cart/items/${productId}`, { quantity });
          await get().fetchCart();
        } catch (error) {
          toast.error(error.response?.data?.detail || 'Failed to update');
        }
      },

      removeFromCart: async (productId) => {
        try {
          await api.delete(`/cart/items/${productId}`);
          await get().fetchCart();
          toast.success('Item removed');
        } catch (error) {
          toast.error('Failed to remove item');
        }
      },

      clearCart: async () => {
        try {
          await api.delete('/cart');
          set({ items: [], subtotal: 0 });
        } catch (error) {
          console.error('Failed to clear cart:', error);
        }
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        subtotal: state.subtotal 
      }),
    }
  )
);

export default useCartStore;
