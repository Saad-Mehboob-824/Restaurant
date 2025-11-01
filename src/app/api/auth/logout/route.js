export async function POST(request) {
  try {
    // Clear token cookie by setting it to expired
    const expired = new Date(0).toUTCString()

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `token=; Path=/; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Expires=${expired}`
      }
    })
  } catch (err) {
    console.error('Logout error', err)
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
