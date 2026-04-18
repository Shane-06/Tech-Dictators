import React, { useState } from "react";
import MapPicker from "./MapPicker";

interface PredictionResult {
  title: string;
  summary: string;
  reasons: string[];
  probability: number;
  predictionId: string;
  loading?: boolean;
  error?: string;
}

const Card: React.FC = () => {
  const WEATHER_API_KEY = "160f0f1770fa4c2f8ee214930261804";
  
  const [formData, setFormData] = useState({
    orderedBefore: "",
    weather: "",
    location: "",
    traffic: "",
    pincode: "",
  });
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState<string>("");
  const formRef = React.useRef<HTMLDivElement>(null);

  const fetchPincode = async (lat: number, lng: number) => {
    setPincodeLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      
      if (!response.ok) {
        throw new Error("Pincode fetch error");
      }
      
      const data = await response.json();
      const postalCode = data.address?.postcode || data.address?.postal_code || "N/A";
      
      // Update only pincode, don't reset other form fields
      setFormData(prev => ({ ...prev, pincode: postalCode }));
      console.log("Pincode fetched:", postalCode);
    } catch (error) {
      console.error("Pincode fetch error:", error);
      setFormData(prev => ({ ...prev, pincode: "N/A" }));
    } finally {
      setPincodeLoading(false);
    }
  };

  const fetchWeather = async (lat: number, lng: number) => {
    setWeatherLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error("Weather API error");
      }
      
      const data = await response.json();
      
      // Map weather conditions to our categories
      const weatherMain = data.weather[0].main.toLowerCase();
      const description = data.weather[0].description;
      
      let mappedWeather = "cloudy";
      if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
        mappedWeather = "rainy";
      } else if (weatherMain.includes("clear") || weatherMain.includes("sunny")) {
        mappedWeather = "sunny";
      } else if (weatherMain.includes("cloud")) {
        mappedWeather = "cloudy";
      }
      
      // Update form data with fetched weather
      setFormData(prev => ({ ...prev, weather: mappedWeather }));
      setWeatherInfo(`${description.charAt(0).toUpperCase() + description.slice(1)} (${Math.round(data.main.temp - 273.15)}°C)`);
      
      console.log("Weather fetched:", mappedWeather, `(${description})`);
    } catch (error) {
      console.error("Weather fetch error:", error);
      setWeatherInfo("Unable to fetch weather");
      // Keep previous weather or set to cloudy as default
      setFormData(prev => ({ ...prev, weather: prev.weather || "cloudy" }));
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    setFormData({
      orderedBefore: "",
      weather: "",
      location: "",
      traffic: "",
      pincode: "",
    });
    setMapPosition(null);
    setResult(null);
    setWeatherInfo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const missingFields = [];
    if (!formData.orderedBefore) missingFields.push("Customer order history");
    if (!formData.traffic) missingFields.push("Traffic level");
    if (!mapPosition) missingFields.push("Location (click on map)");
    if (!formData.weather) missingFields.push("Weather data");

    if (missingFields.length > 0) {
      // Show validation error WITHOUT clearing any inputs
      setResult({
        title: "Missing information",
        summary: `Please fill in: ${missingFields.join(", ")}`,
        reasons: missingFields.map(field => `Missing: ${field}`),
        probability: 0,
        predictionId: "",
        error: "validation_error"
      });
      // Scroll to error
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Call FastAPI backend
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ordered_before: formData.orderedBefore,
          weather: formData.weather,
          traffic: formData.traffic,
          latitude: mapPosition[0],
          longitude: mapPosition[1],
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();

      // Format result for display
      const title = `Estimated delay risk: ${data.predicted_delay_risk}`;
      const summary = `${formData.orderedBefore === "yes" ? "Experienced" : "New"} customer · ${formData.traffic} traffic · ${formData.weather} weather · Confidence: ${(data.confidence * 100).toFixed(1)}%`;

      setResult({
        title,
        summary,
        reasons: data.reasons,
        probability: data.failure_probability,
        predictionId: data.prediction_id,
      });

      console.log("Prediction stored with ID:", data.prediction_id);
      
      // Scroll to result to show prediction while keeping form visible
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } catch (error) {
      console.error("Prediction error:", error);
      setResult({
        title: "Prediction failed",
        summary: "Unable to connect to the prediction service. Make sure the FastAPI server is running.",
        reasons: [],
        probability: 0,
        predictionId: "",
        error: "connection_error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={formRef} className="bg-slate-950/90 border border-slate-800 rounded-[1.75rem] p-6 text-slate-100 shadow-xl shadow-black/30">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300/90">
            Prediction module
          </p>
          <h2 className="text-2xl font-semibold text-white">Delivery Prediction Input</h2>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-3xl bg-slate-700 hover:bg-slate-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition"
            >
              Clear Form
            </button>
          )}
          <div className="rounded-3xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Live
          </div>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Customer ordered before?
          </label>
          <select
            name="orderedBefore"
            value={formData.orderedBefore}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-violet-400"
          >
            <option value="">Select an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Current traffic level
          </label>
          <select
            name="traffic"
            value={formData.traffic}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-violet-400"
          >
            <option value="">Select traffic</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="heavy">Heavy</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Delivery address selected from map
          </label>
          <p className="mb-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-200">
            {mapPosition
              ? `Selected location: ${mapPosition[0].toFixed(4)}, ${mapPosition[1].toFixed(4)}`
              : "Click on the map below to choose a stop location."}
          </p>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Or type an address manually"
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Pincode
          </label>
          <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 flex items-center justify-between">
            <p className="text-slate-200">
              {pincodeLoading ? "Fetching pincode..." : formData.pincode ? formData.pincode : "Select location on map"}
            </p>
            {pincodeLoading && (
              <span className="text-xs text-violet-400 animate-pulse">Loading...</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Auto-filled when you select location on map</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Current Weather
          </label>
          <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 flex items-center justify-between">
            <p className="text-slate-200">
              {weatherLoading ? "Fetching weather..." : weatherInfo ? weatherInfo : "Select location on map"}
            </p>
            {weatherLoading && (
              <span className="text-xs text-violet-400 animate-pulse">Loading...</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Auto-detected from selected location</p>
        </div>

        <MapPicker
          position={mapPosition}
          onSelect={(lat, lng) => {
            setMapPosition([lat, lng]);
            // Only update location, weather, and pincode - preserve other form fields
            setFormData(prev => ({ 
              ...prev, 
              location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            }));
            // Fetch weather and pincode for the selected location (async, won't affect form immediately)
            fetchWeather(lat, lng);
            fetchPincode(lat, lng);
          }}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Form values will be preserved after prediction"
        >
          {loading ? "Analyzing..." : "Predict delay risk"}
        </button>
      </form>

      {result && (
        <div className={`mt-6 rounded-[1.5rem] border p-5 text-slate-100 ${
          result.error 
            ? 'border-red-500/20 bg-red-900/20' 
            : 'border-violet-500/20 bg-slate-900/80'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400">Prediction Summary</p>
              <p className="mt-3 text-xl font-semibold">{result.title}</p>
              <p className="mt-2 text-sm text-slate-400">{result.summary}</p>
            </div>
            <div className="text-xs text-slate-500 text-right">
              {mapPosition && (
                <div className="text-slate-400">
                  <p>📍 {mapPosition[0].toFixed(4)}, {mapPosition[1].toFixed(4)}</p>
                </div>
              )}
            </div>
          </div>

          {result.reasons && result.reasons.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-300 mb-2">Key Factors:</p>
              <ul className="text-sm text-slate-400 space-y-1">
                {result.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.probability !== undefined && (
            <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Failure Probability</span>
                <span className="font-semibold text-violet-300">
                  {(result.probability * 100).toFixed(1)}%
                </span>
              </div>
              {weatherInfo && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Weather Conditions</span>
                  <span className="font-semibold text-slate-200">
                    🌤️ {weatherInfo}
                  </span>
                </div>
              )}
            </div>
          )}

          {result.predictionId && (
            <div className="mt-3 text-xs text-slate-500">
              Prediction ID: {result.predictionId.slice(0, 12)}...
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-slate-600 text-xs">
            <p className="text-slate-500">💡 Tip: Your form values are preserved above. Click "Clear Form" to start over.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;