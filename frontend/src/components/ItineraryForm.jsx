import React, { useState } from "react";
import { Calendar, Clock, MapPin, Users, Send } from "lucide-react";

const ItineraryForm = ({ onSubmit, loading, availablePlaces = [] }) => {
  const [formData, setFormData] = useState({
    day: "saturday",
    startHour: 12,
    stayDuration: 1,
    selectedPlaces: [],
  });

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

  const formatHour = (hour) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Day Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Select Day
        </label>
        <select
          value={formData.day}
          onChange={(e) => handleInputChange("day", e.target.value)}
          className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
          className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
          className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
        >
          {[0.5, 1, 1.5, 2, 2.5, 3].map((duration) => (
            <option key={duration} value={duration}>
              {duration} hour{duration !== 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Place Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Select Places for Your Itinerary
        </label>
        <div className="text-sm text-gray-500 mb-2">
          Search for places above, then select them here to generate your
          itinerary
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {availablePlaces.length > 0 ? (
            availablePlaces.slice(0, 20).map((place, index) => (
              <label
                key={`form-${place.name || place.place_id}-${index}-${place.place_id || 'local'}`}
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.selectedPlaces.includes(place.name)}
                  onChange={(e) => {
                    let newSelectedPlaces;
                    if (e.target.checked) {
                      newSelectedPlaces = [
                        ...formData.selectedPlaces,
                        place.name,
                      ];
                    } else {
                      newSelectedPlaces = formData.selectedPlaces.filter(
                        (p) => p !== place.name
                      );
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
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate">
                    {place.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                      place.category
                    )}`}
                  >
                    {place.category}
                  </span>
                </div>
              </label>
            ))
          ) : (
            <div className="text-sm text-gray-500 italic text-center py-4">
              🔍 Search for places above to see options here
            </div>
          )}
        </div>

        {/* Selected Places Summary */}
        {formData.selectedPlaces.length > 0 && (
          <div className="mt-3 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl border border-primary-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-primary-800">
                ✨ Selected Places ({formData.selectedPlaces.length}):
              </div>
              <div className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                Auto-updates on changes
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.selectedPlaces.map((placeName, index) => (
                <span
                  key={`form-selected-${placeName}-${index}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white text-primary-800 border border-primary-200 shadow-sm"
                >
                  {placeName}
                  <button
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
                    className="ml-2 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-xs font-bold">💡</span>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Pro Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Start early to visit more places</li>
              <li>• Choose shorter stay durations for efficiency</li>
              <li>• Our AI optimizes for least crowded times</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ItineraryForm;
