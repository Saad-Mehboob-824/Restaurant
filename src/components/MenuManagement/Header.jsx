 'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useRestaurant } from '@/hooks/useRestaurant'

export default function Header({ title = 'Menu Management', subtitle = 'Manage items, categories, and availability' }) {
  const router = useRouter()
  const { restaurant, loading } = useRestaurant()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    } catch (e) {
      console.error('Logout request failed', e)
    } finally {
      // ensure redirect even if fetch fails
      try {
        router.push('/84588878l00o00g00i00n76580982')
      } catch (err) {
        // fallback
        window.location.href = '/84588878l00o00g00i00n76580982'
      }
    }
  }
  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
            type="button"
            aria-label="Back to admin"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {restaurant?.logo ? (
            <div className="relative h-8 w-8 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={restaurant.logo}
                alt={restaurant.name || 'Restaurant Logo'}
                fill
                className="object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hidden h-8 w-8 rounded-lg bg-neutral-900 text-white items-center justify-center text-xs tracking-tight font-semibold select-none">MM</div>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs tracking-tight font-semibold select-none">MM</div>
          )}
          <div className="leading-tight">
            <h1 className="text-xl sm:text-2xl tracking-tight font-semibold">{title}</h1>
            <p className="text-xs text-neutral-500">{subtitle}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 focus:outline-none" type="button">Settings</button>
          <button onClick={handleLogout} type="button" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50">Logout</button>          
        </div>        
      </div>
    </header>
  )
}
