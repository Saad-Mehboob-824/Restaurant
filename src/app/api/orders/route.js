export async function GET() {
  try {
    // Dynamically import DB service
    const { getAllOrders, connectToDB } = await import('../../../services/db');
    await connectToDB();
    
    const orders = await getAllOrders();
    return Response.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return Response.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return Response.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      );
    }

    const { updateOrderStatus, connectToDB } = await import('../../../services/db');
    await connectToDB();
    
    const updatedOrder = await updateOrderStatus(orderId, status);
    
    // Notify connected WebSocket clients via internal server endpoint
    try {
      const broadcastUrl = process.env.WS_BROADCAST_URL || 'http://localhost:3002/internal/ws/broadcast'
      await fetch(broadcastUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order:status-changed',
          orderId,
          status,
          order: updatedOrder,
          timestamp: Date.now()
        })
      })
    } catch (e) {
      console.error('Failed to notify WS clients:', e)
    }
    
    return Response.json(updatedOrder);
  } catch (error) {
    console.error('Failed to update order:', error);
    return Response.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Received order request:', body);

    // Dynamically import DB service inside the handler to avoid bundling
    // server-only modules into the build step which can cause memory issues.
    const { createOrder, connectToDB } = await import('../../../services/db');

    // Ensure DB connection is established
    await connectToDB();

    // Delegate order creation to service
    const orderPayload = {
      name: body.customerName || '',
      phone: body.phone || '',
      email: body.email || '',
      // map incoming orderType -> type in DB (fallbacks)
      type: (body.orderType || body.type || 'delivery'),
      address: body.address || '',
      items: (body.items || []).map(item => ({
        menuItem: item.name,  // Since we're not using real IDs yet
        quantity: item.quantity,
        selectedSides: [],
        price: item.price
      })),
      total: body.totalAmount || 0,
      status: body.status || 'pending',
      instructions: body.instructions || ''
    };
    
    console.log('Mapped order payload:', orderPayload);

    const order = await createOrder(orderPayload);

    // Notify all WebSocket clients about the new order via internal endpoint
    try {
      const broadcastUrl = process.env.WS_BROADCAST_URL || 'http://localhost:3002/internal/ws/broadcast'
      await fetch(broadcastUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order:added',
          orderId: order._id,
          order: order,
          timestamp: Date.now()
        })
      })
    } catch (e) {
      console.error('Failed to notify WS clients about new order:', e)
    }

    // Return full created order so client can confirm fields (including type)
    return Response.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}