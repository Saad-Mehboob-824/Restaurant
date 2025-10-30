import { getMenuByCategory } from '../../../../services/db';

export async function GET(request) {
  try {
    // Get category name from the URL query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    if (!category) {
      return Response.json({ 
        success: false,
        error: 'Category name is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const items = await getMenuByCategory(category);
    return Response.json({ 
      success: true,
      data: items,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Menu items by category fetch error:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}