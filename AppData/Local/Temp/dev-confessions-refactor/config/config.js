// config/config.js - Centralized environment configuration
require('dotenv').config()

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  database: {
    url: process.env.DB_URL || 'mongodb://localhost:27017',
    name: process.env.DB_NAME || 'confessions'
  },
  apis: {
    baseUrl: process.env.API_BASE_URL || 'https://api.example.com/v1',
    confessions: process.env.API_CONFESSIONS_ENDPOINT || 'https://api.example.com/v1/confessions',
    trending: process.env.API_TRENDING_ENDPOINT || 'https://api.example.com/v1/trending',
    stats: process.env.API_STATS_ENDPOINT || 'https://api.example.com/v1/users',
    auth: process.env.API_AUTH_ENDPOINT || 'https://api.example.com/v1/auth/validate',
    recommendations: process.env.API_RECOMMENDATIONS_ENDPOINT || 'https://api.example.com/v1/recommendations',
    analytics: process.env.API_ANALYTICS_ENDPOINT || 'https://api.example.com/v1/analytics/log',
    webhook: process.env.API_WEBHOOK_ENDPOINT || 'https://api.example.com/v1/webhooks/process'
  }
}

module.exports = config
