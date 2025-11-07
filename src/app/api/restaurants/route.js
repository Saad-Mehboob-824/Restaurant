import { createRestaurant, connectToDB } from '../../../services/db'
import { getOrCreateDefaultRestaurant } from '../../../utils/getRestaurantId'

export async function POST(request) {
  try {
    const body = await request.json()
    
    await connectToDB()
    
    const restaurant = await createRestaurant({
      name: body.name || 'My Restaurant',
      logo: body.logo || '',
      description: body.description || '',
      cuisine: body.cuisine || '',
      owner: body.owner || '',
      contactEmail: body.contactEmail || '',
      contactPhone: body.contactPhone || '',
      isLive: body.isLive || false,
      branches: body.branches || []
    })
    
    return Response.json({
      success: true,
      data: restaurant,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to create restaurant:', error)
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const restaurantId = await getOrCreateDefaultRestaurant()
    
    const { getRestaurant } = await import('../../../services/db')
    await connectToDB()
    
    const restaurant = await getRestaurant(restaurantId)
    
    // Ensure branches is an array and properly formatted
    if (!restaurant.branches) {
      restaurant.branches = []
    }
    if (!Array.isArray(restaurant.branches)) {
      restaurant.branches = []
    }
    
    // Ensure totalBranches matches branches length
    restaurant.totalBranches = restaurant.branches.length || 0
    
    console.log('GET /api/restaurants - Returning restaurant:', {
      _id: restaurant._id,
      name: restaurant.name,
      branchesCount: restaurant.branches?.length || 0,
      totalBranches: restaurant.totalBranches
    })
    
    return Response.json({
      success: true,
      data: restaurant,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get restaurant:', error)
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    console.log('PUT /api/restaurants - Request body:', JSON.stringify(body, null, 2))
    
    const restaurantId = await getOrCreateDefaultRestaurant()
    console.log('PUT /api/restaurants - Restaurant ID:', restaurantId)
    
    const { updateRestaurant } = await import('../../../services/db')
    await connectToDB()
    
    // Validate required fields
    if (body.name && !body.name.trim()) {
      throw new Error('Restaurant name cannot be empty')
    }
    
    // Ensure branches is an array
    if (body.branches !== undefined && !Array.isArray(body.branches)) {
      throw new Error('Branches must be an array')
    }
    
    // Validate branches if provided
    if (body.branches && Array.isArray(body.branches)) {
      for (let i = 0; i < body.branches.length; i++) {
        const branch = body.branches[i]
        if (!branch.name || !branch.name.trim()) {
          throw new Error(`Branch ${i + 1}: name is required`)
        }
        if (!branch.address || !branch.address.trim()) {
          throw new Error(`Branch ${i + 1}: address is required`)
        }
        if (!branch.city || !branch.city.trim()) {
          throw new Error(`Branch ${i + 1}: city is required`)
        }
      }
    }
    
    const updatedRestaurant = await updateRestaurant(restaurantId, body)
    console.log('PUT /api/restaurants - Updated restaurant:', {
      _id: updatedRestaurant._id,
      name: updatedRestaurant.name,
      branchesCount: updatedRestaurant.branches?.length || 0,
      totalBranches: updatedRestaurant.totalBranches
    })
    
    return Response.json({
      success: true,
      data: updatedRestaurant,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to update restaurant:', error)
    console.error('Error stack:', error.stack)
    return Response.json({
      success: false,
      error: error.message || 'Failed to update restaurant',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

