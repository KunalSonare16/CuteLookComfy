import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();
const GUEST_KEY = 'clc_guest_cart';
const SHIPPING = 50;

function readGuestItems() {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]'); } catch { return []; }
}
function writeGuestItems(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}
function buildGuestCart(items) {
  const subtotal = items.reduce((s, i) => s + (i.unitPrice || 0) * (i.qty || 1), 0);
  const shippingCharge = items.length ? SHIPPING : 0;
  return {
    items,
    subtotal,
    discountAmount: 0,
    couponCode: null,
    shippingCharge,
    total: subtotal + shippingCharge,
    itemCount: items.length,
  };
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mergedRef = useRef(false);

  const loadGuestCart = useCallback(() => setCart(buildGuestCart(readGuestItems())), []);

  const fetchCart = useCallback(async () => {
    if (!user) { loadGuestCart(); return; }
    try {
      const { data } = await cartAPI.get();
      setCart(data.data);
    } catch {}
  }, [user, loadGuestCart]);

  // On login: merge any guest cart into the account, then load the server cart.
  useEffect(() => {
    (async () => {
      if (user && !mergedRef.current) {
        mergedRef.current = true;
        const guestItems = readGuestItems();
        if (guestItems.length) {
          for (const it of guestItems) {
            try { await cartAPI.addItem({ productId: it.productId, variantId: it.variantId || null, size: it.size || undefined, qty: it.qty }); } catch {}
          }
          localStorage.removeItem(GUEST_KEY);
          toast.success('Your bag was saved to your account');
        }
        await fetchCart();
      } else if (!user) {
        mergedRef.current = false;
        loadGuestCart();
      }
    })();
  }, [user, fetchCart, loadGuestCart]);

  const addItem = async (productId, variantId, quantity = 1, product = null, variantLabel = null, size = null) => {
    if (user) {
      try {
        const { data } = await cartAPI.addItem({ productId, variantId, size: size || undefined, qty: quantity });
        setCart(data.data);
        setDrawerOpen(true);
        toast.success('Added to bag');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not add item');
      }
      return;
    }
    // Guest cart (localStorage) — no login required to build a bag
    const items = readGuestItems();
    const key = productId + (variantId ? ':' + variantId : '') + (size ? ':' + size : '');
    const existing = items.find(i => i.key === key);
    if (existing) {
      existing.qty += quantity;
    } else {
      items.push({
        key,
        productId,
        variantId: variantId || null,
        size: size || null,
        qty: quantity,
        productName: product?.name || 'Item',
        slug: product?.slug,
        productImage: product?.images?.[0]?.imageUrl || product?.productImage || null,
        unitPrice: product?.sellingPrice ?? product?.unitPrice ?? 0,
        variantLabel: variantLabel || null,
      });
    }
    writeGuestItems(items);
    setCart(buildGuestCart(items));
    setDrawerOpen(true);
    toast.success('Added to bag');
  };

  const updateItem = async (productId, qty) => {
    if (user) {
      try { const { data } = await cartAPI.updateItem(productId, qty); setCart(data.data); } catch {}
      return;
    }
    let items = readGuestItems();
    if (qty <= 0) {
      items = items.filter(i => i.productId !== productId);
    } else {
      items = items.map(i => i.productId === productId ? { ...i, qty } : i);
    }
    writeGuestItems(items);
    setCart(buildGuestCart(items));
  };

  const removeItem = async (productId) => {
    if (user) {
      try { const { data } = await cartAPI.removeItem(productId); setCart(data.data); } catch {}
      return;
    }
    const items = readGuestItems().filter(i => i.productId !== productId);
    writeGuestItems(items);
    setCart(buildGuestCart(items));
  };

  const clearCart = async () => {
    if (user) {
      try { await cartAPI.clear(); setCart(null); } catch {}
      return;
    }
    localStorage.removeItem(GUEST_KEY);
    setCart(buildGuestCart([]));
  };

  const applyCoupon = async (code) => {
    if (!user) { toast.error('Sign in to apply a coupon'); return; }
    const { data } = await cartAPI.applyCoupon(code);
    setCart(data.data);
  };

  const removeCoupon = async () => {
    if (!user) return;
    const { data } = await cartAPI.removeCoupon();
    setCart(data.data);
  };

  const itemCount = cart?.items?.length || 0;

  return (
    <CartContext.Provider value={{
      cart, fetchCart, addItem, updateItem, removeItem, clearCart,
      applyCoupon, removeCoupon, itemCount,
      drawerOpen, setDrawerOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
