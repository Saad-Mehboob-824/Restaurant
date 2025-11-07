"use client";

import { useEffect, useMemo, useState } from "react";
import { colors, iconBackgrounds } from '@/constants/colors';

export default function CartOverlay({ products = [], onCartUpdated } = {}) {
  const [open, setOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState([]);

  const markUpdating = (id, v) => {
    setUpdatingIds((prev) => {
      if (v) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  };

  // Local-only cart loader
  const loadCart = async () => {
    setLoading(true);
    try {
      console.debug('[CartOverlay] loadCart called');
      const local = JSON.parse(localStorage.getItem("localCart") || "[]");
      console.debug('[CartOverlay] localCart contents:', local);
      setCartItems(
        local.map((i) => ({
          cartItemId: i.menuItemId || i.id,
          menuItem: i.product ?? i.menuItemId ?? i.id,
          quantity: i.quantity ?? 1,
          _localItem: i,
          raw: i,
        }))
      );
    } catch (err) {
      console.error("Failed to load local cart", err);
      setCartItems([]);
    } finally {
      setLoading(false);
      onCartUpdated?.();
    }
  };

  useEffect(() => {
    loadCart();
    window.addEventListener("storage", loadCart);
    window.addEventListener("cartUpdated", loadCart);
    const openHandler = () => setOpen(true);
    window.addEventListener("openCart", openHandler);

    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("cartUpdated", loadCart);
      window.removeEventListener("openCart", openHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const displayItems = useMemo(() => {
    return cartItems.map((it) => {
      const menuItemObj = it.menuItem && typeof it.menuItem === "object" ? it.menuItem : null;
      const menuItemId = menuItemObj ? (menuItemObj._id || menuItemObj.id) : (it.menuItem || it._localItem?.menuItemId);
      const productFromList = products.find((p) => p._id === menuItemId);
      const name = menuItemObj?.name || productFromList?.name || it._localItem?.product?.name || "Item";
      // Use price from cart item if available (includes variant/sides pricing), otherwise use base price
      const basePrice = Number(it._localItem?.price ?? menuItemObj?.price ?? productFromList?.price ?? it._localItem?.product?.price ?? 0);
      const price = basePrice;
      const image = menuItemObj?.image || productFromList?.image || it._localItem?.product?.image || "/shopping-cart.svg";
      
      // Extract variant and selectedSides from raw cart item
      const variant = it._localItem?.variant || it.raw?.variant || '';
      const selectedSides = it._localItem?.selectedSides || it.raw?.selectedSides || [];

      return {
        id: it.cartItemId ?? menuItemId,
        cartItemId: it.cartItemId,
        menuItemId,
        name,
        price,
        quantity: it.quantity ?? 1,
        image,
        variant,
        selectedSides,
        raw: it.raw ?? it,
      };
    });
  }, [cartItems, products]);

  const subtotal = useMemo(
    () => displayItems.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0),
    [displayItems]
  );

  const tax = subtotal * 0.08;
  const deliveryFee = 500;
  const total = subtotal + tax + deliveryFee;

  const itemCount = useMemo(
    () => displayItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
    [displayItems]
  );

  const removeItem = async (cartItemId) => {
    try {
      const local = JSON.parse(localStorage.getItem("localCart") || "[]");
      const filtered = local.filter((i) => (i.menuItemId || i.id) !== cartItemId);
      localStorage.setItem("localCart", JSON.stringify(filtered));
      await loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to remove item from local cart", err);
    }
  };

  const clearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    try {
      localStorage.removeItem("localCart");
      await loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to clear local cart", err);
    }
  };

  // update quantity in local cart only
  const updateQuantity = async (cartItemId, menuItemId, currentQty, delta) => {
    const idForLock = cartItemId ?? menuItemId;
    const newQty = Math.max(0, (Number(currentQty) || 0) + delta);
    if (updatingIds.includes(idForLock)) return;
    markUpdating(idForLock, true);
    try {
      const local = JSON.parse(localStorage.getItem("localCart") || "[]");
      const idx = local.findIndex((i) => (i.menuItemId || i.id) === menuItemId);
      if (idx >= 0) {
        if (newQty === 0) local.splice(idx, 1);
        else local[idx].quantity = newQty;
      } else if (newQty > 0) {
        local.push({ menuItemId, quantity: newQty, product: products.find((p) => p._id === menuItemId) });
      }
      localStorage.setItem("localCart", JSON.stringify(local));
      await loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to update local cart quantity", err);
    } finally {
      markUpdating(idForLock, false);
    }
  };

  const goToCheckout = () => {
    try {
      // Prepare a lightweight cart payload for the checkout page
      const cartForCheckout = displayItems.map((it) => ({
        id: it.menuItemId || it.id,
        menuItemId: it.menuItemId || it.id, // Preserve menuItemId for order creation
        name: it.name,
        description: it.raw?.product?.description || it.raw?.description || '',
        imageUrl: it.image,
        price: it.price,
        quantity: it.quantity,
        variant: it.raw?.variant || '', // Preserve variant selection
        selectedSides: it.raw?.selectedSides || [], // Preserve sides selection
      }));

      // Save to localStorage so the Checkout page can read it client-side
      localStorage.setItem('checkoutCart', JSON.stringify(cartForCheckout));

      // Navigate to checkout page (app router page at /Checkout)
      window.location.href = '/Checkout';
    } catch (err) {
      console.error('goToCheckout error', err);
      alert('Failed to proceed to checkout');
    }
  };

  return (
    <div style={{ backgroundColor: colors.bgPrimary, color: colors.textDark}}>
      {/* Mobile Fixed Cart Bar */}
      {itemCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-50">
          <button
            onClick={() => setOpen(true)}
            className="w-full bg-neutral-900 text-white rounded-xl py-4 px-6 flex items-center justify-between hover:bg-neutral-800 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-neutral-900 rounded-full flex items-center justify-center font-semibold text-sm">
                {itemCount}
              </div>
              <span className="font-semibold">View Cart</span>
            </div>
            <span className="font-semibold text-lg">Rs {total.toFixed(0)}</span>
          </button>
        </div>
      )}

      {/* Mobile Cart Modal */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" style={{ backgroundColor: colors.bgPrimary, color: colors.textDark}}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]" style={{ backgroundColor: colors.bgSec }}>
            <div className="sticky top-0 border-b border-neutral-200 p-4 flex items-center justify-between z-10" style={{ backgroundColor: colors.bgSec }}>
              <h2 className="text-xl font-semibold tracking-tight">Your Cart</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-all"
              >
                <span className="text-neutral-600 text-xl">×</span>
              </button>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="text-center py-8 text-neutral-500">Loading...</div>
              ) : displayItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <div className="w-12 h-12 mx-auto mb-2 text-neutral-300">🛒</div>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {displayItems.map((it) => (
                    <div key={it.id} className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: colors.bgPrimary }}>
                      <img
                        src={it.image || "/shopping-cart.svg"}
                        alt={it.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{it.name}</h4>
                        {it.variant && (
                          <p className="text-xs text-neutral-600 mb-1">Variant: {it.variant}</p>
                        )}
                        {it.selectedSides && it.selectedSides.length > 0 && (
                          <p className="text-xs text-neutral-600 mb-1">
                            Sides: {it.selectedSides.map(s => s.sideName || s.name || s).join(', ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(it.cartItemId ?? it.id, it.menuItemId, it.quantity, -1)}
                              className="w-7 h-7 rounded border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50"
                              disabled={updatingIds.includes(it.cartItemId ?? it.id)}
                            >
                              <span className="text-sm">−</span>
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{it.quantity}</span>
                            <button
                              onClick={() => updateQuantity(it.cartItemId ?? it.id, it.menuItemId, it.quantity, 1)}
                              className="w-7 h-7 rounded border border-neutral-200 bg-white flex items-center justify-center text-neutral-700 hover:bg-neutral-50"
                              disabled={updatingIds.includes(it.cartItemId ?? it.id)}
                            >
                              <span className="text-sm text-neutral-700">+</span>
                            </button>
                          </div>
                          <span className="font-semibold text-sm">Rs {(it.price * it.quantity).toFixed(0)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="flex-shrink-0 text-red-500 hover:text-red-600"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {displayItems.length > 0 && (
                <>
                  <div className="border-t border-neutral-200 pt-4 space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Subtotal</span>
                      <span className="font-medium">Rs {subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Delivery Fee</span>
                      <span className="font-medium">Rs {deliveryFee.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Tax</span>
                      <span className="font-medium">Rs {tax.toFixed(0)}</span>
                    </div>
                    <div className="border-t border-neutral-200 pt-3 flex justify-between">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-semibold text-lg">Rs {total.toFixed(0)}</span>
                    </div>
                  </div>

                  <button
                    onClick={goToCheckout}
                    className="w-full py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Checkout
                    <span>→</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Cart Sidebar */}
      {itemCount > 0 && (
        <aside className="hidden lg:block w-96 border-l border-neutral-200 sticky lg:top-16 lg:h-[calc(100vh-4rem)] overflow-y-auto" style={{ backgroundColor: colors.bgSec }}>
          <div className="p-6 flex flex-col h-full" style={{ backgroundColor: colors.bgSec }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold tracking-tight">Your Cart</h2>
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:underline font-medium"
              >
                Clear
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-neutral-500">Loading...</div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <div className="w-12 h-12 mx-auto mb-2 text-neutral-300">🛒</div>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6 overflow-auto flex-1 pr-2">
                  {displayItems.map((it) => (
                    <div key={it.id} className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: colors.bgPrimary }}>
                      <img
                        src={it.image || "/shopping-cart.svg"}
                        alt={it.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{it.name}</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(it.cartItemId ?? it.id, it.menuItemId, it.quantity, -1)}
                              className="w-7 h-7 rounded border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50"
                              disabled={updatingIds.includes(it.cartItemId ?? it.id)}
                            >
                              <span className="text-sm">−</span>
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{it.quantity}</span>
                            <button
                              onClick={() => updateQuantity(it.cartItemId ?? it.id, it.menuItemId, it.quantity, 1)}
                              className="w-7 h-7 rounded border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50"
                              disabled={updatingIds.includes(it.cartItemId ?? it.id)}
                            >
                              <span className="text-sm">+</span>
                            </button>
                          </div>
                          <span className="font-semibold text-sm">Rs {(it.price * it.quantity).toFixed(0)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="flex-shrink-0 text-red-500 hover:text-red-600"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-200 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-medium">Rs {subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Delivery Fee</span>
                    <span className="font-medium">Rs {deliveryFee.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tax</span>
                    <span className="font-medium">Rs {tax.toFixed(0)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3 flex justify-between">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-semibold text-lg">Rs {total.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={goToCheckout}
                  className="w-full py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Checkout
                  <span>→</span>
                </button>
              </>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}