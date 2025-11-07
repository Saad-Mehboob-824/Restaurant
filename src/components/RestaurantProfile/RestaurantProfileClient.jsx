'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useRestaurant } from '@/hooks/useRestaurant'
import ProfileCard from './ProfileCard'
import BranchesTable from './BranchesTable'
import EditProfileModal from './EditProfileModal'
import ChangeLogoModal from './ChangeLogoModal'
import BranchFormModal from './BranchFormModal'
import DeleteBranchModal from './DeleteBranchModal'

export default function RestaurantProfileClient() {
  const router = useRouter()
  const { restaurant, loading: restaurantLoading } = useRestaurant()
  const [restaurantData, setRestaurantData] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showLogoModal, setShowLogoModal] = useState(false)
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [deletingBranch, setDeletingBranch] = useState(null)

  useEffect(() => {
    if (restaurant) {
      setRestaurantData(restaurant)
    }
  }, [restaurant])

  const handleSaveProfile = async (data) => {
    try {
      // Validate required field
      if (!data.name || !data.name.trim()) {
        alert('Restaurant name is required')
        return
      }
      
      // Extract only updatable fields
      const updateData = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        cuisine: data.cuisine?.trim() || '',
        owner: data.owner?.trim() || '',
        contactEmail: data.contactEmail?.trim() || '',
        contactPhone: data.contactPhone?.trim() || '',
        isLive: data.isLive || false,
        logo: data.logo || restaurantData?.logo || '',
        branches: data.branches || restaurantData?.branches || []
      }
      
      console.log('Updating restaurant with data:', updateData)
      
      const response = await fetch('/api/restaurants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      const result = await response.json()
      console.log('Update response:', result)
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update restaurant')
      }
      
      setRestaurantData(result.data)
      setShowEditModal(false)
      // Refresh the page to reload restaurant data from API
      window.location.reload()
    } catch (error) {
      console.error('Failed to update restaurant:', error)
      alert(`Failed to update restaurant: ${error.message}`)
    }
  }

  const handleSaveLogo = async (logoUrl) => {
    try {
      const updateData = {
        name: restaurantData?.name,
        description: restaurantData?.description,
        cuisine: restaurantData?.cuisine,
        owner: restaurantData?.owner,
        contactEmail: restaurantData?.contactEmail,
        contactPhone: restaurantData?.contactPhone,
        isLive: restaurantData?.isLive,
        logo: logoUrl,
        branches: restaurantData?.branches || []
      }
      
      const response = await fetch('/api/restaurants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update logo')
      }
      
      const result = await response.json()
      if (result.success) {
        setRestaurantData(result.data)
        setShowLogoModal(false)
        window.location.reload()
      } else {
        throw new Error(result.error || 'Failed to update logo')
      }
    } catch (error) {
      console.error('Failed to update logo:', error)
      alert(`Failed to update logo: ${error.message}`)
    }
  }

  const handleSaveBranch = async (branchData) => {
    try {
      // Validate required fields
      if (!branchData.name || !branchData.name.trim()) {
        alert('Branch name is required')
        return
      }
      if (!branchData.address || !branchData.address.trim()) {
        alert('Address is required')
        return
      }
      if (!branchData.city || !branchData.city.trim()) {
        alert('City is required')
        return
      }
      
      const branches = [...(restaurantData?.branches || [])]
      
      if (editingBranch !== null) {
        // Update existing branch
        const index = editingBranch
        if (index >= 0 && index < branches.length) {
          branches[index] = { 
            ...branches[index], 
            ...branchData,
            createdAt: branches[index].createdAt || new Date()
          }
        } else {
          alert('Invalid branch index')
          return
        }
      } else {
        // Add new branch
        branches.push({
          ...branchData,
          createdAt: new Date()
        })
      }

      const updateData = {
        name: restaurantData?.name,
        description: restaurantData?.description,
        cuisine: restaurantData?.cuisine,
        owner: restaurantData?.owner,
        contactEmail: restaurantData?.contactEmail,
        contactPhone: restaurantData?.contactPhone,
        isLive: restaurantData?.isLive,
        logo: restaurantData?.logo,
        branches
      }

      console.log('Saving branch, update data:', updateData)

      const response = await fetch('/api/restaurants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      const result = await response.json()
      console.log('Branch save response:', result)
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save branch')
      }
      
      setRestaurantData(result.data)
      setShowBranchModal(false)
      setEditingBranch(null)
      window.location.reload()
    } catch (error) {
      console.error('Failed to save branch:', error)
      alert(`Failed to save branch: ${error.message}`)
    }
  }

  const handleDeleteBranch = async () => {
    if (deletingBranch === null) return

    try {
      const branches = [...(restaurantData?.branches || [])]
      branches.splice(deletingBranch, 1)

      const updateData = {
        name: restaurantData?.name,
        description: restaurantData?.description,
        cuisine: restaurantData?.cuisine,
        owner: restaurantData?.owner,
        contactEmail: restaurantData?.contactEmail,
        contactPhone: restaurantData?.contactPhone,
        isLive: restaurantData?.isLive,
        logo: restaurantData?.logo,
        branches
      }

      const response = await fetch('/api/restaurants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete branch')
      }
      
      const result = await response.json()
      if (result.success) {
        setRestaurantData(result.data)
        setShowDeleteModal(false)
        setDeletingBranch(null)
        window.location.reload()
      } else {
        throw new Error(result.error || 'Failed to delete branch')
      }
    } catch (error) {
      console.error('Failed to delete branch:', error)
      alert(`Failed to delete branch: ${error.message}`)
    }
  }

  const handleEditBranch = (index) => {
    setEditingBranch(index)
    setShowBranchModal(true)
  }

  const handleDeleteBranchClick = (index) => {
    setDeletingBranch(index)
    setShowDeleteModal(true)
  }

  if (restaurantLoading || !restaurantData) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 text-neutral-500">Loading restaurant profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
            aria-label="Back to admin"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
        <ProfileCard
          restaurant={restaurantData}
          onEditProfile={() => setShowEditModal(true)}
          onChangeLogo={() => setShowLogoModal(true)}
        />

        <BranchesTable
          branches={restaurantData.branches || []}
          onAddBranch={() => {
            setEditingBranch(null)
            setShowBranchModal(true)
          }}
          onEditBranch={handleEditBranch}
          onDeleteBranch={handleDeleteBranchClick}
        />

        {showEditModal && (
          <EditProfileModal
            restaurant={restaurantData}
            onSave={handleSaveProfile}
            onCancel={() => setShowEditModal(false)}
          />
        )}

        {showLogoModal && (
          <ChangeLogoModal
            currentLogo={restaurantData.logo}
            onSave={handleSaveLogo}
            onCancel={() => setShowLogoModal(false)}
          />
        )}

        {showBranchModal && (
          <BranchFormModal
            branch={editingBranch !== null ? restaurantData.branches[editingBranch] : null}
            onSave={handleSaveBranch}
            onCancel={() => {
              setShowBranchModal(false)
              setEditingBranch(null)
            }}
          />
        )}

        {showDeleteModal && (
          <DeleteBranchModal
            branchName={deletingBranch !== null ? restaurantData.branches[deletingBranch]?.name : ''}
            onConfirm={handleDeleteBranch}
            onCancel={() => {
              setShowDeleteModal(false)
              setDeletingBranch(null)
            }}
          />
        )}
      </section>
    </div>
  )
}

