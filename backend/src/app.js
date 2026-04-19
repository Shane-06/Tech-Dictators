const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./shared/config/database');
const logger = require('./shared/middleware/logger');
const errorHandler = require('./shared/middleware/errorHandler');

// Import domain routers
const deliveriesDomain = require('./domains/deliveries');
const authDomain = require('./domains/auth');
const driversDomain = require('./domains/drivers');
const locationsDomain = require('./domains/locations');

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Connect to MongoDB
connectDB();

// Register all domain routes dynamically
const domains = [deliveriesDomain, authDomain, driversDomain, locationsDomain];
domains.forEach(domain => {
  app.use(domain.path, domain.router);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    domains: domains.map(d => d.path)
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
  console.log(`✓ Domains loaded: ${domains.map(d => d.path).join(', ')}`);
});