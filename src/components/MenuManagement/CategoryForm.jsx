'use client'

import { useState, useEffect } from 'react'

export default function CategoryForm({ initial = null, onCancel, onSave }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [headerImage, setHeaderImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setDescription(initial.description || '')
      setHeaderImage(initial.headerImage || initial.image || '')
    }
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave?.({ _id: initial?._id, name, description, headerImage })
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
        setHeaderImage(json.secure_url)
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
      <div>
        <label className="text-sm text-neutral-700">Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-neutral-200" />
      </div>
      <div>
        <label className="text-sm text-neutral-700">Description</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-neutral-200" />
      </div>
      <div>
        <label className="text-sm text-neutral-700">Header Image URL</label>
        <input value={headerImage} onChange={e=>setHeaderImage(e.target.value)} type="url" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-neutral-200" />
        <div className="mt-2">
          <label className="text-sm text-neutral-700">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 w-full text-sm" />
          <div className="mt-1 text-xs text-neutral-500">{uploading ? 'Uploading…' : message}</div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white">Cancel</button>
        <button type="submit" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-neutral-900 bg-neutral-900 text-white">Save</button>
      </div>
    </form>
  )
}
