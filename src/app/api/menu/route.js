import { getMenu } from '../../../services/db';

export async function GET() {
  try {
    const menu = await getMenu();
    return Response.json({ 
      success: true,
      data: menu,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Menu fetch error:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
