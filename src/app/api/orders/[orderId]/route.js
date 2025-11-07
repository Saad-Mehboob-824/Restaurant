import { updateOrderStatus } from '@/services/db'

export async function PATCH(request, { params }) {
  try {
    const { orderId } = params
    const { status } = await request.json()
    
    // Get restaurantId for the update
    const { getOrCreateDefaultRestaurant } = await import('../../../../utils/getRestaurantId')
    const restaurantId = await getOrCreateDefaultRestaurant()
    
    if (!restaurantId) {
      return new Response(JSON.stringify({ error: 'No restaurant found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    await updateOrderStatus(restaurantId, orderId, status)
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}