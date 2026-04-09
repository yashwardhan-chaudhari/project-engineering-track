// app.js - Main application setup and configuration
// Load environment variables first
require('./config/config')

const express = require('express')
const { initializeDatabase } = require('./config/database')
const confessionRoutes = require('./routes/confessions')

const app = express()

// Middleware
app.use(express.json())

// Routes
app.use('/confessions', confessionRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' })
})

// Start server
const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase()
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()

module.exports = app
