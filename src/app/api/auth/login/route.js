import { sign } from 'jsonwebtoken'
import { connectToDB, findUserByEmail } from '@/services/db'
import bcrypt from 'bcryptjs'
import { getOrCreateDefaultRestaurant } from '@/utils/getRestaurantId'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    console.log('Login attempt for email:', email)
    
    const restaurantId = await getOrCreateDefaultRestaurant()
    if (!restaurantId) {
      return new Response(
        JSON.stringify({ error: 'No restaurant found. Please create a restaurant first.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    await connectToDB()

    // Find user in User collection (supports both branch-specific and Global users)
    const user = await findUserByEmail(restaurantId, email)
    console.log('Found user:', user ? { 
      _id: user._id,
      email: user.email, 
      role: user.role,
      restaurantId: user.restaurantId,
      passwordHashLength: user.passwordHash?.length 
    } : 'No user found')
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify password with bcrypt since it was hashed in Express backend
    console.log('Attempting password verification')
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    console.log('Password verification result:', isValidPassword)
    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create token
    // Users now have _id in separate collection
    const token = sign(
      { 
        userId: user._id.toString(), // Use _id as identifier
        restaurantId: user.restaurantId ? user.restaurantId.toString() : restaurantId, // Use user's restaurantId or fallback
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Calculate cookie expiry
    const cookieExpiry = new Date();
    cookieExpiry.setDate(cookieExpiry.getDate() + 1); // 1 day from now

    // Create response with cookie in header
    const response = new Response(
      JSON.stringify({ 
        token,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${token}; Path=/; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Expires=${cookieExpiry.toUTCString()}`
        }
      }
    )

    return response
  } catch (error) {
    console.error('Login error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}