const DeliveryService = require('../services/DeliveryService');
const { createDeliverySchema, updateDeliverySchema } = require('../validation/deliveryValidation');

// Controller Layer - Handles requests/responses
class DeliveryController {

  static async createDelivery(req, res, next) {
    try {
      const { error } = createDeliverySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const delivery = await DeliveryService.createDelivery(req.body);
      res.status(201).json(delivery);
    } catch (err) {
      next(err);
    }
  }

  static async getAllDeliveries(req, res, next) {
    try {
      const deliveries = await DeliveryService.getAllDeliveries();
      res.json(deliveries);
    } catch (err) {
      next(err);
    }
  }

  static async getDeliveryById(req, res, next) {
    try {
      const delivery = await DeliveryService.getDeliveryById(req.params.id);
      res.json(delivery);
    } catch (err) {
      next(err);
    }
  }

  static async updateDelivery(req, res, next) {
    try {
      const { error } = updateDeliverySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const delivery = await DeliveryService.updateDelivery(req.params.id, req.body);
      res.json(delivery);
    } catch (err) {
      next(err);
    }
  }

  static async deleteDelivery(req, res, next) {
    try {
      const result = await DeliveryService.deleteDelivery(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async optimizeDeliveries(req, res, next) {
    try {
      const { deliveryIds } = req.body;
      
      if (!Array.isArray(deliveryIds) || deliveryIds.length === 0) {
        return res.status(400).json({ error: 'deliveryIds array required' });
      }

      const deliveries = await DeliveryService.optimizeDeliveries(deliveryIds);
      res.json(deliveries);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DeliveryController;