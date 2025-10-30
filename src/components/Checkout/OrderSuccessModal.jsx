// components/OrderSuccessModal.jsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Info, Map, Home } from 'lucide-react'

export default function OrderSuccessModal({ orderId, address, total, onTrack, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])
  const router = useRouter()

  const handleBackHome = () => {
    // navigate to home and call optional onClose
    router.push('/')
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* Outer wrapper keeps rounded corners; inner scroll area handles overflow */}
      <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6 space-y-6 max-h-[90vh] overflow-auto">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Order Placed Successfully!</h2>
          <p className="text-neutral-600">Your order has been confirmed and is being prepared</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <span className="text-sm text-neutral-600">Order Number</span>
            <span className="font-semibold text-lg">{orderId}</span>
          </div>
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <span className="text-sm text-neutral-600">Estimated Delivery</span>
            <span className="font-semibold">25-35 minutes</span>
          </div>
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <span className="text-sm text-neutral-600">Delivery Address</span>
            <span className="font-medium text-right text-sm">{address}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Total Paid</span>
            <span className="font-semibold text-xl">${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">Track your order</p>
            <p className="text-sm text-blue-700">We'll send you updates via SMS. You can also track your order in real-time.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onTrack}
            className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
          >
            <Map className="w-5 h-5" />
            Track Order
          </button>
          <button
            onClick={handleBackHome}
            className="flex-1 py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}