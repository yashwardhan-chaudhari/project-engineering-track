// services/confessionService.js - Business logic for confessions
// This layer handles all validation, processing, and database operations
// Separation allows testing logic independently from HTTP/Express concerns
const { ObjectId } = require('mongodb')
const { getDatabase } = require('../config/database')

// Validate confession input fields
// Separated from processing so validation failures don't waste processing cycles
function validateConfessionInput(confessionText, category) {
  const errors = []
  
  // Text cannot be empty - prevents spam/noise in the database
  if (!confessionText || confessionText.trim().length === 0) {
    errors.push('Confession text required')
  }
  
  // Category is mandatory for later filtering and organization
  if (!category || category.trim().length === 0) {
    errors.push('Category required')
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  }
}

// Process confession text - normalizes and cleans input
// Applied AFTER validation passes to avoid wasting compute on invalid input
function processConfessionText(confessionText, category) {
  if (!confessionText || !category) return null
  
  // Split into characters and filter out empty strings
  // This handles edge cases like multiple spaces or special formatting
  const splitChars = confessionText.split('').filter(Boolean)
  
  // Trim whitespace from each character
  // Ensures consistent spacing and removes accidental indentation
  const trimmedChars = splitChars.map(char => char.trim())
  
  // Join back together for storage
  // Results in cleaned, normalized text ready for the database
  const processedText = trimmedChars.join(' ')
  
  return processedText
}

// Save confession to database
// Single focus: persist validated data. No formatting or other concerns mixed in
async function saveConfession(confessionText, category) {
  const db = getDatabase()
  
  // Initialize with metadata needed for sorting, filtering, and ranking
  const confessionObj = {
    text: confessionText,
    category: category,
    timestamp: new Date(),  // Allows sorting by most-recent confessions
    upvotes: 0              // Enables ranking and trending features
  }
  
  // Insert and return the new document with generated ID
  const result = await db.collection('confessions').insertOne(confessionObj)
  
  return {
    _id: result.insertedId,
    ...confessionObj
  }
}

// Format confession for API response
// Separates database representation from client-facing format
// Allows future changes to database schema without breaking API contract
function formatConfessionResponse(savedConfession) {
  return {
    id: savedConfession._id.toString(),  // Convert ObjectId to string for JSON compatibility
    text: savedConfession.text,
    category: savedConfession.category,
    timestamp: savedConfession.timestamp,
    upvotes: savedConfession.upvotes
  }
}

// Get all confessions from database
// Batch operation for displaying lists or feeds
async function getAllConfessions() {
  const db = getDatabase()
  const confessions = await db.collection('confessions').find({}).toArray()
  // Format each confession for consistent API response
  return confessions.map(formatConfessionResponse)
}

// Get confession by ID
// Validates ObjectId format before query to fail fast on invalid IDs
async function getConfessionById(id) {
  const db = getDatabase()
  
  // MongoDB ObjectIds must be valid hex strings - bad IDs rejected immediately
  if (!ObjectId.isValid(id)) {
    return null
  }
  
  const confession = await db.collection('confessions').findOne({ _id: new ObjectId(id) })
  return confession ? formatConfessionResponse(confession) : null
}

// Increment upvote count for confession
// Isolated operation prevents concurrent update issues with counters
async function upvoteConfession(id) {
  const db = getDatabase()
  
  if (!ObjectId.isValid(id)) {
    return null
  }
  
  // Use atomic $inc operator - database handles concurrency safely
  // Prevents race conditions when multiple users upvote simultaneously
  const result = await db.collection('confessions').updateOne(
    { _id: new ObjectId(id) },
    { $inc: { upvotes: 1 } }
  )
  
  return result.modifiedCount > 0
}

// Delete confession by ID
// Hard delete - confessions cannot be recovered once removed
async function deleteConfession(id) {
  const db = getDatabase()
  
  if (!ObjectId.isValid(id)) {
    return null
  }
  
  const result = await db.collection('confessions').deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

module.exports = {
  validateConfessionInput,
  processConfessionText,
  saveConfession,
  formatConfessionResponse,
  getAllConfessions,
  getConfessionById,
  upvoteConfession,
  deleteConfession
}
