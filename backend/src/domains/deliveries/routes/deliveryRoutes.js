const express = require('express');
const DeliveryController = require('../controllers/DeliveryController');

const router = express.Router();

// Route definitions
router.post('/', DeliveryController.createDelivery);
router.get('/', DeliveryController.getAllDeliveries);
router.post('/optimize', DeliveryController.optimizeDeliveries);
router.get('/:id', DeliveryController.getDeliveryById);
router.put('/:id', DeliveryController.updateDelivery);
router.delete('/:id', DeliveryController.deleteDelivery);

module.exports = router;