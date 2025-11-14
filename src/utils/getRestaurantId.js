import { connectToDB } from '../services/db'
import { Restaurant } from '../models/Restaurant'

/**
 * Get restaurant ID from various sources or default
 * Priority: 
 * 1. Request header 'x-restaurant-id'
 * 2. Query parameter 'restaurant'
 * 3. Environment variable DEFAULT_RESTAURANT_ID
 * 4. First restaurant found in database
 */
export async function getRestaurantId(request = null) {
  // Try header first
  if (request) {
    const headerId = request.headers.get('x-restaurant-id')
    if (headerId) return headerId

    // Try query parameter
    try {
      const url = new URL(request.url)
      const queryId = url.searchParams.get('restaurant')
      if (queryId) return queryId
    } catch (e) {
      // Not a valid URL, skip
    }
  }

  // Try environment variable
  if (process.env.DEFAULT_RESTAURANT_ID) {
    return process.env.DEFAULT_RESTAURANT_ID
  }

  // Get first restaurant from database
  try {
    await connectToDB()
    const restaurant = await Restaurant.findOne().select('_id').lean()
    if (restaurant) {
      return restaurant._id.toString()
    }
  } catch (e) {
    console.error('Error getting default restaurant:', e)
  }

  // Return null if no restaurant found
  return null
}

let cachedDefaultRestaurantId = null;

/**
 * Get or create default restaurant (for initial setup)
 * Priority:
 * 1. Environment variable 'Restaurant' from .env.local
 * 2. First existing restaurant in database
 * 3. Create new default restaurant if none found
 */
export async function getOrCreateDefaultRestaurant() {
  if (cachedDefaultRestaurantId) {
    return cachedDefaultRestaurantId;
  }

  await connectToDB()
  
  // First, try to get restaurant ID from .env.local
  if (process.env.Restaurant) {
    try {
      const restaurant = await Restaurant.findById(process.env.Restaurant).lean()
      if (restaurant) {
        cachedDefaultRestaurantId = restaurant._id.toString();
        return cachedDefaultRestaurantId;
      } else {
        console.warn(`Restaurant ID from .env.local (${process.env.Restaurant}) not found in database.`)
      }
    } catch (error) {
      console.error('Error finding restaurant by ID from .env.local:', error)
    }
  }
  
  // Try to find any existing restaurant first
  const existingRestaurant = await Restaurant.findOne().lean();
  if (existingRestaurant) {
    console.log(`Using existing restaurant with ID: ${existingRestaurant._id}`);
    cachedDefaultRestaurantId = existingRestaurant._id.toString();
    return cachedDefaultRestaurantId;
  }
  
  // Create default restaurant only if none exists
  const restaurant = await Restaurant.create({
    name: process.env.DEFAULT_RESTAURANT_NAME || 'My Restaurant',
    branches: []
  })
  console.log(`Created default restaurant with ID: ${restaurant._id}`)
  cachedDefaultRestaurantId = restaurant._id.toString();
  
  return cachedDefaultRestaurantId;
}

