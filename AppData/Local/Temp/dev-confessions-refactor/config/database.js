// config/database.js - Database configuration and connection management
const { MongoClient } = require('mongodb')

let db = null

async function initializeDatabase() {
  try {
    const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017'
    const dbName = process.env.DB_NAME || 'confessions'
    
    const client = new MongoClient(dbUrl)
    await client.connect()
    
    db = client.db(dbName)
    console.log(`Connected to MongoDB: ${dbName}`)
    
    return db
  } catch (err) {
    console.error('Database connection failed:', err)
    process.exit(1)
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return db
}

module.exports = {
  initializeDatabase,
  getDatabase
}
