// store/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, CartState } from '@/types/cart';

const generateCartItemId = (item: { id: string | number; size?: string; color?: string }): string => {
  return `${item.id}${item.color ? `_c:${item.color}` : ''}${item.size ? `_s:${item.size}` : ''}`;
};

const normalizePrice = (price: unknown): number => {
  const n = Number(price);
  return Number.isFinite(n) ? n : 0;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (newItem) => {
        const { items } = get();
        const cartItemId = generateCartItemId(newItem);

        // Check if item already exists (same product, color and size)
        const existingItemIndex = items.findIndex(item =>
          generateCartItemId(item) === cartItemId
        );

        if (existingItemIndex !== -1) {
          // Update quantity of existing item
          const updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + (newItem.quantity || 1)
          };
          set({ items: updatedItems });
        } else {
          // Add new item
          const itemToAdd: CartItem = {
            ...newItem,
            price: normalizePrice(newItem.price),
            quantity: newItem.quantity || 1
          };
          set({ items: [...items, itemToAdd] });
        }
      },

      removeItem: (id: string | number, size?: string, color?: string) => {
        const { items } = get();
        const filteredItems = items.filter(item => {
          if (item.id !== id) return true;
          if (size !== undefined && item.size !== size) return true;
          if (color !== undefined && item.color !== color) return true;
          return false;
        });
        set({ items: filteredItems });
      },

      updateQuantity: (id: string | number, quantity: number, size?: string, color?: string) => {
        const { items } = get();
        if (quantity <= 0) {
          const filteredItems = items.filter(item => {
            if (item.id !== id) return true;
            if (size !== undefined && item.size !== size) return true;
            if (color !== undefined && item.color !== color) return true;
            return false;
          });
          set({ items: filteredItems });
          return;
        }

        const updatedItems = items.map(item => {
          const matchesId = item.id === id;
          const matchesSize = size === undefined || item.size === size;
          const matchesColor = color === undefined || item.color === color;
          if (matchesId && matchesSize && matchesColor) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set(state => ({ isCartOpen: !state.isCartOpen }));
      },

      openCart: () => {
        set({ isCartOpen: true });
      },

      closeCart: () => {
        set({ isCartOpen: false });
      },

      totalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + normalizePrice(item.price) * item.quantity,
          0
        );
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
      // Defer hydration to CartProvider (required for Next.js SSR)
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state?.items?.length) {
          state.items = state.items.map((item) => ({
            ...item,
            price: normalizePrice(item.price),
          }));
        }
      },
    }
  )
);











