 'use client'

import { useRouter } from 'next/navigation'

export default function Header({ title = 'Menu Management', subtitle = 'Manage items, categories, and availability' }) {
  const router = useRouter()

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
          <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs tracking-tight font-semibold select-none">MM</div>
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
