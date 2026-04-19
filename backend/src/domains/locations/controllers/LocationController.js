const axios = require('axios');
const Pincode = require('../models/Pincode');

class LocationController {
  // Get coordinates by pincode from database
  static async getPincodeCoordinates(req, res) {
    try {
      const { pincode } = req.params;

      if (!pincode || !/^[0-9]{5,6}$/.test(pincode)) {
        return res.status(400).json({
          error: 'Invalid pincode format. Must be 5-6 digits.',
        });
      }

      // Search in database (skip if MongoDB not connected)
      try {
        const pincodeData = await Pincode.findOne({ pincode });

        if (pincodeData) {
          return res.json({
            success: true,
            source: 'database',
            data: {
              pincode: pincodeData.pincode,
              latitude: pincodeData.latitude,
              longitude: pincodeData.longitude,
              city: pincodeData.city,
              state: pincodeData.state,
              country: pincodeData.country,
            },
          });
        }
      } catch (dbErr) {
        console.warn('MongoDB lookup skipped:', dbErr.message);
      }

      // If not in database, fetch from OpenStreetMap (Nominatim) and store
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            postalcode: pincode,
            country: 'India',
            format: 'json',
            addressdetails: 1,
            limit: 1,
          },
          headers: {
            'User-Agent': 'TechDictators-DeliveryApp/1.0'
          },
          timeout: 5000,
        }
      );

      if (!response.data || response.data.length === 0) {
        return res.status(404).json({
          error: 'Pincode not found in any database',
        });
      }

      const location = response.data[0];
      // Parse city/state from address details or display_name fallback
      const displayParts = (location.display_name || '').split(',').map(s => s.trim());
      const pincodeResult = {
        pincode,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        city: location.address?.city || location.address?.town || location.address?.village || displayParts[0] || 'Unknown',
        state: location.address?.state || displayParts[displayParts.length - 2] || 'Unknown',
        country: location.address?.country || 'India',
      };

      // Try to cache in MongoDB (non-blocking)
      try {
        const newPincode = new Pincode(pincodeResult);
        await newPincode.save();
      } catch (saveErr) {
        console.warn('Could not cache pincode in DB:', saveErr.message);
      }

      return res.json({
        success: true,
        source: 'external_api',
        data: pincodeResult,
      });
    } catch (error) {
      console.error('Error fetching pincode coordinates:', error.message);
      res.status(500).json({
        error: 'Failed to fetch coordinates for pincode',
        details: error.message,
      });
    }
  }

  // Get weather data using coordinates
  static async getWeatherByCoordinates(req, res) {
    try {
      const { latitude, longitude } = req.query;
      const weatherApiKey = process.env.WEATHER_API_KEY || '160f0f1770fa4c2f8ee214930261804';

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: 'Latitude and longitude are required',
        });
      }

      const response = await axios.get(
        'https://api.open-meteo.com/v1/forecast',
        {
          params: {
            latitude: latitude,
            longitude: longitude,
            current_weather: true,
          },
          timeout: 5000,
        }
      );

      const weatherData = response.data.current_weather;
      if (!weatherData) throw new Error("Invalid weather data received");
      
      const code = weatherData.weathercode;
      
      // WMO Weather interpretation codes
      let mappedWeather = 'cloudy';
      let description = 'Cloudy';
      
      if (code === 0) {
        mappedWeather = 'sunny';
        description = 'Clear sky';
      } else if (code >= 1 && code <= 3) {
        mappedWeather = 'cloudy';
        description = 'Partly cloudy';
      } else if (code >= 51 && code <= 67 || code >= 80 && code <= 82) {
        mappedWeather = 'rainy';
        description = 'Rainy';
      } else if (code >= 95) {
        mappedWeather = 'rainy';
        description = 'Thunderstorm';
      } else if (code >= 45 && code <= 48) {
        mappedWeather = 'cloudy';
        description = 'Foggy';
      }

      return res.json({
        success: true,
        data: {
          weather: mappedWeather,
          description: description,
          temperature: Math.round(weatherData.temperature),
          humidity: 50, // Open-meteo current_weather doesn't return humidity by default, we'd need hourly
          windSpeed: weatherData.windspeed,
          cloudiness: code >= 1 && code <= 3 ? 50 : (code === 0 ? 0 : 100),
          visibility: 10,
        },
      });
    } catch (error) {
      console.error('Error fetching weather:', error.message);
      res.status(500).json({
        error: 'Failed to fetch weather data',
        details: error.message,
      });
    }
  }

  // Store or update pincode with coordinates
  static async storePincode(req, res) {
    try {
      const { pincode, latitude, longitude, city, state } = req.body;

      if (!pincode || !latitude || !longitude) {
        return res.status(400).json({
          error: 'Pincode, latitude, and longitude are required',
        });
      }

      let savedPincode = await Pincode.findOneAndUpdate(
        { pincode },
        {
          pincode,
          latitude,
          longitude,
          city: city || 'Unknown',
          state: state || 'Unknown',
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return res.json({
        success: true,
        message: 'Pincode data stored successfully',
        data: savedPincode,
      });
    } catch (error) {
      console.error('Error storing pincode:', error.message);
      res.status(500).json({
        error: 'Failed to store pincode data',
        details: error.message,
      });
    }
  }

  // Get all stored pincodes (with pagination)
  static async getAllPincodes(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const pincodes = await Pincode.find()
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Pincode.countDocuments();

      return res.json({
        success: true,
        data: pincodes,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching pincodes:', error.message);
      res.status(500).json({
        error: 'Failed to fetch pincodes',
        details: error.message,
      });
    }
  }
}

module.exports = LocationController;
