"use client"
// app/checkout/page.jsx
import { useEffect, useState } from 'react'
import Checkout from '@/components/Checkout/Checkout'

export default function CheckoutPage() {
  const [cart, setCart] = useState(null)

  useEffect(() => {
    try {
      // Prefer the explicit checkoutCart set by CartOverlay.goToCheckout.
      // Fall back to localCart if present.
      const stored = localStorage.getItem('checkoutCart') || localStorage.getItem('localCart')
      if (stored) {
        const parsed = JSON.parse(stored)
        const normalized = parsed.map((item) => ({
          id: item.id || item.menuItemId || item._id,
          menuItemId: item.menuItemId || item.id || item._id, // Preserve menuItemId for order creation
          name: item.name || item.product?.name || '',
          description: item.description || item.product?.description || '',
          imageUrl: item.imageUrl || item.image || item.product?.image || '',
          price: Number(item.price ?? item.product?.price ?? 0),
          quantity: Number(item.quantity ?? 1),
          variant: item.variant || '', // Preserve variant selection
          selectedSides: item.selectedSides || item.selectedOptions || [], // Preserve sides selection
        }))
        setCart(normalized)
        return
      }

      // No stored cart → set empty cart
      setCart([])
    } catch (err) {
      console.error('Failed to read cart from localStorage', err)
      setCart([])
    }
  }, [])

  // Handle order placement
  const handleOrderPlaced = (orderData) => {
    console.log('Order placed:', orderData)
    alert('Order successfully placed! Check console for details.')
    // Optionally redirect or update UI here, e.g., router.push('/order-confirmation')
  }

  if (cart === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading checkout...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Checkout cart={cart} onOrderPlaced={handleOrderPlaced} />
    </div>
  )
}