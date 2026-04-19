import React, { useState } from "react";
import MapPicker from "./MapPicker";
import PincodeInput from "./PincodeInput";

interface PredictionResult {
  title: string;
  summary: string;
  reasons: string[];
  probability: number;
  predictionId: string;
  loading?: boolean;
  error?: string;
}

const PREDICTION_API_URL =
  import.meta.env.VITE_PREDICTION_API_URL || "http://localhost:8000/predict";
const BACKEND_URL = "http://localhost:3000";

const Card: React.FC = () => {
  const [formData, setFormData] = useState({
    orderedBefore: "",
    weather: "",
    traffic: "",
    pincode: "",
  });
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [locationDetails, setLocationDetails] = useState<{ city: string; state: string } | null>(null);
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
        `${BACKEND_URL}/locations/weather?latitude=${lat}&longitude=${lng}`
      );

      const result = await response.json();
      
      if (!response.ok) {
        console.error("Weather API error response:", result);
        throw new Error(result.error || "Weather API error");
      }

      if (!result.success || !result.data) {
        throw new Error("Invalid weather response");
      }

      const data = result.data;
      const weather = data.weather; // Already mapped by backend
      const description = data.description;
      const temperature = data.temperature;

      setFormData(prev => ({ ...prev, weather }));
      setWeatherInfo(
        `${description.charAt(0).toUpperCase() + description.slice(1)} (${temperature}°C)`
      );

      console.log("Weather fetched:", weather, `(${description})`);
    } catch (error) {
      console.error("Weather fetch error:", error);
      setWeatherInfo("Unable to fetch weather");
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

  const handleLocationFound = (lat: number, lng: number, city: string, state: string, pincodeFound?: string) => {
    console.log("Location found:", { lat, lng, city, state });
    setMapPosition([lat, lng]);
    setLocationDetails({ city, state });
    if (pincodeFound) {
      setFormData(prev => ({ ...prev, pincode: pincodeFound }));
    }
    fetchWeather(lat, lng);
    if (!pincodeFound) {
      fetchPincode(lat, lng);
    }
    
    // Scroll down to show the map after animation starts
    setTimeout(() => {
      window.scrollBy({
        top: 500,
        behavior: "smooth"
      });
    }, 500);
  };

  const handleClear = () => {
    setFormData({
      orderedBefore: "",
      weather: "",
      traffic: "",
      pincode: "",
    });
    setMapPosition(null);
    setLocationDetails(null);
    setResult(null);
    setWeatherInfo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = [];
    if (!formData.orderedBefore) missingFields.push("Customer order history");
    if (!formData.traffic) missingFields.push("Traffic level");
    if (!formData.weather) missingFields.push("Weather data");

    if (missingFields.length > 0) {
      setResult({
        title: "Missing information",
        summary: `Please fill in: ${missingFields.join(", ")}`,
        reasons: missingFields.map(field => `Missing: ${field}`),
        probability: 0,
        predictionId: "",
        error: "validation_error",
      });

      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const [latitude, longitude] = mapPosition!;

      const response = await fetch(PREDICTION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ordered_before: formData.orderedBefore,
          weather: formData.weather,
          traffic: formData.traffic,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      const title = `Estimated delay risk: ${data.predicted_delay_risk}`;
      const summary = `${formData.orderedBefore === "yes" ? "Experienced" : "New"} customer | ${formData.traffic} traffic | ${formData.weather} weather | Confidence: ${(data.confidence * 100).toFixed(1)}%`;

      setResult({
        title,
        summary,
        reasons: data.reasons,
        probability: data.failure_probability,
        predictionId: data.prediction_id,
      });

      console.log("Prediction stored with ID:", data.prediction_id);

      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    } catch (error) {
      console.error("Prediction error:", error);
      setResult({
        title: "Prediction failed",
        summary:
          "Unable to connect to the prediction service. Make sure the FastAPI server is running.",
        reasons: [],
        probability: 0,
        predictionId: "",
        error: "connection_error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={formRef}
      className="rounded-[1.75rem] border border-slate-800 bg-slate-950/90 p-6 text-slate-100 shadow-xl shadow-black/30"
    >
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
              className="rounded-3xl bg-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-600"
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
          <label className="mb-2 block text-sm font-medium text-slate-300">
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
          <label className="mb-2 block text-sm font-medium text-slate-300">
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
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Search by Pincode
          </label>
          <PincodeInput
            onLocationFound={handleLocationFound}
            loading={pincodeLoading || weatherLoading}
          />
          {locationDetails && (
            <div className="mt-3 rounded-2xl border border-violet-500/20 bg-violet-900/10 px-4 py-3">
              <p className="text-sm text-violet-200">
                📍 <strong>{locationDetails.city}, {locationDetails.state}</strong>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Coordinates: {mapPosition?.[0].toFixed(4)}, {mapPosition?.[1].toFixed(4)}
              </p>
            </div>
          )}
        </div>



        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Current Weather
          </label>
          <div className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100">
            <p className="text-slate-200">
              {weatherLoading
                ? "Fetching weather..."
                : weatherInfo || "Enter a pincode to get weather"}
            </p>
            {weatherLoading && (
              <span className="animate-pulse text-xs text-violet-400">Loading...</span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">Auto-detected from selected location</p>
        </div>

        <div>
          <MapPicker
            position={mapPosition}
            onSelect={(lat, lng) => {
              setMapPosition([lat, lng]);
              fetchWeather(lat, lng);
              fetchPincode(lat, lng);
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
          title="Form values will be preserved after prediction"
        >
          {loading ? "Analyzing..." : "Predict delay risk"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-6 rounded-[1.5rem] border p-5 text-slate-100 ${
            result.error
              ? "border-red-500/20 bg-red-900/20"
              : "border-violet-500/20 bg-slate-900/80"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Prediction Summary</p>
              <p className="mt-3 text-xl font-semibold">{result.title}</p>
              <p className="mt-2 text-sm text-slate-400">{result.summary}</p>
            </div>
          </div>

          {result.reasons && result.reasons.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-300">Key Factors:</p>
              <ul className="space-y-1 text-sm text-slate-400">
                {result.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">*</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.probability !== undefined && (
            <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Failure Probability</span>
                <span className="font-semibold text-violet-300">
                  {(result.probability * 100).toFixed(1)}%
                </span>
              </div>
              {weatherInfo && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Weather Conditions</span>
                  <span className="font-semibold text-slate-200">{weatherInfo}</span>
                </div>
              )}
            </div>
          )}

          {result.predictionId && (
            <div className="mt-3 text-xs text-slate-500">
              Prediction ID: {result.predictionId.slice(0, 12)}...
            </div>
          )}

          <div className="mt-4 border-t border-slate-600 pt-4 text-xs">
            <p className="text-slate-500">
              Tip: Your form values are preserved above. Click "Clear Form" to start over.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
