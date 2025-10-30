import { getAllMenuItems } from '../../../services/db';

export async function GET() {
  try {
    const menuItems = await getAllMenuItems();
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