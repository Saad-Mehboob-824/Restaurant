'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Upload } from 'lucide-react'

export default function ChangeLogoModal({ currentLogo, onSave, onCancel }) {
  const [logoPreview, setLogoPreview] = useState(currentLogo || '')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage('⏳ Uploading image...')
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', 'Restaurant')

      const res = await fetch('https://api.cloudinary.com/v1_1/duugxwfu3/image/upload', {
        method: 'POST',
        body: data
      })
      const json = await res.json()

      if (json.secure_url) {
        setLogoPreview(json.secure_url)
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

  const handleSave = () => {
    if (logoPreview) {
      onSave(logoPreview)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel}></div>
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight">Change Logo</h3>
          <button className="rounded-md p-1 hover:bg-neutral-100" onClick={onCancel}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 sm:p-5 text-center">
            <input
              id="logoInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {logoPreview ? (
              <div className="mx-auto h-16 w-16 rounded-lg overflow-hidden relative">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="mx-auto h-16 w-16 rounded-lg bg-neutral-200 flex items-center justify-center">
                <span className="text-neutral-400 text-xs">No Logo</span>
              </div>
            )}
            <p className="mt-3 text-sm text-neutral-600">PNG or JPG, 256x256 recommended.</p>
            {message && <p className="mt-2 text-xs text-neutral-500">{message}</p>}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
              <label
                htmlFor="logoInput"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload'}
              </label>
              <button
                onClick={handleSave}
                disabled={!logoPreview || uploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

