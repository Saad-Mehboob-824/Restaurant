'use client'

import { useState, useEffect } from 'react'
import { X, Phone, MapPin, ChevronDown } from 'lucide-react'

export default function BranchFormModal({ branch, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [status, setStatus] = useState('Open')

  useEffect(() => {
    if (branch) {
      setName(branch.name || '')
      setAddress(branch.address || '')
      setPhone(branch.phone || '')
      setCity(branch.city || '')
      setLat(branch.coordinates?.lat?.toString() || '')
      setLng(branch.coordinates?.lng?.toString() || '')
      setStatus(branch.status || 'Open')
    } else {
      // Reset form for new branch
      setName('')
      setAddress('')
      setPhone('')
      setCity('')
      setLat('')
      setLng('')
      setStatus('Open')
    }
  }, [branch])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!name.trim()) {
      alert('Branch name is required')
      return
    }
    if (!address.trim()) {
      alert('Address is required')
      return
    }
    if (!city.trim()) {
      alert('City is required')
      return
    }
    
    const branchData = {
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim() || undefined,
      city: city.trim(),
      coordinates: {
        lat: lat && lat.trim() ? parseFloat(lat) : undefined,
        lng: lng && lng.trim() ? parseFloat(lng) : undefined
      },
      status: status || 'Open'
    }

    // Remove undefined values
    if (!branchData.coordinates.lat && !branchData.coordinates.lng) {
      branchData.coordinates = undefined
    }
    if (!branchData.phone) {
      delete branchData.phone
    }

    onSave(branchData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel}></div>
      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight">
            {branch ? 'Edit Branch' : 'New Branch'}
          </h3>
          <button className="rounded-md p-1 hover:bg-neutral-100" onClick={onCancel}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Branch name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Phone</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Address</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>
          </div>
          <div className="sm:col-span-2 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="e.g., 33.6844"
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="e.g., 73.0479"
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Temporarily Closed">Temporarily Closed</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>
          <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Save Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

