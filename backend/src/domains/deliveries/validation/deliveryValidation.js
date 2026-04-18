const Joi = require('joi');

// Delivery creation schema
const createDeliverySchema = Joi.object({
  customerId: Joi.string().required().trim(),
  address: Joi.string().required().trim(),
  lat: Joi.number().required(),
  lng: Joi.number().required(),
  scheduledTime: Joi.date().required(),
  driverId: Joi.string().required().trim(),
  packageWeight: Joi.number().positive().required(),
  weather: Joi.object({
    rain: Joi.number().min(0).max(1).required(),
    temp: Joi.number().required()
  }).required(),
  historicalSuccessRate: Joi.number().min(0).max(1).required(),
  areaRisk: Joi.number().min(0).max(1).required()
});

// Delivery update schema
const updateDeliverySchema = Joi.object({
  customerId: Joi.string().trim(),
  address: Joi.string().trim(),
  lat: Joi.number(),
  lng: Joi.number(),
  scheduledTime: Joi.date(),
  driverId: Joi.string().trim(),
  packageWeight: Joi.number().positive(),
  weather: Joi.object({
    rain: Joi.number().min(0).max(1),
    temp: Joi.number()
  }),
  historicalSuccessRate: Joi.number().min(0).max(1),
  areaRisk: Joi.number().min(0).max(1)
}).min(1); // At least one field must be present

module.exports = {
  createDeliverySchema,
  updateDeliverySchema
};