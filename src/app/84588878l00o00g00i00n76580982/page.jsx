'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      console.log('Attempting login with:', { email, password })
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin'
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store user info in localStorage
      localStorage.setItem('userRole', data.role)
      localStorage.setItem('userName', `${data.firstName} ${data.lastName}`)

  // Force a hard navigation to the admin Orders page
  window.location.href = '/admin/Orders'
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Right visual panel */}
      <aside className="hidden lg:flex w-1/2 items-center justify-center bg-white/70">
        <div className="relative h-full w-full">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1974&auto=format&fit=crop"
            alt="Restaurant interior ambience"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-white via-white/70 to-transparent"></div>
        </div>
      </aside>

      {/* Left auth panel */}
      <main className="flex w-full lg:w-1/2 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900 text-white shadow-sm ring-1 ring-neutral-900/10">
              <span className="text-[13px] font-semibold tracking-tight" style={{ letterSpacing: '-0.02em' }}>RS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-900">Restaurant Staff</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-neutral-700" style={{ stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                <path d="M4 3v7" />
                <path d="M6 3v7" />
                <path d="M4 7h2" />
                <path d="M8 3v7a3 3 0 0 1-3 3" />
                <path d="M12 3v18" />
                <path d="M16 3h3a2 2 0 0 1 2 2v4a3 3 0 0 1-3 3h-2V3z" />
              </svg>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-xl border border-neutral-200 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="px-6 pt-6 pb-2">
              <h1 className="text-[26px] font-semibold tracking-tight text-neutral-900" style={{ letterSpacing: '-0.02em' }}>Employee Login</h1>
              <p className="mt-1.5 text-sm text-neutral-600">Access your staff portal using your work credentials.</p>
            </div>

            <div className="px-6 pb-6">
              {error && (
                <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}
              
              <form method="POST" onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-800">Work Email</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M22 6 12 13 2 6" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="username"
                      placeholder="you@company.com"
                      className="w-full rounded-lg border border-neutral-300 bg-white px-10 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 hover:border-neutral-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-800">Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-neutral-300 bg-white px-10 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 hover:border-neutral-400"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-[15px] font-medium text-white shadow-sm ring-1 ring-neutral-900/10 transition hover:bg-neutral-800 hover:shadow-md focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 active:bg-neutral-900/90"
                  >
                    Sign in
                  </button>
                </div>
              </form>

              {/* Footnote */}
              <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
                <p className="text-[13px] text-neutral-600">Staff-only access. Contact your manager if you need help.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}