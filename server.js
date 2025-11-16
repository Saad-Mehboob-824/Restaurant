const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const WebSocket = require('ws')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const clients = new Set()

function broadcastToAll(message, exclude = null) {
  const messageStr = JSON.stringify(message)
  clients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(messageStr)
    }
  })
}

  app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)

      // Internal broadcast endpoint used by server-side API routes to
      // notify connected WebSocket clients. This avoids importing the
      // WebSocket server instance into Next.js route modules.
      if (parsedUrl.pathname === '/internal/ws/broadcast' && req.method === 'POST') {
        let body = ''
        for await (const chunk of req) body += chunk
        try {
          const msg = JSON.parse(body || '{}')
          broadcastToAll(msg, null)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'invalid json' }))
        }
        return
      }

      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Create WebSocket server
  const wss = new WebSocket.Server({ noServer: true })

  wss.on('connection', (ws, request) => {
    try {
      const ip = request.socket && request.socket.remoteAddress
      console.log('WebSocket connection established from', ip, 'url=', request.url)
      console.log('WebSocket connection headers:', request.headers)
    } catch (e) { /* ignore logging errors */ }

    // mark alive for heartbeat
    ws.isAlive = true
    ws.on('pong', () => {
      try { ws.isAlive = true } catch (e) { /* ignore */ }
    })
    // Add new client to our set
    clients.add(ws)

    // Remove client from set when they disconnect
    ws.on('close', () => {
      clients.delete(ws)
    })

    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString())
        
        // Validate message format and authentication
        if (!data.type || !data.token) {
          ws.send(JSON.stringify({ error: 'Invalid message format' }))
          return
        }

        // Broadcast to all other clients
        switch (data.type) {
          case 'order:status-changed':
            broadcastToAll({
              type: 'order:status-changed',
              orderId: data.orderId,
              status: data.status,
              timestamp: Date.now()
            }, ws) // Exclude sender
            break
            
          default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }))
        }
      } catch (e) {
        console.error('WebSocket message error:', e)
        ws.send(JSON.stringify({ error: 'Invalid message' }))
      }
    })

    ws.on('error', (err) => {
      console.error('WebSocket client error:', err)
    })

    // Send initial connection success
    try { ws.send(JSON.stringify({ type: 'connected' })) } catch (e) { /* ignore */ }
  })

  // Handle upgrade requests
  server.on('upgrade', (request, socket, head) => {
    try {
      const ip = request.socket && request.socket.remoteAddress
      console.log('Received upgrade request for', request.url, 'from', ip)
      console.log('Upgrade headers:', request.headers)
    } catch (e) { /* ignore */ }

    const { pathname } = parse(request.url)

    if (pathname === '/api/ws') {
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request)
      })
    } else {
      socket.destroy()
    }
  })

  // Heartbeat: ping clients and terminate dead connections periodically
  const heartbeatInterval = setInterval(() => {
    clients.forEach((c) => {
      try {
        if (c.isAlive === false) {
          c.terminate()
          clients.delete(c)
          return
        }
        c.isAlive = false
        c.ping(() => {})
      } catch (e) {
        try { c.terminate() } catch (er) { /* ignore */ }
        clients.delete(c)
      }
    })
  }, 30000)

  const port = parseInt(process.env.PORT, 10) || 5000
  const host = '0.0.0.0'
  server.listen(port, host, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${host}:${port}`)
  })
  server.on('close', () => {
    clearInterval(heartbeatInterval)
  })
})