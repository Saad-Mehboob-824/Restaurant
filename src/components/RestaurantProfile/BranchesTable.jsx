'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Pencil, Trash2, Store } from 'lucide-react'

export default function BranchesTable({ branches = [], onAddBranch, onEditBranch, onDeleteBranch }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) return branches

    const query = searchQuery.toLowerCase().trim()
    return branches.filter((branch) => {
      const name = (branch.name || '').toLowerCase()
      const address = (branch.address || '').toLowerCase()
      const phone = (branch.phone || '').toLowerCase()
      const city = (branch.city || '').toLowerCase()
      const status = (branch.status || '').toLowerCase()

      return (
        name.includes(query) ||
        address.includes(query) ||
        phone.includes(query) ||
        city.includes(query) ||
        status.includes(query)
      )
    })
  }, [branches, searchQuery])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'border-emerald-200 text-emerald-700 bg-emerald-50'
      case 'Temporarily Closed':
        return 'border-amber-200 text-amber-700 bg-amber-50'
      case 'Closed':
        return 'border-neutral-200 text-neutral-700 bg-neutral-50'
      default:
        return 'border-neutral-200 text-neutral-700 bg-neutral-50'
    }
  }

  return (
    <div className="mt-6 sm:mt-8 rounded-xl border border-neutral-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold tracking-tight">Locations / Branches</h3>
          <p className="mt-0.5 text-sm text-neutral-500">Create, edit, and remove branches.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search branches…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 rounded-lg border border-neutral-200 bg-white pl-9 pr-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <button
            onClick={onAddBranch}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            New Branch
          </button>
        </div>
      </div>

      {filteredBranches.length === 0 ? (
        <div className="border-t border-neutral-200 p-6 sm:p-8 text-center">
          <div className="mx-auto w-full max-w-sm">
            <Store className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-neutral-300" />
            <h4 className="mt-4 text-base sm:text-lg font-semibold tracking-tight">
              {searchQuery ? 'No branches found' : 'No branches yet'}
            </h4>
            <p className="mt-1 text-sm text-neutral-500">
              {searchQuery
                ? 'Try a different search term.'
                : 'Create your first location to start receiving orders.'}
            </p>
            {!searchQuery && (
              <button
                onClick={onAddBranch}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4" />
                Add Branch
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs text-neutral-500">
                <th className="sticky left-0 bg-white px-4 py-3">Branch</th>
                <th className="px-4 py-3 whitespace-nowrap">Address</th>
                <th className="px-4 py-3 whitespace-nowrap">Phone</th>
                <th className="px-4 py-3 whitespace-nowrap">City</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredBranches.map((branch, index) => (
                <tr key={index} className="border-t border-neutral-200">
                  <td className="sticky left-0 bg-white/95 backdrop-blur px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-neutral-100 flex items-center justify-center">
                        <Store className="h-4 w-4 text-neutral-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-neutral-900">{branch.name || 'Unnamed'}</div>
                        <div className="truncate text-xs text-neutral-500">#{index + 1}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{branch.address || '—'}</td>
                  <td className="px-4 py-3 text-neutral-700">{branch.phone || '—'}</td>
                  <td className="px-4 py-3 text-neutral-700">{branch.city || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${getStatusColor(
                        branch.status
                      )}`}
                    >
                      {branch.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditBranch(index)}
                        className="rounded-md border border-neutral-200 bg-white p-1.5 hover:bg-neutral-50"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBranch(index)}
                        className="rounded-md border border-neutral-200 bg-white p-1.5 hover:bg-neutral-50 text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

