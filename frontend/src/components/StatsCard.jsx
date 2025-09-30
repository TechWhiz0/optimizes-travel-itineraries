import React from "react";
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-600";
      case "green":
        return "bg-green-50 border-green-200 text-green-600";
      case "purple":
        return "bg-purple-50 border-purple-200 text-purple-600";
      case "orange":
        return "bg-orange-50 border-orange-200 text-orange-600";
      case "red":
        return "bg-red-50 border-red-200 text-red-600";
      default:
        return "bg-gray-50 border-gray-200 text-gray-600";
    }
  };

  return (
    <div className="card border-2 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(
            color
          )}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
