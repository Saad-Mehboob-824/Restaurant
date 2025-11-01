'use client'

import { useEffect, useState, useMemo } from 'react'
import Header from './Header'
import ItemCard from './ItemCard'
import ItemForm from './ItemForm'
import CategoryForm from './CategoryForm'

export default function MenuManagementClient() {
  const [tab, setTab] = useState('items')
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showCatModal, setShowCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [mi, catRes] = await Promise.all([
        fetch('/api/menu-items?admin=1').then(r=>r.json()),
        fetch('/api/categories').then(r=>r.json())
      ])
      setItems(Array.isArray(mi.data) ? mi.data : [])
      setCategories(Array.isArray(catRes.data) ? catRes.data : [])
    } catch (e) {
      console.error('Failed to load menu data', e)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleAddItem = () => { setEditingItem(null); setShowItemModal(true) }
  const handleEditItem = (it) => { setEditingItem(it); setShowItemModal(true) }
  const handleViewItem = (it) => { alert(JSON.stringify(it, null, 2)) }

  const handleToggle = async (it) => {
    try {
      const body = { _id: it._id, isAvailable: !it.isAvailable }
      const res = await fetch('/api/menu-items', { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type':'application/json' } })
      const data = await res.json()
      if (data.success) fetchData()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (it) => {
    if (!confirm(`Delete "${it.name}"? This will permanently remove the item.`)) return
    try {
      const res = await fetch('/api/menu-items', { method: 'DELETE', body: JSON.stringify({ _id: it._id }), headers: { 'Content-Type':'application/json' } })
      const data = await res.json()
      if (data.success) fetchData()
      else alert('Delete failed: ' + (data.error || 'unknown'))
    } catch (e) { console.error(e); alert('Delete failed') }
  }

  const saveItem = async (payload) => {
    try {
      const method = payload._id ? 'PUT' : 'POST'
      const res = await fetch('/api/menu-items', { method, body: JSON.stringify(payload), headers: { 'Content-Type':'application/json' } })
      const data = await res.json()
      if (data.success) {
        setShowItemModal(false)
        fetchData()
      } else alert('Save failed: ' + (data.error || 'unknown'))
    } catch (e) { console.error(e); alert('Save failed') }
  }

  const saveCategory = async (payload) => {
    try {
      const method = payload._id ? 'PUT' : 'POST'
      const res = await fetch('/api/categories', { method, body: JSON.stringify(payload), headers: { 'Content-Type':'application/json' } })
      const data = await res.json()
      if (data.success) {
        setShowCatModal(false)
        fetchData()
      } else alert('Save failed: ' + (data.error || 'unknown'))
    } catch (e) { console.error(e); alert('Save failed') }
  }

  const filteredItems = useMemo(() => items, [items])

  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex p-1 rounded-lg border border-neutral-200 bg-white">
            <button onClick={()=>setTab('items')} className={`px-3 py-1.5 text-sm rounded-md ${tab==='items' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}>Menu Items</button>
            <button onClick={()=>setTab('categories')} className={`px-3 py-1.5 text-sm rounded-md ${tab==='categories' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}>Categories</button>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">Use the toggle to switch between views</div>
        </div>

        {tab === 'items' && (
          <section className="mt-6 space-y-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-3 sm:p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-3 relative">
                  <input placeholder="Search by name or description..." className="w-full pl-3 pr-3 py-2 text-sm rounded-lg border border-neutral-200" />
                </div>
                <div className="md:col-span-3">
                  <select className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white">
                    <option value="">All categories</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-6 flex justify-end">
                  <button onClick={handleAddItem} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white">Add Menu Item</button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 text-xs text-neutral-500 bg-neutral-50 border-b border-neutral-200">
                <div className="col-span-3">Item</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1">Price</div>
                <div className="col-span-2">Availability</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div>
                {loading && <div className="p-4 text-sm text-neutral-500">Loading…</div>}
                {!loading && filteredItems.map(it => (
                  <ItemCard key={it._id} item={it} onEdit={handleEditItem} onView={handleViewItem} onDelete={handleDelete} onToggle={handleToggle} />
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'categories' && (
          <section className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl tracking-tight font-semibold">Categories</h2>
              <div>
                <button onClick={() => { setEditingCat(null); setShowCatModal(true) }} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white">Add Category</button>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 text-xs text-neutral-500 bg-neutral-50 border-b border-neutral-200">
                <div className="col-span-3">Category</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div>
                {categories.map(c => (
                  <div key={c._id} className="px-4 py-3 grid grid-cols-1 md:grid-cols-12 md:items-center gap-3">
                    <div className="md:col-span-3 flex items-center gap-3">
                      <img src={c.headerImage || '/fallback-category.jpg'} className="h-12 w-12 rounded-md object-cover border border-neutral-200"/>
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-neutral-500">ID: {String(c._id).slice(-6)}</div>
                      </div>
                    </div>
                    <div className="md:col-span-5 text-sm text-neutral-700">{c.description || ''}</div>
                    <div className="md:col-span-2 text-sm text-neutral-700">{new Date(c.createdAt).toLocaleDateString()}</div>
                    <div className="md:col-span-2 flex md:justify-end gap-1.5">
                      <button onClick={() => { setEditingCat(c); setShowCatModal(true) }} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white">Edit</button>
                      <button onClick={async () => {
                        if (!confirm(`Delete category "${c.name}"? This will permanently remove the category and any items in it.`)) return
                        try {
                          const res = await fetch('/api/categories', { method: 'DELETE', body: JSON.stringify({ _id: c._id }), headers: { 'Content-Type': 'application/json' } })
                          const data = await res.json()
                          if (data.success) fetchData()
                          else alert('Delete failed: ' + (data.error || 'unknown'))
                        } catch (e) { console.error(e); alert('Delete failed') }
                      }} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-red-200 text-red-700 bg-white hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white border border-neutral-200 rounded-xl shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="px-4 sm:px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg tracking-tight font-semibold">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
                  <p className="text-xs text-neutral-500">Create or edit a menu item</p>
                </div>
                <button onClick={() => setShowItemModal(false)} className="p-2 rounded-md hover:bg-neutral-50">✕</button>
              </div>
              <ItemForm initial={editingItem} categories={categories} onCancel={() => setShowItemModal(false)} onSave={saveItem} />
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-xl shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="px-4 sm:px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg tracking-tight font-semibold">{editingCat ? 'Edit Category' : 'Add Category'}</h3>
                  <p className="text-xs text-neutral-500">Create or edit a category</p>
                </div>
                <button onClick={() => setShowCatModal(false)} className="p-2 rounded-md hover:bg-neutral-50">✕</button>
              </div>
              <CategoryForm initial={editingCat} onCancel={() => setShowCatModal(false)} onSave={saveCategory} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
