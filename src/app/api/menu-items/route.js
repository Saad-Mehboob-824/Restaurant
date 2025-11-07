import { getAllMenuItems, getAllMenuItemsAdmin, createMenuItem, updateMenuItem, deleteMenuItem, connectToDB } from '../../../services/db'
import { getOrCreateDefaultRestaurant } from '../../../utils/getRestaurantId'

export async function GET(request) {
  try {
    const restaurantId = await getOrCreateDefaultRestaurant()
    if (!restaurantId) {
      return Response.json({ 
        success: false, 
        error: 'No restaurant found. Please create a restaurant first.',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }
    
    const url = new URL(request.url)
    const admin = url.searchParams.get('admin')
    
    await connectToDB()
    const menuItems = admin ? await getAllMenuItemsAdmin(restaurantId) : await getAllMenuItems(restaurantId)
    
    return Response.json({ 
      success: true,
      data: menuItems,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Menu items fetch error:', error)
    return Response.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Support both category (old) and categoryName (new)
    const categoryName = body.categoryName || body.category
    if (!body || !body.name || body.price == null || !categoryName) {
      return Response.json({ 
        success: false, 
        error: 'name, price and categoryName (or category) are required' 
      }, { status: 400 })
    }
    
    const restaurantId = await getOrCreateDefaultRestaurant()
    if (!restaurantId) {
      return Response.json({ 
        success: false, 
        error: 'No restaurant found. Please create a restaurant first.'
      }, { status: 404 })
    }
    
    await connectToDB()
    
    // Prepare menu item data with variants and sides
    const menuItemData = {
      name: body.name,
      description: body.description || '',
      image: body.image || '',
      price: Number(body.price),
      isAvailable: body.isAvailable !== undefined ? Boolean(body.isAvailable) : true,
      variants: Array.isArray(body.variants) ? body.variants.map(v => ({
        variant: v.variant || v.name || '',
        price: Number(v.price || 0),
        img: v.img || v.image || ''
      })) : [],
      sides: Array.isArray(body.sides) ? body.sides.map(s => ({
        name: s.name || '',
        extraPrice: Number(s.extraPrice || 0),
        img: s.img || s.image || ''
      })) : []
    }
    
    const created = await createMenuItem(restaurantId, categoryName, menuItemData)
    
    return Response.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('MenuItem create error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    if (!body || !body._id) {
      return Response.json({ success: false, error: 'Missing _id for update' }, { status: 400 })
    }
    
    const restaurantId = await getOrCreateDefaultRestaurant()
    if (!restaurantId) {
      return Response.json({ 
        success: false, 
        error: 'No restaurant found. Please create a restaurant first.'
      }, { status: 404 })
    }
    
    await connectToDB()
    
    // Prepare updates
    const updates = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.image !== undefined) updates.image = body.image
    if (body.price !== undefined) updates.price = Number(body.price)
    if (body.isAvailable !== undefined) updates.isAvailable = Boolean(body.isAvailable)
    if (body.variants !== undefined) {
      updates.variants = Array.isArray(body.variants) ? body.variants.map(v => ({
        variant: v.variant || v.name || '',
        price: Number(v.price || 0),
        img: v.img || v.image || ''
      })) : []
    }
    if (body.sides !== undefined) {
      updates.sides = Array.isArray(body.sides) ? body.sides.map(s => ({
        name: s.name || '',
        extraPrice: Number(s.extraPrice || 0),
        img: s.img || s.image || ''
      })) : []
    }
    // Handle category change
    if (body.categoryName || body.category) {
      updates.categoryName = body.categoryName || body.category
    }
    
    const updated = await updateMenuItem(restaurantId, body._id, updates)
    
    return Response.json({ success: true, data: updated })
  } catch (error) {
    console.error('MenuItem update error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    if (!body || !body._id) {
      return Response.json({ success: false, error: 'Missing _id for delete' }, { status: 400 })
    }
    
    const restaurantId = await getOrCreateDefaultRestaurant()
    if (!restaurantId) {
      return Response.json({ 
        success: false, 
        error: 'No restaurant found. Please create a restaurant first.'
      }, { status: 404 })
    }
    
    await connectToDB()
    const deleted = await deleteMenuItem(restaurantId, body._id)
    
    return Response.json({ success: true, data: deleted })
  } catch (error) {
    console.error('MenuItem delete error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}