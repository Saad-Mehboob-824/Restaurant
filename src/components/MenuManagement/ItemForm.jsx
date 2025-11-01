'use client'

import { useState, useEffect } from 'react'

export default function ItemForm({ initial = null, categories = [], onCancel, onSave }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setPrice(initial.price ?? '')
      setCategory(initial.category?._id || initial.category || '')
      setDescription(initial.description || '')
      setImage(initial.image || '')
      setIsAvailable(initial.isAvailable !== undefined ? initial.isAvailable : true)
    }
  }, [initial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      _id: initial?._id,
      name,
      price: Number(price || 0),
      category,
      description,
      image,
      isAvailable,
    }
    onSave?.(payload)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage('⏳ Uploading image...')
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', 'Restaurant') // your unsigned preset

      const res = await fetch('https://api.cloudinary.com/v1_1/duugxwfu3/image/upload', { method: 'POST', body: data })
      const json = await res.json()

      if (json.secure_url) {
        setImage(json.secure_url)
        setMessage('✅ Image uploaded!')
      } else {
        console.error('Cloudinary response error:', json)
        setMessage('❌ Failed to upload image')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setMessage('❌ Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setMessage(''), 2500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 sm:px-5 py-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-neutral-700">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} required className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-neutral-200" />
        </div>
        <div>
          <label className="text-sm text-neutral-700">Price</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Rs</span>
            <input value={price} onChange={e=>setPrice(e.target.value)} type="number" step="0.01" min="0" required className="w-full pl-6 pr-3 py-2 text-sm rounded-lg border border-neutral-200" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm text-neutral-700">Category</label>
        <select required value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white">
          <option value="">Select category</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-sm text-neutral-700">Image URL</label>
          <input value={image} onChange={e=>setImage(e.target.value)} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-neutral-200" />
        </div>
        <div>
          <label className="text-sm text-neutral-700">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 w-full text-sm" />
          <div className="mt-1 text-xs text-neutral-500">{uploading ? 'Uploading…' : message}</div>
        </div>
        <div>
          <label className="text-sm text-neutral-700">Availability</label>
          <div className="mt-1">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isAvailable} onChange={e=>setIsAvailable(e.target.checked)} />
              <span className="text-sm">Available</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm text-neutral-700">Description</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-neutral-200" />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white">Cancel</button>
        <button type="submit" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-neutral-900 bg-neutral-900 text-white">Save</button>
      </div>
    </form>
  )
}
