import { getAllMenuItems, getAllMenuItemsAdmin } from '../../../services/db';
import { createMenuItem, updateMenuItem, deleteMenuItem } from '../../../services/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const admin = url.searchParams.get('admin')
    const menuItems = admin ? await getAllMenuItemsAdmin() : await getAllMenuItems();
    return Response.json({ 
      success: true,
      data: menuItems,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Menu items fetch error:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || !body.name || body.price == null || !body.category) {
      return Response.json({ success: false, error: 'name, price and category are required' }, { status: 400 });
    }
    const created = await createMenuItem(body);
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('MenuItem create error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body || !body._id) {
      return Response.json({ success: false, error: 'Missing _id for update' }, { status: 400 });
    }
    const updated = await updateMenuItem(body._id, body);
    return Response.json({ success: true, data: updated });
  } catch (error) {
    console.error('MenuItem update error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    if (!body || !body._id) {
      return Response.json({ success: false, error: 'Missing _id for delete' }, { status: 400 });
    }
    const deleted = await deleteMenuItem(body._id);
    return Response.json({ success: true, data: deleted });
  } catch (error) {
    console.error('MenuItem delete error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}