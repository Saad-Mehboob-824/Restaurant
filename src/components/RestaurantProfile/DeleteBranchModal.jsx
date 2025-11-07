'use client'

import { X, Trash2 } from 'lucide-react'

export default function DeleteBranchModal({ branchName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel}></div>
      <div className="relative z-10 w-full max-w-md rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-red-50 p-2 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight">Delete branch</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Are you sure you want to delete <strong>{branchName}</strong>? This action cannot be undone.
            </p>
          </div>
          <button className="rounded-md p-1 hover:bg-neutral-100" onClick={onCancel}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

