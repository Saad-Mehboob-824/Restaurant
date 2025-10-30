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

    return Response.json({
      success: true,
      _id: order._id,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}