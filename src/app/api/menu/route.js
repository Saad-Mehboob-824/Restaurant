import { getMenu, connectToDB } from '../../../services/db'
import { getOrCreateDefaultRestaurant } from '../../../utils/getRestaurantId'

export async function GET() {
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
    const menu = await getMenu(restaurantId)
    
    return Response.json({ 
      success: true,
      data: menu,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Menu fetch error:', error)
    return Response.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
