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
import ItineraryResults from "./components/ItineraryResults";
import StatsCard from "./components/StatsCard";
import Sidebar from "./components/Sidebar";
import FirebaseTroubleshooting from "./components/FirebaseTroubleshooting";
import { suggestItinerary, searchNominatimPlaces, loadPlacesFromFirebase, searchPlacesInFirebase } from "./services/dataService";

function App() {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState(null);
  const [firebaseBlocked, setFirebaseBlocked] = useState(false);

  useEffect(() => {
    // Load initial places data
    loadInitialPlaces();
  }, []);

  const loadInitialPlaces = async () => {
    try {
      setError(null);
      setFirebaseBlocked(false);
      
      // Load places from Firebase
      const firebasePlaces = await loadPlacesFromFirebase();
      setPlaces(firebasePlaces);
      console.log("Loaded initial places from Firebase:", firebasePlaces.length);
    } catch (error) {
      console.error("Error loading initial places:", error);
      
      // Check if it's a Firebase blocking error
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || 
          error.message.includes('FIREBASE_BLOCKED')) {
        setFirebaseBlocked(true);
        setError("Firebase connection blocked by browser extension. Please disable ad blockers for this site or use incognito mode.");
      } else {
        setError("Failed to load places data from Firebase");
      }
    }
  };

  const retryFirebaseConnection = () => {
    loadInitialPlaces();
  };

  const fetchNominatimPlaces = async (query) => {
    try {
      console.log("Searching for places:", query);
      const searchResults = await searchNominatimPlaces(query, "Bangalore", 50);
      console.log("Found places:", searchResults.length);
      
      // Merge with existing places, avoiding duplicates
      const existingNames = new Set(places.map(p => p.name));
      const newPlaces = searchResults.filter(p => !existingNames.has(p.name));
      
      setPlaces(prevPlaces => [...prevPlaces, ...newPlaces]);
    } catch (err) {
      console.error("Error fetching nominatim places:", err);
      setError(`Failed to fetch places: ${err.message}`);
    }
  };

  const handlePlaceSelect = (place) => {
    // This will be handled by the Sidebar component
    console.log("Place selected:", place);
  };

  const generateItinerary = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Generating itinerary with data:", formData);
      
      // Get selected places from the form data
      const selectedPlaceNames = formData.selectedPlaces || [];
      
      if (selectedPlaceNames.length === 0) {
        throw new Error("Please select at least one place");
      }

      // Find the actual place objects for selected places
      const selectedPlaces = places.filter(place => 
        selectedPlaceNames.includes(place.name)
      );

      console.log("Selected places for itinerary:", selectedPlaces.map(p => p.name));

      if (selectedPlaces.length === 0) {
        throw new Error("No valid places found for selected items");
      }

      // Generate itinerary using client-side algorithm
      const result = suggestItinerary(
        selectedPlaces,
        formData.day,
        formData.startHour,
        formData.stayDuration
      );

      // Calculate summary statistics
      const totalPlaces = selectedPlaces.length;
      const visitedPlaces = result.itinerary.length;
      const averageFootfall = result.itinerary.length > 0 
        ? Math.round(result.itinerary.reduce((sum, item) => sum + item.footfallAtArrival, 0) / result.itinerary.length)
        : 0;
      
      // Calculate total travel time (simplified)
      const totalTravelTime = result.itinerary.length > 1 
        ? (result.itinerary.length - 1) * 30 // Assume 30 minutes between places
        : 0;

      const itineraryWithSummary = {
        ...result,
        summary: {
          totalPlaces,
          visitedPlaces,
          averageFootfall,
          totalTravelTime,
          startHour: formData.startHour,
          day: formData.day,
          efficiencyScore: Math.round((visitedPlaces / totalPlaces) * 100)
        }
      };

      console.log("Generated itinerary:", itineraryWithSummary);
      setItinerary(itineraryWithSummary);
    } catch (err) {
      console.error("Error generating itinerary:", err);
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
      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-white border-r border-gray-200 lg:h-screen">
          <Sidebar
                onSubmit={generateItinerary}
                loading={loading}
                availablePlaces={places}
                onSearchPlaces={fetchNominatimPlaces}
                onPlaceSelect={handlePlaceSelect}
              />
          </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
            {error && (
              <>
                {firebaseBlocked ? (
                  <FirebaseTroubleshooting onRetry={retryFirebaseConnection} />
                ) : (
                  <div className="card border-red-200 bg-red-50">
                    <div className="flex items-center space-x-2 text-red-800">
                      <span className="text-sm font-medium">Error:</span>
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}
              </>
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
                    value={`${itinerary.summary.efficiencyScore}%`}
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
                    Use the sidebar to search for places, select your favorites, and watch
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
                          Use the sidebar to search for places (restaurant, mall, park...)
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 text-sm font-bold">
                            2
                          </span>
                        </div>
                        <span className="text-gray-700">
                          Select your favorite places in the sidebar
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
    </div>
  );
}

export default App;