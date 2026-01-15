import '@testing-library/jest-dom/vitest'

// Configuration globale pour tous les tests
if (!global.fetch) {
  global.fetch = require('node-fetch')
}

// Mock des variables d'environnement pour les tests
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXTAUTH_SECRET: 'test-secret',
  NEXTAUTH_URL: 'http://localhost:3000',
}