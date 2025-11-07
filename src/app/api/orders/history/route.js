export async function GET(request) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const status = url.searchParams.get('status');

    // Get restaurant ID
    const { getOrCreateDefaultRestaurant } = await import('../../../../utils/getRestaurantId');
    const restaurantId = await getOrCreateDefaultRestaurant();
    if (!restaurantId) {
      return Response.json({ error: 'No restaurant found' }, { status: 404 });
    }

    // Dynamically import DB helpers to avoid bundling server-only modules
    const { getAllOrders, connectToDB } = await import('../../../../services/db');
    await connectToDB();

    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (status) filters.status = status;

    const orders = await getAllOrders(restaurantId, filters);
    return Response.json(orders);
  } catch (error) {
    console.error('Failed to fetch order history:', error);
    return Response.json({ error: 'Failed to fetch order history' }, { status: 500 });
  }
}
