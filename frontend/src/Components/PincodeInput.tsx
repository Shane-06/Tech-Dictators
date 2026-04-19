import React, { useState } from "react";

interface PincodeInputProps {
  onLocationFound: (lat: number, lng: number, city: string, state: string, pincodeFound?: string) => void;
  loading?: boolean;
}

const PincodeInput: React.FC<PincodeInputProps> = ({ onLocationFound, loading = false }) => {
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (!pincode || pincode.length < 5) {
        setError("Please enter a valid pincode (5-6 digits)");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3000/locations/pincode/${pincode}`);
      const result = await response.json();

      // Check if we have valid data regardless of status code
      if (result.success && result.data) {
        onLocationFound(
          result.data.latitude,
          result.data.longitude,
          result.data.city,
          result.data.state,
          pincode
        );
      } else if (!response.ok) {
        setError(result.error || "Pincode not found");
      }
    } catch (err) {
      setError("Failed to fetch location. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Enter Pincode
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 110001"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              maxLength={6}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading || loading}
              className="rounded-lg bg-violet-600 px-6 py-2 font-medium text-white transition hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
};

export default PincodeInput;
