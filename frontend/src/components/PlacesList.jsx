import { MapPin, Clock, Users, Search, Filter } from "lucide-react";
import React, { useState } from "react";
const PlacesList = ({ places, onSearchPlaces, onPlaceSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchPlaces(searchQuery.trim());
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === "all") {
      onSearchPlaces("restaurant"); // Default search
    } else {
      onSearchPlaces(category);
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

  const formatTime = (time) => {
    if (time === 0) return "12 AM";
    if (time < 12) return `${time} AM`;
    if (time === 12) return "12 PM";
    return `${time - 12} PM`;
  };

  if (!places || places.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🔍 Discover Amazing Places
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Search for restaurants, malls, parks, attractions, and more!
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm font-medium mb-2">
            💡 Try searching for:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "restaurant",
              "mall",
              "park",
              "attraction",
              "cinema",
              "stadium",
            ].map((term) => (
              <span
                key={term}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs cursor-pointer hover:bg-blue-200 transition-colors"
                onClick={() => onSearchPlaces(term)}
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter places by category if selected
  const filteredPlaces =
    selectedCategory === "all"
      ? places
      : places.filter((place) => place.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="🔍 Search for restaurants, malls, parks, attractions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Search className="w-5 h-5" />
          <span className="font-medium">Search Places</span>
        </button>
      </form>

      {/* Category Filters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-semibold text-gray-800">
            Filter by Category:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "all",
            "restaurant",
            "mall",
            "garden",
            "attraction",
            "entertainment",
            "stadium",
            "palace",
          ].map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary-300"
              }`}
            >
              {category === "all"
                ? "🌟 All"
                : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Places List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredPlaces.map((place, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-gray-100 hover:border-primary-200 hover:shadow-md transform hover:-translate-y-1"
            onClick={() => onPlaceSelect && onPlaceSelect(place)}
          >
            {/* Category Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary-100 to-purple-100 rounded-xl flex items-center justify-center text-xl shadow-sm">
              {getCategoryIcon(place.category)}
            </div>

            {/* Place Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 truncate text-lg">
                  {place.name}
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                    place.category
                  )}`}
                >
                  {place.category}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatTime(place.openingTime)} -{" "}
                    {formatTime(place.closingTime)}
                  </span>
                </div>
                {place.importance && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>
                      Importance: {Math.round(place.importance * 100)}%
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-1 truncate">
                {place.address || place.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Places:</span>
          <span className="font-medium text-gray-900">
            {filteredPlaces.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Categories:</span>
          <div className="flex space-x-1">
            {Array.from(new Set(filteredPlaces.map((p) => p.category))).map(
              (category) => (
                <span
                  key={category}
                  className={`badge ${getCategoryColor(category)}`}
                >
                  {category}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacesList;
