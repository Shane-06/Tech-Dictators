// Risk thresholds
const RISK_LEVELS = {
  LOW: { min: 0, max: 0.3, label: 'Low Risk' },
  MEDIUM: { min: 0.3, max: 0.7, label: 'Medium Risk' },
  HIGH: { min: 0.7, max: 1, label: 'High Risk' }
};

// Intervention strategies based on risk
const INTERVENTION_STRATEGIES = {
  LOW: ['Schedule delivery', 'Standard routing'],
  MEDIUM: ['Call customer', 'Flexible timing', 'Cluster nearby'],
  HIGH: ['Urgent call', 'Reschedule', 'Alternative address', 'Priority dispatch']
};

// Route optimization penalty
const OPTIMIZATION_PENALTY = 100;

// ML Service configuration
const ML_CONFIG = {
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3
};

module.exports = {
  RISK_LEVELS,
  INTERVENTION_STRATEGIES,
  OPTIMIZATION_PENALTY,
  ML_CONFIG
};