// components/CartSummary.jsx
'use client'

import Image from 'next/image'
import { Minus, Plus } from 'lucide-react'

export default function CartSummary({ cart, onUpdateQuantity }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-200">
      {cart.map((item, index) => (
        <div key={item.id} className="p-5 flex items-center gap-4">
          <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-neutral-100">
            <Image
              src={item.imageUrl || 'https://placehold.co/80x80/png?text=' + encodeURIComponent(item.name.charAt(0))}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              alt={item.name}
              onError={(e) => {
                e.target.src = 'https://placehold.co/80x80/png?text=' + encodeURIComponent(item.name.charAt(0));
              }}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{item.name}</h3>
            <p className="text-sm text-neutral-500 mb-1">{item.description}</p>
            {/* Show variant if present */}
            {item.variant && (
              <p className="text-xs text-neutral-600 mb-1">
                Variant: <span className="font-medium">{item.variant}</span>
              </p>
            )}
            {/* Show sides if present */}
            {item.selectedSides && item.selectedSides.length > 0 && (
              <p className="text-xs text-neutral-600 mb-2">
                Sides: <span className="font-medium">{item.selectedSides.map(s => s.sideName || s.name || s).join(', ')}</span>
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdateQuantity(index, -1)}
                className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-medium">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(index, 1)}
                className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">Rs {(item.price * item.quantity).toFixed(0)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}