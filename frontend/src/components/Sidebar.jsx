import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Search, 
  Filter,
  Send,
  X,
  Check
} from "lucide-react";
import { searchPlacesInFirebase } from "../services/dataService";

const Sidebar = ({ 
  onSubmit, 
  loading, 
  availablePlaces = [], 
  onSearchPlaces,
  onPlaceSelect 
}) => {
  const [formData, setFormData] = useState({
    day: "saturday",
    startHour: 12,
    stayDuration: 1,
    selectedPlaces: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const days = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);

    // Auto-generate itinerary if places are selected and we're changing timing parameters
    if (
      formData.selectedPlaces.length > 0 &&
      (field === "day" || field === "startHour" || field === "stayDuration")
    ) {
      onSubmit(newFormData);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchLoading(true);
      setHasSearched(true);
      try {
        // First try Firebase search
        const firebaseResults = await searchPlacesInFirebase(searchQuery.trim(), selectedCategory);
        if (firebaseResults.length > 0) {
          // Update places with Firebase results
          onSearchPlaces(searchQuery.trim());
        } else {
          // Fallback to Nominatim search
          await onSearchPlaces(searchQuery.trim());
        }
      } catch (error) {
        console.error("Search error:", error);
        // Fallback to Nominatim search
        await onSearchPlaces(searchQuery.trim());
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    setHasSearched(true);
    setSearchLoading(true);
    try {
      // Search Firebase for the category
      const firebaseResults = await searchPlacesInFirebase("", category);
      if (firebaseResults.length > 0) {
        // Update places with Firebase results
        if (category === "all") {
          await onSearchPlaces("restaurant"); // Default search
        } else {
          await onSearchPlaces(category);
        }
      } else {
        // Fallback to Nominatim search
        if (category === "all") {
          await onSearchPlaces("restaurant"); // Default search
        } else {
          await onSearchPlaces(category);
        }
      }
    } catch (error) {
      console.error("Category filter error:", error);
      // Fallback to Nominatim search
      if (category === "all") {
        await onSearchPlaces("restaurant");
      } else {
        await onSearchPlaces(category);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const formatHour = (hour) => {
    // Handle invalid or undefined hours
    if (hour === null || hour === undefined || isNaN(hour)) {
      return "12 PM"; // Default fallback
    }
    
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "mall":
        return "bg-purple-100 text-purple-800";
      case "garden":
        return "bg-green-100 text-green-800";
      case "palace":
        return "bg-yellow-100 text-yellow-800";
      case "stadium":
        return "bg-blue-100 text-blue-800";
      case "restaurant":
        return "bg-red-100 text-red-800";
      case "attraction":
        return "bg-orange-100 text-orange-800";
      case "entertainment":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "mall":
        return "🛍️";
      case "garden":
        return "🌿";
      case "palace":
        return "🏛️";
      case "stadium":
        return "🏟️";
      case "restaurant":
        return "🍽️";
      case "attraction":
        return "🎯";
      case "entertainment":
        return "🎬";
      default:
        return "📍";
    }
  };

  const formatTime = (time) => {
    // Handle invalid or undefined times
    if (time === null || time === undefined || isNaN(time)) {
      return "12 PM"; // Default fallback
    }
    
    if (time === 0) return "12 AM";
    if (time < 12) return `${time} AM`;
    if (time === 12) return "12 PM";
    return `${time - 12} PM`;
  };

  // Filter places by category if selected
  const filteredPlaces =
    selectedCategory === "all"
      ? availablePlaces
      : availablePlaces.filter((place) => place.category === selectedCategory);

  return (
    <div className="h-auto lg:h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 lg:mb-2">
          🗺️ Plan Your Trip
        </h2>
        <p className="text-xs lg:text-sm text-gray-600">
          Configure your itinerary settings and select places to visit
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Trip Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Trip Settings
            </h3>

            {/* Day Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Day
              </label>
              <select
                value={formData.day}
                onChange={(e) => handleInputChange("day", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time
              </label>
              <select
                value={formData.startHour}
                onChange={(e) =>
                  handleInputChange("startHour", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {formatHour(i)}
                  </option>
                ))}
              </select>
            </div>

            {/* Stay Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Stay Duration (hours)
              </label>
              <select
                value={formData.stayDuration}
                onChange={(e) =>
                  handleInputChange("stayDuration", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                {[0.5, 1, 1.5, 2, 2.5, 3].map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} hour{duration !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Place Search */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Search className="w-5 h-5 mr-2 text-primary-600" />
              Find Places
            </h3>

            {/* Search Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search restaurants, malls, parks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch(e);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={searchLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {/* Category Filters */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-800">
                  Quick Categories:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  "all",
                  "restaurant",
                  "mall",
                  "garden",
                  "attraction",
                  "entertainment",
                  "hotel",
                  "temple",
                  "market",
                  "cafe",
                  "shopping",
                  "museum",
                ].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryFilter(category)}
                    disabled={searchLoading}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {searchLoading && selectedCategory === category ? (
                      <div className="flex items-center space-x-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      category === "all" ? "🌟 All" : category
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Place Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-600" />
              Select Places ({formData.selectedPlaces.length})
            </h3>

            {/* Places List */}
            <div className="space-y-2 max-h-48 lg:max-h-64 overflow-y-auto">
              {searchLoading ? (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <p className="text-gray-500 text-sm">Searching places...</p>
                  </div>
                </div>
              ) : filteredPlaces.length === 0 && hasSearched ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    No places found. Try a different search.
                  </p>
                </div>
              ) : filteredPlaces.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    Search for places to see options here.
                  </p>
                </div>
              ) : (
                filteredPlaces.slice(0, 15).map((place, index) => (
                  <div
                    key={`${place.name || place.place_id}-${index}-${place.place_id || 'local'}`}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-primary-100 to-purple-100 rounded flex items-center justify-center text-xs">
                      {getCategoryIcon(place.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs lg:text-sm font-medium text-gray-900 truncate">
                          {place.name}
                        </h4>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-xs ${getCategoryColor(
                            place.category
                          )}`}
                        >
                          {place.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatTime(place.openingTime)} - {formatTime(place.closingTime)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        let newSelectedPlaces;
                        if (formData.selectedPlaces.includes(place.name)) {
                          newSelectedPlaces = formData.selectedPlaces.filter(
                            (p) => p !== place.name
                          );
                        } else {
                          newSelectedPlaces = [
                            ...formData.selectedPlaces,
                            place.name,
                          ];
                        }
                        handleInputChange("selectedPlaces", newSelectedPlaces);

                        // Auto-generate itinerary if places are selected
                        if (newSelectedPlaces.length > 0) {
                          const updatedFormData = {
                            ...formData,
                            selectedPlaces: newSelectedPlaces,
                          };
                          setFormData(updatedFormData);
                          onSubmit(updatedFormData);
                        }
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                        formData.selectedPlaces.includes(place.name)
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                      }`}
                    >
                      {formData.selectedPlaces.includes(place.name) ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Selected Places Summary */}
            {formData.selectedPlaces.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
                <div className="text-sm font-medium text-primary-800 mb-2">
                  ✨ Selected Places:
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.selectedPlaces.map((placeName, index) => (
                    <span
                      key={`selected-${placeName}-${index}`}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white text-primary-800 border border-primary-200"
                    >
                      {placeName}
                      <button
                        type="button"
                        onClick={() => {
                          const newSelectedPlaces = formData.selectedPlaces.filter(
                            (p) => p !== placeName
                          );
                          handleInputChange("selectedPlaces", newSelectedPlaces);

                          // Auto-generate itinerary with updated places
                          if (newSelectedPlaces.length > 0) {
                            const updatedFormData = {
                              ...formData,
                              selectedPlaces: newSelectedPlaces,
                            };
                            setFormData(updatedFormData);
                            onSubmit(updatedFormData);
                          }
                        }}
                        className="ml-1 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Generate Button */}
        <div className="p-4 lg:p-6 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            type="submit"
            disabled={loading || formData.selectedPlaces.length === 0}
            className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-2 lg:py-3 px-4 rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm lg:text-base"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Generate Itinerary</span>
              </>
            )}
          </button>
          
          {formData.selectedPlaces.length === 0 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Select at least one place to generate itinerary
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Sidebar;
