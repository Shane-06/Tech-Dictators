const express = require('express');
const LocationController = require('../controllers/LocationController');

const router = express.Router();

// Get coordinates by pincode (searches DB first, then external API)
router.get('/pincode/:pincode', LocationController.getPincodeCoordinates);

// Get weather data by coordinates
router.get('/weather', LocationController.getWeatherByCoordinates);

// Store pincode data manually
router.post('/pincode', LocationController.storePincode);

// Get all stored pincodes
router.get('/', LocationController.getAllPincodes);

module.exports = router;
