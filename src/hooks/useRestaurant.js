'use client'

import { useState, useEffect } from 'react'

export function useRestaurant() {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        setLoading(true)
        const response = await fetch('/api/restaurants')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            // Ensure branches is an array
            const restaurant = result.data
            if (!restaurant.branches || !Array.isArray(restaurant.branches)) {
              restaurant.branches = []
            }
            if (restaurant.totalBranches === undefined || restaurant.totalBranches === null) {
              restaurant.totalBranches = restaurant.branches.length
            }
            setRestaurant(restaurant)
          } else {
            setError('Failed to load restaurant data')
          }
        } else {
          const error = await response.json().catch(() => ({ error: 'Failed to fetch restaurant' }))
          setError(error.error || 'Failed to fetch restaurant')
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [])

  return { restaurant, loading, error }
}
