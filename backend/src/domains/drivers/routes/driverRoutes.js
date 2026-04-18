const express = require('express');
const DriverController = require('../controllers/DriverController');

const router = express.Router();

router.post('/', DriverController.createDriver);
router.get('/', DriverController.getAllDrivers);
router.get('/:id', DriverController.getDriverById);
router.put('/:id', DriverController.updateDriver);
router.delete('/:id', DriverController.deleteDriver);

module.exports = router;