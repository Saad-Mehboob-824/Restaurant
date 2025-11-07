import { getCategories, createCategory, updateCategory, deleteCategory, connectToDB } from '../../../services/db'
import { getOrCreateDefaultRestaurant } from '../../../utils/getRestaurantId'

export async function GET(request) {
  try {
    const restaurantId = await getOrCreateDefaultRestaurant()
    if (!restaurantId) {
      return Response.json({ 
        success: false, 
        error: 'No restaurant found. Please create a restaurant first.',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }
    
    await connectToDB()
    const categories = await getCategories(restaurantId)
    
    return Response.json({ 
      success: true,
      data: categories,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Categories fetch error:', error)
    return Response.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    if (!body || !body.name) {
      return Response.json({ success: false, error: 'name is required' }, { status: 400 })
    }
    
    const restaurantId = await getOrCreateDefaultRestaurant()
    if (!restaurantId) {
      return Response.json({ 
        success: false, 
        error: 'No restaurant found. Please create a restaurant first.'
      }, { status: 404 })
    }
    
    await connectToDB()
    const created = await createCategory(restaurantId, body)
    
    return Response.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('Category create error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    // Support both _id (name) and name for backward compatibility
    const categoryName = body._id || body.name
    if (!categoryName) {
      return Response.json({ success: false, error: 'Missing category name (_id or name) for update' }, { status: 400 })
    }
    
    const restaurantId = await getOrCreateDefaultRestaurant()
    if (!restaurantId) {
      return Response.json({ 
        success: false, 
        error: 'No restaurant found. Please create a restaurant first.'
      }, { status: 404 })
    }
    
    await connectToDB()
    const updated = await updateCategory(restaurantId, categoryName, body)
    
    return Response.json({ success: true, data: updated })
  } catch (error) {
    console.error('Category update error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    // Support both _id (name) and name for backward compatibility
    const categoryName = body._id || body.name
    if (!categoryName) {
      return Response.json({ success: false, error: 'Missing category name (_id or name) for delete' }, { status: 400 })
    }
    
    const restaurantId = await getOrCreateDefaultRestaurant()
    if (!restaurantId) {
      return Response.json({ 
        success: false, 
        error: 'No restaurant found. Please create a restaurant first.'
      }, { status: 404 })
    }
    
    await connectToDB()
    const deleted = await deleteCategory(restaurantId, categoryName)
    
    return Response.json({ success: true, data: deleted })
  } catch (error) {
    console.error('Category delete error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}