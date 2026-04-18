const Joi = require('joi');

const createDriverSchema = Joi.object({
  driverId: Joi.string().required().trim(),
  name: Joi.string().required().trim(),
  successRate: Joi.number().min(0).max(1).default(0.85),
  averageDeliveryTime: Joi.number().positive().default(30)
});

module.exports = {
  createDriverSchema
};