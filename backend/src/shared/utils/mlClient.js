const axios = require('axios');
const { ML_CONFIG } = require('../constants/appConstants');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Call the FastAPI ML service with retry + timeout.
 * Returns: { failure_probability, is_high_risk, risk_label }
 */
const callMLService = async (features, retries = ML_CONFIG.RETRY_ATTEMPTS) => {
  try {
    const { data } = await axios.post(`${ML_URL}/predict`, features, {
      timeout: ML_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    });
    return data; // { failure_probability, is_high_risk, risk_label }
  } catch (err) {
    if (retries > 0) {
      console.warn(`[ML] Call failed – retrying… (${retries} left): ${err.message}`);
      await new Promise(r => setTimeout(r, 800));
      return callMLService(features, retries - 1);
    }
    // Graceful fallback — don't crash the whole request
    console.error('[ML] Service unreachable after all retries. Using fallback.');
    return { failure_probability: 0.5, is_high_risk: true, risk_label: 'MEDIUM' };
  }
};

/**
 * Send a batch of feature objects for parallel scoring.
 * Returns array of { failure_probability, is_high_risk, risk_label }
 */
const callMLServiceBatch = async (featuresList) => {
  try {
    const { data } = await axios.post(
      `${ML_URL}/predict/batch`,
      { deliveries: featuresList },
      { timeout: ML_CONFIG.TIMEOUT * 3, headers: { 'Content-Type': 'application/json' } }
    );
    return data.predictions;
  } catch (err) {
    console.error('[ML] Batch call failed. Using per-item fallback.');
    // Fall back to individual calls
    return Promise.all(featuresList.map(f => callMLService(f)));
  }
};

module.exports = { callMLService, callMLServiceBatch };