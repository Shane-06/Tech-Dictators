const Driver = require('../models/Driver');

// Driver Service Layer
class DriverService {

  static async createDriver(driverData) {
    try {
      const driver = new Driver(driverData);
      return await driver.save();
    } catch (err) {
      throw new Error(`Failed to create driver: ${err.message}`);
    }
  }

  static async getAllDrivers() {
    try {
      return await Driver.find().sort({ createdAt: -1 });
    } catch (err) {
      throw new Error(`Failed to fetch drivers: ${err.message}`);
    }
  }

  static async getDriverById(id) {
    try {
      const driver = await Driver.findById(id);
      if (!driver) throw new Error('Driver not found');
      return driver;
    } catch (err) {
      throw new Error(`Failed to fetch driver: ${err.message}`);
    }
  }

  static async updateDriver(id, updateData) {
    try {
      const driver = await Driver.findByIdAndUpdate(id, updateData, { new: true });
      if (!driver) throw new Error('Driver not found');
      return driver;
    } catch (err) {
      throw new Error(`Failed to update driver: ${err.message}`);
    }
  }

  static async deleteDriver(id) {
    try {
      const driver = await Driver.findByIdAndDelete(id);
      if (!driver) throw new Error('Driver not found');
      return { message: 'Driver deleted', id };
    } catch (err) {
      throw new Error(`Failed to delete driver: ${err.message}`);
    }
  }
}

module.exports = DriverService;