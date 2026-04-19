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

      // Search in database
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

      // If not in database, fetch from OpenStreetMap (Nominatim) and store
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            postalcode: pincode,
            country: 'India',
            format: 'json',
            limit: 1,
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
      const newPincode = new Pincode({
        pincode,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        city: location.address?.city || location.address?.town || 'Unknown',
        state: location.address?.state || 'Unknown',
        country: location.address?.country || 'India',
      });

      await newPincode.save();

      return res.json({
        success: true,
        source: 'external_api',
        data: {
          pincode: newPincode.pincode,
          latitude: newPincode.latitude,
          longitude: newPincode.longitude,
          city: newPincode.city,
          state: newPincode.state,
          country: newPincode.country,
        },
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
        'https://api.openweathermap.org/data/2.5/weather',
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: weatherApiKey,
          },
          timeout: 5000,
        }
      );

      const weatherData = response.data;
      const weatherMain = weatherData.weather[0].main.toLowerCase();
      const description = weatherData.weather[0].description;

      // Map to delivery-relevant categories
      let mappedWeather = 'cloudy';
      if (
        weatherMain.includes('rain') ||
        weatherMain.includes('drizzle') ||
        weatherMain.includes('thunderstorm')
      ) {
        mappedWeather = 'rainy';
      } else if (
        weatherMain.includes('clear') ||
        weatherMain.includes('sunny')
      ) {
        mappedWeather = 'sunny';
      } else if (weatherMain.includes('cloud')) {
        mappedWeather = 'cloudy';
      }

      return res.json({
        success: true,
        data: {
          weather: mappedWeather,
          description: description,
          temperature: Math.round(weatherData.main.temp - 273.15),
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed,
          cloudiness: weatherData.clouds.all,
          visibility: weatherData.visibility / 1000, // Convert to km
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
