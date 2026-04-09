// routes/confessions.js - Confession endpoint definitions
const express = require('express')
const router = express.Router()
const confessionController = require('../controllers/confessionController')

// Create confession - POST /confessions
router.post('/', confessionController.createConfession)

// Get all confessions - GET /confessions
router.get('/', confessionController.getAllConfessions)

// Get confession by ID - GET /confessions/:id
router.get('/:id', confessionController.getConfessionById)

// Upvote confession - PUT /confessions/:id/upvote
router.put('/:id/upvote', confessionController.upvoteConfession)

// Delete confession - DELETE /confessions/:id
router.delete('/:id', confessionController.deleteConfession)

module.exports = router
