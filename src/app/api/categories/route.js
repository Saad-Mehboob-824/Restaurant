import { getAllCategories, deleteCategory } from '../../../services/db';
import { createCategory, updateCategory } from '../../../services/db';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return Response.json({ 
      success: true,
      data: categories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
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
    if (!body || !body.name) {
      return Response.json({ success: false, error: 'name is required' }, { status: 400 });
    }
    const created = await createCategory(body);
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Category create error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body || !body._id) {
      return Response.json({ success: false, error: 'Missing _id for update' }, { status: 400 });
    }
    const updated = await updateCategory(body._id, body);
    return Response.json({ success: true, data: updated });
  } catch (error) {
    console.error('Category update error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    if (!body || !body._id) {
      return Response.json({ success: false, error: 'Missing _id for delete' }, { status: 400 });
    }
    const deleted = await deleteCategory(body._id);
    return Response.json({ success: true, data: deleted });
  } catch (error) {
    console.error('Category delete error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}