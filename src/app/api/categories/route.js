import { getAllCategories } from '../../../services/db';

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