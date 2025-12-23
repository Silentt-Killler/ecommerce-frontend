import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addItem: (item) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (i) => i.productId === item.productId && 
                 JSON.stringify(i.variant) === JSON.stringify(item.variant)
        );

        if (existingIndex > -1) {
          // Update quantity if item exists
          const newItems = [...items];
          newItems[existingIndex].quantity += item.quantity || 1;
          set({ items: newItems });
        } else {
          // Add new item
          set({ items: [...items, { ...item, quantity: item.quantity || 1 }] });
        }
      },

      // Update item quantity
      updateQuantity: (productId, quantity, variant = null) => {
        const items = get().items;
        const newItems = items.map((item) => {
          if (item.productId === productId && JSON.stringify(item.variant) === JSON.stringify(variant)) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ items: newItems });
      },

      // Remove item from cart
      removeItem: (productId, variant = null) => {
        const items = get().items;
        const newItems = items.filter(
          (item) => !(item.productId === productId && JSON.stringify(item.variant) === JSON.stringify(variant))
        );
        set({ items: newItems });
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] });
      },

      // Get total item count
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get subtotal
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
      // Only persist items
      partialize: (state) => ({ items: state.items })
    }
  )
);

export default useCartStore;
