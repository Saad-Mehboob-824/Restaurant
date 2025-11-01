'use client'

import { useState } from 'react'

export default function TopBar({ onOpenSidebar, isDesktop = true }) {
  const [q, setQ] = useState('')

  return (
    <header className="h-16 flex items-center gap-3 px-4 md:px-6 border-b border-white/10 bg-[#0b0d12]/60 backdrop-blur">
      {!isDesktop && (
        <button onClick={onOpenSidebar} className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-white/5" aria-label="Open sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
        </button>
      )}
      <div className="hidden md:flex items-center gap-2 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>
        <span className="text-sm">Welcome back</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search orders, customers..." className="pl-9 pr-3 h-9 w-64 bg-white/[0.06] border border-white/10 rounded-md text-sm placeholder:text-slate-500 outline-none focus:border-white/20" />
        </div>

        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-white/[0.06] border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
          <span className="text-sm">Import</span>
        </button>
        <button className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-white/[0.06] border border-white/10" aria-label="Notifications">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
        </button>
      </div>
    </header>
  )
}
