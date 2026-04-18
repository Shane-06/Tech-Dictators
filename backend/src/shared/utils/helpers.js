// Calculate distance from hub (assume hub at 0,0)
const calculateDistance = (lat, lng) => {
  return Math.sqrt(lat ** 2 + lng ** 2);
};

// Extract time features from ISO timestamp
const extractTimeFeatures = (scheduledTime) => {
  const date = new Date(scheduledTime);
  return {
    hour_of_day: date.getHours(),
    day_of_week: date.getDay()
  };
};

// Calculate cost for route optimization
const calculateCost = (distance, failureProbability) => {
  const { OPTIMIZATION_PENALTY } = require('../constants/appConstants');
  return distance + (failureProbability * OPTIMIZATION_PENALTY);
};

// Get risk level from probability
const getRiskLevel = (probability) => {
  const { RISK_LEVELS } = require('../constants/appConstants');
  if (probability < RISK_LEVELS.MEDIUM.min) return RISK_LEVELS.LOW;
  if (probability < RISK_LEVELS.HIGH.min) return RISK_LEVELS.MEDIUM;
  return RISK_LEVELS.HIGH;
};

module.exports = {
  calculateDistance,
  extractTimeFeatures,
  calculateCost,
  getRiskLevel
};