// components/DeliveryForm.jsx
'use client'

import { useState } from 'react'
import { Bike, ShoppingBag, Phone, MapPin, Crosshair, Banknote, Mail } from 'lucide-react'
import Map from './Map'

export default function DeliveryForm({ formData, onChange }) {
  const [selectedPickupDetails, setSelectedPickupDetails] = useState({ name: '', address: '' })
  // Pickup locations map (use this to render the select and details)
  const locations = {
    islamabad: { name: 'Islamabad', address: 'G-13/1, near PGC' },
    rawalpindi: { name: 'Rawalpindi', address: 'Saddar, Rawalpindi' },
    f6: { name: 'F-6', address: 'F-6 sector, Islamabad' },
  };

  const handlePickupChange = (value) => {
    onChange('pickupLocation', value)
    setSelectedPickupDetails(locations[value] || { name: '', address: '' })
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude.toFixed(4)
        const lng = position.coords.longitude.toFixed(4)
        onChange('address', `${lat}, ${lng}`)
      })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Phone className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+92 3** *******"
            className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">Order Type</label>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => onChange('orderType', 'delivery')}
            className={`order-type-btn py-4 px-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2 ${formData.orderType === 'delivery' ? 'bg-neutral-900 text-white' : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            <Bike className="w-6 h-6" />
            <span>Delivery</span>
          </button>
          <button
            onClick={() => onChange('orderType', 'pickup')}
            className={`order-type-btn py-4 px-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2 ${formData.orderType === 'pickup' ? 'bg-neutral-900 text-white' : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            <ShoppingBag className="w-6 h-6" />
            <span>Pickup</span>
          </button>
        </div>
        {formData.orderType === 'delivery' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Delivery Address</label>
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => onChange('address', e.target.value)}
                  placeholder="Enter your address"
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
              </div>
              <Map onLocationChange={(addr) => onChange('address', addr)} />
              <button
                onClick={useCurrentLocation}
                className="text-sm text-neutral-900 font-medium hover:underline flex items-center gap-2"
              >
                <Crosshair className="w-4 h-4" />
                Use current location
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Apartment/Suite (Optional)</label>
              <input
                type="text"
                value={formData.apartment}
                onChange={(e) => onChange('apartment', e.target.value)}
                placeholder="Apt 4B"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Delivery Instructions (Optional)</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => onChange('instructions', e.target.value)}
                placeholder="Ring the doorbell twice..."
                rows={3}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}
        {formData.orderType === 'pickup' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Select Pickup Location</label>
            <select
              value={formData.pickupLocation}
              onChange={(e) => handlePickupChange(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value="">Choose a location...</option>
              {Object.entries(locations).map(([key, loc]) => (
                <option key={key} value={key}>{`${loc.name} - ${loc.address}`}</option>
              ))}
            </select>
            {formData.pickupLocation && (
              <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-neutral-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-900 mb-1">{selectedPickupDetails.name}</p>
                    <p className="text-sm text-neutral-600">{selectedPickupDetails.address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Payment Method</label>
        <div className="bg-neutral-50 border-2 border-neutral-900 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Banknote className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-neutral-900">Cash on Delivery</p>
            <p className="text-sm text-neutral-600">Pay when you receive your order</p>
          </div>
        </div>
      </div>
    </div>
  )
}