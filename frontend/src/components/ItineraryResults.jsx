import { MapPin, Clock, Users, ArrowRight, AlertCircle } from "lucide-react";
import React from "react";
const ItineraryResults = ({ itinerary }) => {
  const formatHour = (hour) => {
    // Handle invalid or undefined hours
    if (hour === null || hour === undefined || isNaN(hour)) {
      return "12 PM"; // Default fallback
    }

    // Handle decimal hours by rounding to nearest 0.1
    const roundedHour = Math.round(hour * 10) / 10;

    // Convert to 12-hour format
    let displayHour = roundedHour;
    let period = "AM";

    if (roundedHour === 0) {
      return "12 AM";
    } else if (roundedHour < 12) {
      period = "AM";
    } else if (roundedHour === 12) {
      return "12 PM";
    } else {
      displayHour = roundedHour - 12;
      period = "PM";
    }

    // Format with proper decimal handling
    if (displayHour % 1 === 0) {
      return `${displayHour} ${period}`;
    } else {
      const minutes = Math.round((displayHour % 1) * 60);
      const hourPart = Math.floor(displayHour);
      return `${hourPart}:${minutes.toString().padStart(2, "0")} ${period}`;
    }
  };

  const getFootfallColor = (percentage) => {
    if (percentage < 30) return "text-green-600 bg-green-100";
    if (percentage < 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getFootfallLabel = (percentage) => {
    if (percentage < 30) return "Low Crowd";
    if (percentage < 60) return "Moderate";
    return "High Crowd";
  };

  return (
    <div className="space-y-6">
      {/* Itinerary Steps */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Optimized Itinerary
        </h3>

        <div className="space-y-4">
          {itinerary.itinerary.map((step, index) => (
            <div key={`itinerary-step-${step.place}-${index}`} className="relative">
              {/* Connection Line */}
              {index > 0 && (
                <div className="absolute left-6 top-0 w-0.5 h-8 bg-gray-200 transform -translate-y-4"></div>
              )}

              <div className="flex items-start space-x-4">
                {/* Step Number */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {index + 1}
                </div>

                {/* Step Content */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {step.place}
                    </h4>
                    <span
                      className={`badge ${getFootfallColor(
                        step.footfallAtArrival
                      )}`}
                    >
                      {getFootfallLabel(step.footfallAtArrival)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Arrive: {formatHour(step.arrivalTime)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Crowd: {step.footfallAtArrival}%
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Stay: {step.stayDuration}h
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Leave: {formatHour(step.leaveTime)} -{" "}
                    {step.reasonForLeaving}
                  </div>
                </div>
              </div>

              {/* Arrow to next step */}
              {index < itinerary.itinerary.length - 1 && (
                <div className="flex justify-center mt-2">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skipped Places */}
      {itinerary.skippedPlaces.length > 0 && (
        <div className="card border-yellow-200 bg-yellow-50">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">
                Places Not Visited
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                The following places couldn't be included due to timing
                constraints:
              </p>
              <div className="flex flex-wrap gap-2">
                {itinerary.skippedPlaces.map((place, index) => (
                  <span key={`skipped-${place}-${index}`} className="badge badge-warning">
                    {place}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Trip Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Places:</span>
              <span className="font-medium">
                {itinerary.summary.totalPlaces}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Places Visited:</span>
              <span className="font-medium text-green-600">
                {itinerary.summary.visitedPlaces}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Crowd Level:</span>
              <span className="font-medium">
                {itinerary.summary.averageFootfall}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Travel Time:</span>
              <span className="font-medium">
                {itinerary.summary.totalTravelTime} min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Day:</span>
              <span className="font-medium capitalize">
                {itinerary.summary.day}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Start Time:</span>
              <span className="font-medium">
                {formatHour(itinerary.summary.startHour)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-primary-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Efficiency Score:</span>
            <span className="text-lg font-bold text-gradient">
              {Math.round(
                (itinerary.summary.visitedPlaces /
                  itinerary.summary.totalPlaces) *
                  100
              )}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryResults;
