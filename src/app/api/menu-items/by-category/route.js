import { getMenuByCategory, connectToDB } from '../../../../services/db'
import { getOrCreateDefaultRestaurant } from '../../../../utils/getRestaurantId'

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
    
    // Get category name from the URL query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    if (!category) {
      return Response.json({ 
        success: false,
        error: 'Category name is required',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    await connectToDB()
    const items = await getMenuByCategory(restaurantId, category)
    
    return Response.json({ 
      success: true,
      data: items,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Menu items by category fetch error:', error)
    return Response.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}