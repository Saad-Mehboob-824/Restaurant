'use client'

import Image from 'next/image'
import { Pencil, Image as ImageIcon } from 'lucide-react'

export default function ProfileCard({ restaurant, onEditProfile, onChangeLogo }) {
  const isLive = restaurant?.isLive || false
  const totalBranches = restaurant?.totalBranches || (restaurant?.branches?.length || 0)

  return (
    <div className="mb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">Restaurant Profile</h1>
          <p className="mt-1 text-sm text-neutral-500">Update your restaurant info and manage all locations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onEditProfile}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
          <button
            onClick={onChangeLogo}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            <ImageIcon className="h-4 w-4" />
            Change Logo
          </button>
        </div>
      </div>

      {/* Cards Section - Stacked Vertically */}
      <div className="grid gap-4 sm:gap-6">
        {/* Restaurant Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {restaurant?.logo ? (
              <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={restaurant.logo}
                  alt={restaurant.name || 'Restaurant Logo'}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="hidden h-16 w-16 rounded-lg bg-neutral-900 text-white items-center justify-center text-sm font-medium">RL</div>
              </div>
            ) : (
              <div className="h-16 w-16 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-sm font-medium">RL</div>
            )}
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900">{restaurant?.name || 'Restaurant Name'}</h2>
                {isLive && (
                  <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-600">Live</span>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-600">{restaurant?.description || 'No description'}</p>
              <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-3">
                <div className="rounded-lg border border-neutral-200 p-3">
                  <div className="text-xs text-neutral-500">Cuisine</div>
                  <div className="text-sm font-medium text-neutral-900">{restaurant?.cuisine || '—'}</div>
                </div>
                <div className="rounded-lg border border-neutral-200 p-3">
                  <div className="text-xs text-neutral-500">Owner</div>
                  <div className="text-sm font-medium text-neutral-900">{restaurant?.owner || '—'}</div>
                </div>
                <div className="rounded-lg border border-neutral-200 p-3">
                  <div className="text-xs text-neutral-500">Contact</div>
                  <div className="text-sm font-medium text-neutral-900 truncate">{restaurant?.contactEmail || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Branches Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-500">Total branches</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{totalBranches}</div>
            </div>
            <div className="rounded-lg bg-neutral-100 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-neutral-500">Manage all locations below.</div>
        </div>
      </div>
    </div>
  )
}

