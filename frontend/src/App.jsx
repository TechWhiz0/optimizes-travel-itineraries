import React, { useState, useEffect } from "react";

import {
  MapPin,
  Clock,
  Users,
  Route,
  Calendar,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import ItineraryForm from "./components/ItineraryForm";
import ItineraryResults from "./components/ItineraryResults";
import PlacesList from "./components/PlacesList";
import StatsCard from "./components/StatsCard";

function App() {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState(null);
  // Get API URL with fallback
  const apiUrl = "https://optimizes-travel-itineraries.onrender.com";
  console.log("API URL:", apiUrl);

  useEffect(() => {
    // Test backend health on app start
    testBackendHealth();
  }, []);

  const testBackendHealth = async () => {
    try {
      console.log("Testing backend health...");
      const response = await fetch(`${apiUrl}/api/health`);

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Get the response text first to see what we're actually getting
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText);
        console.log("Backend health check:", data);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        console.error("Response was:", responseText.substring(0, 500));
        setError(
          `Backend returned invalid JSON: ${responseText.substring(0, 100)}...`
        );
      }
    } catch (err) {
      console.error("Backend health check failed:", err);
      setError(
        "Backend server is not responding. Please check if the server is running."
      );
    }
  };

  const fetchPlaces = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/places`);
      const data = await response.json();
      console.log(data, "data from places");
      setPlaces(data);
    } catch (err) {
      console.error("Error fetching places:", err);
    }
  };

  const fetchNominatimPlaces = async (query) => {
    try {
      console.log(
        "Fetching from URL:",
        `${apiUrl}/api/nominatim-places?query=${query}&city=Bangalore&limit=100`
      );
      const response = await fetch(
        `${apiUrl}/api/nominatim-places?query=${query}&city=Bangalore&limit=100`
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        // Try to get the response text to see what error we're getting
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `HTTP error! status: ${
            response.status
          }, message: ${errorText.substring(0, 200)}`
        );
      }

      const data = await response.json();
      console.log(data, "data from nominatim places");
      setPlaces(data);
    } catch (err) {
      console.error("Error fetching nominatim places:", err);
      setError(`Failed to fetch places: ${err.message}`);
    }
  };

  const handlePlaceSelect = (place) => {
    // This will be handled by the ItineraryForm component
    console.log("Place selected:", place);
  };

  const generateItinerary = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Include Nominatim places in the request
      const requestData = {
        ...formData,
        nominatimPlaces: places.filter(
          (place) => place.place_id || place.coordinates // Nominatim places have these properties
        ),
      };

      const response = await fetch(`${apiUrl}/api/generate-itinerary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log(data, "data from itinerary");

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate itinerary");
      }

      setItinerary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg">
                <Route className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  Smart Itinerary Planner
                </h1>
                <p className="text-sm text-gray-500">
                  Optimize your route with AI-powered footfall analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form and Places */}
          <div className="lg:col-span-1 space-y-6">
            {/* Itinerary Form */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Plan Your Trip
                </h2>
              </div>
              <ItineraryForm
                onSubmit={generateItinerary}
                loading={loading}
                availablePlaces={places}
              />
            </div>

            {/* Available Places */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Available Places
                </h2>
              </div>
              <PlacesList
                places={places}
                onSearchPlaces={fetchNominatimPlaces}
                onPlaceSelect={handlePlaceSelect}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="card border-red-200 bg-red-50">
                <div className="flex items-center space-x-2 text-red-800">
                  <span className="text-sm font-medium">Error:</span>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="card">
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="text-gray-600">
                      Generating your optimal itinerary...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {itinerary && !loading && (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatsCard
                    title="Places Visited"
                    value={itinerary.summary.visitedPlaces}
                    icon={MapPin}
                    color="blue"
                  />
                  <StatsCard
                    title="Avg. Footfall"
                    value={`${itinerary.summary.averageFootfall}%`}
                    icon={Users}
                    color="green"
                  />
                  <StatsCard
                    title="Total Travel Time"
                    value={`${itinerary.summary.totalTravelTime} min`}
                    icon={Clock}
                    color="purple"
                  />
                  <StatsCard
                    title="Efficiency Score"
                    value={`${Math.round(
                      (itinerary.summary.visitedPlaces /
                        itinerary.summary.totalPlaces) *
                        100
                    )}%`}
                    icon={TrendingUp}
                    color="orange"
                  />
                </div>

                {/* Itinerary Results */}
                <ItineraryResults itinerary={itinerary} />
              </>
            )}

            {/* Welcome Message */}
            {!itinerary && !loading && (
              <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Route className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    🚀 Start Your Smart Journey
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                    Search for places above, select your favorites, and watch
                    our AI create the perfect itinerary for you!
                  </p>

                  {/* Quick Start Guide */}
                  <div className="bg-white rounded-xl p-6 shadow-sm max-w-md mx-auto">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Quick Start:
                    </h4>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 text-sm font-bold">
                            1
                          </span>
                        </div>
                        <span className="text-gray-700">
                          Search for places (restaurant, mall, park...)
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 text-sm font-bold">
                            2
                          </span>
                        </div>
                        <span className="text-gray-700">
                          Select your favorite places
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 text-sm font-bold">
                            3
                          </span>
                        </div>
                        <span className="text-gray-700">
                          Get your optimized itinerary!
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mt-8">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Smart AI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Crowd Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Time Optimized</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Smart Itinerary Planner - Optimize your travel experience with
              AI-powered route planning
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
