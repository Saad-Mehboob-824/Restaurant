 'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Sidebar({ onClose, isOpen = false, isDesktop = true }) {
  const router = useRouter()

  async function handleLogout(e) {
    e.preventDefault()
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      router.push('/84588878l00o00g00i00n76580982')
    }
  }

  // When viewport width is >870px behave as desktop (always visible). Otherwise act as drawer.
  const mobileTransform = isDesktop ? 'translate-x-0' : (isOpen ? 'translate-x-0' : '-translate-x-full')

  return (
    <aside className={`fixed z-40 inset-y-0 left-0 w-72 transform ${mobileTransform} transition-transform`}>
      <div className="h-full flex flex-col bg-[#0e1117] border-r border-white/10">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <div className="h-9 w-9 rounded-md bg-white/10 text-white flex items-center justify-center text-sm tracking-tight">SL</div>
          <div className="flex flex-col">
            <span className="text-base font-medium tracking-tight">Admin</span>
            <span className="text-[11px] text-slate-400">Dashboard</span>
          </div>
          {!isDesktop && (
            <button onClick={onClose} className="ml-auto inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/5" aria-label="Close sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto pt-4 pb-4 px-3">
          <div className="text-[11px] uppercase tracking-[0.08em] text-slate-400 px-2 mb-2">Overview</div>
          <Link href="/admin" onClick={() => onClose?.()} className="group flex items-center gap-3 px-2 py-2 rounded-md text-slate-200 bg-white/5 border border-white/10">
            <span className="text-sm">Dashboard</span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">Live</span>
          </Link>
          <Link href="/admin/Orders" onClick={() => onClose?.()} className="group flex items-center gap-3 mt-1 px-2 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5">Orders</Link>
          <Link href="/admin/MenuManagement" onClick={() => onClose?.()} className="group flex items-center gap-3 mt-1 px-2 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5">Products</Link>
          <Link href="#" onClick={() => onClose?.()} className="group flex items-center gap-3 mt-1 px-2 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5">Customers</Link>

          <div className="mt-6 text-[11px] uppercase tracking-[0.08em] text-slate-400 px-2 mb-2">Insights</div>
          <Link href="#" className="group flex items-center gap-3 px-2 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5">Reports</Link>

          <div className="mt-6 text-[11px] uppercase tracking-[0.08em] text-slate-400 px-2 mb-2">Manage</div>
          <button onClick={handleLogout} className="w-full text-left px-2 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5">Logout</button>
        </nav>
      </div>
    </aside>
  )
}
