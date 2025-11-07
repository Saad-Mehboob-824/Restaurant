'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'

export default function ItemForm({ initial = null, categories = [], onCancel, onSave }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [categoryName, setCategoryName] = useState('') // Changed from category (ObjectId) to categoryName (string)
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  
  // Variants state
  const [variants, setVariants] = useState([])
  
  // Sides state
  const [sides, setSides] = useState([])

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setPrice(initial.price ?? '')
      // Support both categoryName and category (for backward compatibility)
      setCategoryName(initial.categoryName || initial.category?.name || initial.category || '')
      setDescription(initial.description || '')
      setImage(initial.image || '')
      setIsAvailable(initial.isAvailable !== undefined ? initial.isAvailable : true)
      // Load variants if they exist
      setVariants(Array.isArray(initial.variants) ? initial.variants.map(v => ({
        variant: v.variant || v.name || '',
        price: v.price || 0,
        img: v.img || v.image || ''
      })) : [])
      // Load sides if they exist
      setSides(Array.isArray(initial.sides) ? initial.sides.map(s => ({
        name: s.name || '',
        extraPrice: s.extraPrice || 0,
        img: s.img || s.image || ''
      })) : [])
    }
  }, [initial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      _id: initial?._id,
      name,
      price: Number(price || 0),
      categoryName, // Use categoryName (string) instead of category (ObjectId)
      description,
      image,
      isAvailable,
      variants: variants.filter(v => v.variant && v.variant.trim() !== ''), // Only include valid variants
      sides: sides.filter(s => s.name && s.name.trim() !== '') // Only include valid sides
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
      data.append('upload_preset', 'Restaurant')

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

  // Variant management functions
  const addVariant = () => {
    setVariants([...variants, { variant: '', price: 0, img: '' }])
  }

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const uploadVariantImage = async (index, file) => {
    if (!file) return
    
    setUploading(true)
    setMessage('⏳ Uploading variant image...')
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', 'Restaurant')

      const res = await fetch('https://api.cloudinary.com/v1_1/duugxwfu3/image/upload', { method: 'POST', body: data })
      const json = await res.json()

      if (json.secure_url) {
        updateVariant(index, 'img', json.secure_url)
        setMessage('✅ Variant image uploaded!')
      } else {
        setMessage('❌ Failed to upload variant image')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setMessage('❌ Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setMessage(''), 2500)
    }
  }

  // Side management functions
  const addSide = () => {
    setSides([...sides, { name: '', extraPrice: 0, img: '' }])
  }

  const updateSide = (index, field, value) => {
    const newSides = [...sides]
    newSides[index] = { ...newSides[index], [field]: field === 'extraPrice' ? Number(value) : value }
    setSides(newSides)
  }

  const removeSide = (index) => {
    setSides(sides.filter((_, i) => i !== index))
  }

  const uploadSideImage = async (index, file) => {
    if (!file) return
    
    setUploading(true)
    setMessage('⏳ Uploading side image...')
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', 'Restaurant')

      const res = await fetch('https://api.cloudinary.com/v1_1/duugxwfu3/image/upload', { method: 'POST', body: data })
      const json = await res.json()

      if (json.secure_url) {
        updateSide(index, 'img', json.secure_url)
        setMessage('✅ Side image uploaded!')
      } else {
        setMessage('❌ Failed to upload side image')
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
          <label className="text-sm text-neutral-700">Base Price</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Rs</span>
            <input value={price} onChange={e=>setPrice(e.target.value)} type="number" step="0.01" min="0" required className="w-full pl-6 pr-3 py-2 text-sm rounded-lg border border-neutral-200" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm text-neutral-700">Category</label>
        <select required value={categoryName} onChange={e=>setCategoryName(e.target.value)} className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white">
          <option value="">Select category</option>
          {categories.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
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

      {/* Variants Section */}
      <div className="border-t border-neutral-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-neutral-700">Variants</label>
          <button 
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50"
          >
            <Plus className="w-3 h-3" />
            Add Variant
          </button>
        </div>
        {variants.length === 0 ? (
          <p className="text-xs text-neutral-500">No variants added. Click "Add Variant" to add size/type options.</p>
        ) : (
          <div className="space-y-2">
            {variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 border border-neutral-200 rounded-lg">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Variant name (e.g., Small)"
                    value={variant.variant}
                    onChange={(e) => updateVariant(index, 'variant', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-neutral-200"
                  />
                </div>
                <div className="sm:col-span-3">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Rs</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={variant.price || ''}
                      onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                      className="w-full pl-5 pr-2 py-1.5 text-sm rounded border border-neutral-200"
                    />
                  </div>
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={variant.img || ''}
                    onChange={(e) => updateVariant(index, 'img', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-neutral-200"
                  />
                </div>
                <div className="sm:col-span-1 flex items-center gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && uploadVariantImage(index, e.target.files[0])}
                    className="hidden"
                    id={`variant-upload-${index}`}
                  />
                  <label htmlFor={`variant-upload-${index}`} className="cursor-pointer text-xs text-neutral-600 hover:text-neutral-900" title="Upload image">
                    📷
                  </label>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sides Section */}
      <div className="border-t border-neutral-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-neutral-700">Sides / Add-ons</label>
          <button 
            type="button"
            onClick={addSide}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50"
          >
            <Plus className="w-3 h-3" />
            Add Side
          </button>
        </div>
        {sides.length === 0 ? (
          <p className="text-xs text-neutral-500">No sides added. Click "Add Side" to add optional extras.</p>
        ) : (
          <div className="space-y-2">
            {sides.map((side, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 border border-neutral-200 rounded-lg">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Side name (e.g., Extra Cheese)"
                    value={side.name}
                    onChange={(e) => updateSide(index, 'name', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-neutral-200"
                  />
                </div>
                <div className="sm:col-span-3">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Rs</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Extra price"
                      value={side.extraPrice || ''}
                      onChange={(e) => updateSide(index, 'extraPrice', Number(e.target.value))}
                      className="w-full pl-5 pr-2 py-1.5 text-sm rounded border border-neutral-200"
                    />
                  </div>
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={side.img || ''}
                    onChange={(e) => updateSide(index, 'img', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-neutral-200"
                  />
                </div>
                <div className="sm:col-span-1 flex items-center gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && uploadSideImage(index, e.target.files[0])}
                    className="hidden"
                    id={`side-upload-${index}`}
                  />
                  <label htmlFor={`side-upload-${index}`} className="cursor-pointer text-xs text-neutral-600 hover:text-neutral-900" title="Upload image">
                    📷
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSide(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white">Cancel</button>
        <button type="submit" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-neutral-900 bg-neutral-900 text-white">Save</button>
      </div>
    </form>
  )
}
