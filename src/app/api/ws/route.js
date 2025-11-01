// This API route used to contain in-process WebSocket server logic.
// In this project we use a custom Node.js server (`server.js`) to handle
// WebSocket upgrade requests on /api/ws. Keeping an API route that
// attempts to upgrade websockets inside Next.js' App Router can be
// brittle and mixes runtimes. To avoid syntax/runtime errors in the
// editor and during development we provide a simple, safe handler here.

export async function GET() {
  return new Response('WebSocket endpoint handled by custom server (see server.js)', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}