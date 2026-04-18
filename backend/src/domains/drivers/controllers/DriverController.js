const DriverService = require('../services/DriverService');
const { createDriverSchema } = require('../validation/driverValidation');

class DriverController {

  static async createDriver(req, res, next) {
    try {
      const { error } = createDriverSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const driver = await DriverService.createDriver(req.body);
      res.status(201).json(driver);
    } catch (err) {
      next(err);
    }
  }

  static async getAllDrivers(req, res, next) {
    try {
      const drivers = await DriverService.getAllDrivers();
      res.json(drivers);
    } catch (err) {
      next(err);
    }
  }

  static async getDriverById(req, res, next) {
    try {
      const driver = await DriverService.getDriverById(req.params.id);
      res.json(driver);
    } catch (err) {
      next(err);
    }
  }

  static async updateDriver(req, res, next) {
    try {
      const driver = await DriverService.updateDriver(req.params.id, req.body);
      res.json(driver);
    } catch (err) {
      next(err);
    }
  }

  static async deleteDriver(req, res, next) {
    try {
      const result = await DriverService.deleteDriver(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DriverController;