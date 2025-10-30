'use client';

import { useState, useCallback } from 'react';

const useCart = () => {
  const [cart, setCart] = useState([]);

  const addToCart = useCallback((item, quantity = 1, selectedSides = []) => {
    setCart(currentCart => {
      const existingItemIndex = currentCart.findIndex(
        cartItem => 
          cartItem.id === item.id && 
          JSON.stringify(cartItem.selectedSides) === JSON.stringify(selectedSides)
      );

      if (existingItemIndex > -1) {
        // Update existing item quantity
        const newCart = [...currentCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        // Add new item
        return [...currentCart, {
          ...item,
          quantity,
          selectedSides,
        }];
      }
    });
  }, []);

  const quickAddToCart = useCallback((item) => {
    addToCart(item, 1, []);
  }, [addToCart]);

  const updateQuantity = useCallback((itemId, selectedSides, newQuantity) => {
    setCart(currentCart => 
      currentCart.map(item => 
        item.id === itemId && 
        JSON.stringify(item.selectedSides) === JSON.stringify(selectedSides)
          ? { ...item, quantity: newQuantity }
          : item
      ).filter(item => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((itemId, selectedSides) => {
    setCart(currentCart => 
      currentCart.filter(item => 
        !(item.id === itemId && 
          JSON.stringify(item.selectedSides) === JSON.stringify(selectedSides))
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    addToCart,
    quickAddToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
};

export { useCart };