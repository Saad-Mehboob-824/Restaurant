import { verify } from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return Response.json({ valid: false, error: 'No token provided' }, { status: 401 })
    }

    const decoded = verify(token, process.env.JWT_SECRET)
    return Response.json({ valid: true, user: decoded })
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 401 })
  }
}