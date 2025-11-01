const { createServer } = require('http')
const WebSocket = require('ws')
const { parse } = require('url')

const PORT = parseInt(process.env.WS_PORT, 10) || 3002
const PING_INTERVAL = 30000 // 30 seconds

const clients = new Set()

function heartbeat() {
  this.isAlive = true
}

function broadcastToAll(message, exclude = null) {
  const messageStr = JSON.stringify(message)
  clients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      try {
        client.send(messageStr)
      } catch (e) {
        console.warn('Failed to send to client:', e)
      }
    }
  })
}

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.writeHead(200)
    res.end()
    return
  }

  if (req.url === '/internal/ws/broadcast' && req.method === 'POST') {
    console.log('HTTP /internal/ws/broadcast POST received from', req.socket.remoteAddress)
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        console.log('Broadcast body:', body)
        const msg = JSON.parse(body)
        console.log('Broadcasting message to clients:', msg)
        broadcastToAll(msg)
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        })
        res.end(JSON.stringify({ ok: true }))
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

const wss = new WebSocket.Server({ 
  server,
  perMessageDeflate: false, // Disable per-message deflate to reduce latency
  clientTracking: true // Enable built-in client tracking
})

// Ping all clients periodically
const interval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) {
      clients.delete(ws)
      return ws.terminate()
    }
    ws.isAlive = false
    try {
      ws.ping()
    } catch (e) {
      console.warn('Failed to ping client:', e)
    }
  })
}, PING_INTERVAL)

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress
  console.log(`New connection from ${ip}`)
  console.log('Connection req.url=', req.url)
  console.log('Connection headers:', req.headers)
  
  ws.isAlive = true
  ws.on('pong', heartbeat)
  clients.add(ws)
  // Send immediate welcome message
  try {
    ws.send(JSON.stringify({ type: 'connected' }))
  } catch (e) {
    console.warn('Failed to send welcome message:', e)
  }

  // log when we receive messages from clients
  ws.on('message', (data) => {
    try {
      const text = typeof data === 'string' ? data : data.toString()
      console.log(`Received message from ${ip}: ${text}`)
      const message = JSON.parse(text)
      if (message && message.type) {
        broadcastToAll(message, ws)
      }
    } catch (e) {
      console.warn('Failed to parse/broadcast message:', e)
      try {
        ws.send(JSON.stringify({ error: 'Invalid message format' }))
      } catch (e) {
        console.warn('Failed to send error response:', e)
      }
    }
  })

  // log close with code/reason
  ws.on('close', (code, reason) => {
    clients.delete(ws)
    console.log(`Client ${ip} disconnected (code=${code}, reason=${reason && reason.toString ? reason.toString() : reason})`)
  })

  ws.on('close', () => {
    // kept for safety if previous close handler isn't used
    clients.delete(ws)
    console.log(`Client ${ip} disconnected (close event)`) 
  })

  ws.on('error', (error) => {
    console.error(`WebSocket error from ${ip}:`, error)
    clients.delete(ws)
  })
})

wss.on('error', (error) => {
  console.error('WebSocket server error:', error)
})

server.on('error', (error) => {
  console.error('HTTP server error:', error)
})

// Cleanup on server shutdown
process.on('SIGTERM', () => {
  clearInterval(interval)
  wss.close(() => {
    server.close()
  })
})

// Log HTTP Upgrade attempts (handshake)
server.on('upgrade', (req, socket, head) => {
  try {
    console.log('Received upgrade request:', { url: req.url, headers: req.headers })
  } catch (e) {}
})

// Bind to 0.0.0.0 explicitly to accept IPv4 and IPv6 loopback connections
server.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server listening on ws://0.0.0.0:${PORT}`)
})