'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function EditProfileModal({ restaurant, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [owner, setOwner] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || '')
      setDescription(restaurant.description || '')
      setCuisine(restaurant.cuisine || '')
      setOwner(restaurant.owner || '')
      setContactEmail(restaurant.contactEmail || '')
      setContactPhone(restaurant.contactPhone || '')
      setIsLive(restaurant.isLive || false)
    }
  }, [restaurant])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...restaurant,
      name,
      description,
      cuisine,
      owner,
      contactEmail,
      contactPhone,
      isLive
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel}></div>
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight">Edit Restaurant</h3>
          <button className="rounded-md p-1 hover:bg-neutral-100" onClick={onCancel}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Tagline / Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Cuisine</label>
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Contact Phone</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isLive}
                onChange={(e) => setIsLive(e.target.checked)}
                className="rounded border-neutral-200"
              />
              <span className="text-sm font-medium text-neutral-700">Restaurant is Live</span>
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

