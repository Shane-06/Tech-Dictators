const Delivery = require('../models/Delivery');
const { calculateDistance, extractTimeFeatures, calculateCost, getRiskLevel } = require('../../../shared/utils/helpers');
const { callMLService } = require('../../../shared/utils/mlClient');
const { INTERVENTION_STRATEGIES } = require('../../../shared/constants/appConstants');

// Service Layer - All business logic
class DeliveryService {
  
  // Create delivery with ML prediction
  static async createDelivery(deliveryData) {
    try {
      const { lat, lng, scheduledTime, historicalSuccessRate, weather, areaRisk } = deliveryData;
      
      // Extract features
      const { hour_of_day, day_of_week } = extractTimeFeatures(scheduledTime);
      const distance_from_hub = calculateDistance(lat, lng);

      // Call ML service
      const failureProbability = await callMLService({
        hour_of_day,
        day_of_week,
        distance_from_hub,
        historical_success_rate: historicalSuccessRate,
        rain: weather.rain,
        temp: weather.temp,
        area_risk: areaRisk
      });

      // Determine risk level and strategies
      const riskLevel = getRiskLevel(failureProbability);
      const interventionStrategies = INTERVENTION_STRATEGIES[riskLevel.label.split(' ')[0]];

      // Create delivery document
      const delivery = new Delivery({
        ...deliveryData,
        failureProbability,
        riskLevel: riskLevel.label.split(' ')[0],
        interventionStrategies
      });

      return await delivery.save();
    } catch (err) {
      throw new Error(`Failed to create delivery: ${err.message}`);
    }
  }

  // Get all deliveries optimized by cost
  static async getAllDeliveries() {
    try {
      const deliveries = await Delivery.find().sort({ createdAt: -1 });
      
      // Calculate costs and optimize
      const deliveriesWithCost = deliveries.map(d => ({
        ...d.toObject(),
        distance: calculateDistance(d.lat, d.lng),
        cost: calculateCost(calculateDistance(d.lat, d.lng), d.failureProbability)
      }));
      
      // Sort by cost
      deliveriesWithCost.sort((a, b) => a.cost - b.cost);
      
      // Assign order
      return deliveriesWithCost.map((d, index) => ({
        ...d,
        optimizedOrder: index + 1
      }));
    } catch (err) {
      throw new Error(`Failed to fetch deliveries: ${err.message}`);
    }
  }

  // Get delivery by ID
  static async getDeliveryById(id) {
    try {
      const delivery = await Delivery.findById(id);
      if (!delivery) throw new Error('Delivery not found');
      return delivery;
    } catch (err) {
      throw new Error(`Failed to fetch delivery: ${err.message}`);
    }
  }

  // Update delivery
  static async updateDelivery(id, updateData) {
    try {
      const delivery = await Delivery.findByIdAndUpdate(id, updateData, { new: true });
      if (!delivery) throw new Error('Delivery not found');
      return delivery;
    } catch (err) {
      throw new Error(`Failed to update delivery: ${err.message}`);
    }
  }

  // Delete delivery
  static async deleteDelivery(id) {
    try {
      const delivery = await Delivery.findByIdAndDelete(id);
      if (!delivery) throw new Error('Delivery not found');
      return { message: 'Delivery deleted successfully', id };
    } catch (err) {
      throw new Error(`Failed to delete delivery: ${err.message}`);
    }
  }

  // Optimize specific deliveries
  static async optimizeDeliveries(deliveryIds) {
    try {
      const deliveries = await Delivery.find({ _id: { $in: deliveryIds } });
      
      if (deliveries.length === 0) throw new Error('No deliveries found');

      // Calculate costs
      const deliveriesWithCost = deliveries.map(d => ({
        ...d.toObject(),
        distance: calculateDistance(d.lat, d.lng),
        cost: calculateCost(calculateDistance(d.lat, d.lng), d.failureProbability)
      }));

      // Sort by cost
      deliveriesWithCost.sort((a, b) => a.cost - b.cost);

      // Update in DB
      for (let i = 0; i < deliveriesWithCost.length; i++) {
        await Delivery.findByIdAndUpdate(
          deliveriesWithCost[i]._id,
          { optimizedOrder: i + 1 }
        );
      }

      return deliveriesWithCost.map((d, index) => ({
        ...d,
        optimizedOrder: index + 1
      }));
    } catch (err) {
      throw new Error(`Failed to optimize deliveries: ${err.message}`);
    }
  }
}

module.exports = DeliveryService;