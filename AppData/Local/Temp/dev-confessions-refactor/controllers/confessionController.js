// controllers/confessionController.js - Request handlers for confession endpoints
// Controllers receive HTTP requests, coordinate with services, and send responses
// They handle HTTP-specific logic but NOT business logic
const confessionService = require('../services/confessionService')

// Create a new confession
// Orchestrates validation → processing → persistence → response
async function createConfession(req, res) {
  try {
    const { confession: confessionText, category } = req.body
    
    // Step 1: Validate input - fail fast on bad data before any processing
    const validation = confessionService.validateConfessionInput(confessionText, category)
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors })
    }
    
    // Step 2: Process confession text - normalize and clean
    const processedText = confessionService.processConfessionText(confessionText, category)
    if (!processedText) {
      return res.status(400).json({ error: 'Failed to process confession' })
    }
    
    // Step 3: Save to database - persist after all validations pass
    const savedConfession = await confessionService.saveConfession(processedText, category)
    console.log(`Confession created: ${savedConfession._id}`)
    
    // Step 4: Format and return response - shape data for client
    const responseData = confessionService.formatConfessionResponse(savedConfession)
    res.status(201).json(responseData)
    
  } catch (err) {
    console.error('Create confession error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Get all confessions
// Simple list operation - no complex filtering in v1
async function getAllConfessions(req, res) {
  try {
    const confessions = await confessionService.getAllConfessions()
    res.json(confessions)
  } catch (err) {
    console.error('Get all confessions error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Get confession by ID
// Single resource retrieval - used for detail pages or specific lookups
async function getConfessionById(req, res) {
  try {
    const { id } = req.params
    const confession = await confessionService.getConfessionById(id)
    
    // Return 404 if not found - signals to client resource doesn't exist
    if (!confession) {
      return res.status(404).json({ error: 'Confession not found' })
    }
    
    res.json(confession)
  } catch (err) {
    console.error('Get confession error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Upvote confession
// Increments ranking counter - enables trending and popularity sorting
async function upvoteConfession(req, res) {
  try {
    const { id } = req.params
    const updated = await confessionService.upvoteConfession(id)
    
    // Return 404 if ID invalid or confession deleted
    if (!updated) {
      return res.status(404).json({ error: 'Confession not found or already deleted' })
    }
    
    res.json({ updated: true, message: 'Upvote recorded' })
  } catch (err) {
    console.error('Upvote error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Delete confession
// Permanent removal - typically requires authentication in production
async function deleteConfession(req, res) {
  try {
    const { id } = req.params
    const deleted = await confessionService.deleteConfession(id)
    
    // Return 404 if ID doesn't exist
    if (!deleted) {
      return res.status(404).json({ error: 'Confession not found' })
    }
    
    res.json({ deleted: true, message: 'Confession deleted' })
  } catch (err) {
    console.error('Delete confession error:', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createConfession,
  getAllConfessions,
  getConfessionById,
  upvoteConfession,
  deleteConfession
}
