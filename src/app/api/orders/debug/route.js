import { connectToDB, OrderNew } from '@/services/db';

export async function GET(req) {
  try {
    await connectToDB();

    // fetch a few recent docs from the active 'order' collection
    const [newOrders] = await Promise.all([
      OrderNew.find().sort({ createdAt: -1 }).limit(5).lean().exec(),
    ]);

    const newCount = await OrderNew.countDocuments();

    return new Response(JSON.stringify({
      ok: true,
      orderCollection: { count: newCount, sample: newOrders }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('orders debug error', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
