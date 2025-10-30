"use client";

import { colors, buttons } from "@/constants/colors";

export default function ProductCard({ product }) {
  const handleAddToCart = () => {
    try {
      const raw = localStorage.getItem("localCart");
      const cart = raw ? JSON.parse(raw) : [];
      const idx = cart.findIndex((c) => c.menuItemId === product._id);

      if (idx >= 0) {
        cart[idx].quantity = Number(cart[idx].quantity || 0) + 1;
      } else {
        cart.push({ menuItemId: product._id, quantity: 1, product });
      }

      localStorage.setItem("localCart", JSON.stringify(cart));
      // notify cart overlay / desktop button
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Add to local cart failed", err);
    }
  };

  return (
    <div
      className=" rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
      onClick={() => {}}
    >
      <img
        src={product.image || "https://placehold.co/600x300"}
        alt={product.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4" style={{ backgroundColor: colors.bgSec, color: colors.textDark}}>
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-neutral-600 mb-3">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold">Rs {product.price}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ backgroundColor: buttons.primary.background, color: buttons.primary.text }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}