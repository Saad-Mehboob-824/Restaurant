import { updateOrderStatus } from '@/services/db'

export async function PATCH(request, { params }) {
  try {
    const { orderId } = params
    const { status } = await request.json()
    
    await updateOrderStatus(orderId, status)
    
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