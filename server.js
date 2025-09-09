const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load places data from JSON file
const fs = require("fs");
const placesData = JSON.parse(fs.readFileSync("data.json", "utf8"));

// Core itinerary planning algorithm (converted from Python)
function suggestItinerary(places, day, startHour, stayDuration = 1) {
  const itinerary = [];
  let currentHour = startHour;
  let currentPlace = null;
  const visitedPlaces = new Set();
  const skippedPlaces = [];

  while (visitedPlaces.size < places.length) {
    // Find available places at current time
    const availablePlaces = places.filter((place) => {
      const isOpen =
        place.closingTime === 0
          ? currentHour >= place.openingTime // 24-hour operation
          : place.openingTime <= currentHour && currentHour < place.closingTime;

      return isOpen && !visitedPlaces.has(place.name);
    });

    if (availablePlaces.length === 0) {
      // Add remaining places to skipped list
      places.forEach((place) => {
        if (!visitedPlaces.has(place.name)) {
          skippedPlaces.push(place.name);
        }
      });
      break;
    }

    // Choose the least busy place at current time
    const nextPlace = availablePlaces.reduce((min, place) => {
      const busyPercentage = getBusyPercentage(place, day, currentHour);
      const minBusyPercentage = getBusyPercentage(min, day, currentHour);
      return busyPercentage < minBusyPercentage ? place : min;
    });

    // Determine stay and travel details
    const footfallAtArrival = getBusyPercentage(nextPlace, day, currentHour);
    const leaveTime = Math.round((currentHour + stayDuration) * 10) / 10;
    let reasonForLeaving = "Planned stay completed";

    if (nextPlace.closingTime !== 0 && leaveTime >= nextPlace.closingTime) {
      reasonForLeaving = "Closing time reached";
    }

    itinerary.push({
      place: nextPlace.name,
      arrivalTime: currentHour,
      footfallAtArrival: footfallAtArrival,
      stayDuration: stayDuration,
      leaveTime: leaveTime,
      reasonForLeaving: reasonForLeaving,
      category: nextPlace.category || "other",
      openingTime: nextPlace.openingTime,
      closingTime: nextPlace.closingTime,
    });

    visitedPlaces.add(nextPlace.name);
    currentPlace = nextPlace;

    // Determine travel time to next destination
    const nextDestCandidates = places.filter(
      (place) =>
        !visitedPlaces.has(place.name) && currentPlace.distanceTime[place.name]
    );

    if (nextDestCandidates.length === 0) {
      // Add remaining places to skipped list
      places.forEach((place) => {
        if (!visitedPlaces.has(place.name)) {
          skippedPlaces.push(place.name);
        }
      });
      break;
    }

    // Find next destination with shortest travel time
    const nextDest = nextDestCandidates.reduce((min, place) => {
      const currentTime = currentPlace.distanceTime[place.name].time;
      const minTime = currentPlace.distanceTime[min.name].time;
      return currentTime < minTime ? place : min;
    });

    const travelTime = currentPlace.distanceTime[nextDest.name].time;

    // Convert travel time from minutes to hours and round to nearest 0.1 hour
    const travelHours = travelTime / 60;
    currentHour = Math.round((leaveTime + travelHours) * 10) / 10;
  }

  return { itinerary, skippedPlaces };
}

// Helper function to get busy percentage
function getBusyPercentage(place, day, hour) {
  const dayFootfall = place.footfall[day];
  if (!dayFootfall) return 0;

  // Round to nearest hour for footfall lookup
  const roundedHour = Math.round(hour);
  const hourStr = roundedHour.toString();
  return dayFootfall[hourStr] || 0;
}

// Simple API endpoint for itinerary generation
app.post("/api/generate-itinerary", (req, res) => {
  try {
    const {
      day,
      startHour,
      stayDuration = 1,
      selectedPlaces = [],
      nominatimPlaces = [],
    } = req.body;

    // Validate inputs
    if (!day || startHour === undefined) {
      return res.status(400).json({
        message: "Day and start hour are required",
      });
    }

    if (startHour < 0 || startHour > 23) {
      return res.status(400).json({
        message: "Start hour must be between 0 and 23",
      });
    }

    // Combine original places and Nominatim places
    let allPlaces = [...placesData];

    // Add Nominatim places if provided
    if (nominatimPlaces && nominatimPlaces.length > 0) {
      allPlaces = [...allPlaces, ...nominatimPlaces];
    }

    // Filter places if specific places are selected
    let places = allPlaces;
    if (selectedPlaces.length > 0) {
      console.log("Selected places:", selectedPlaces);
      console.log(
        "Available places:",
        allPlaces.map((p) => p.name)
      );

      places = allPlaces.filter((place) => selectedPlaces.includes(place.name));

      console.log(
        "Filtered places:",
        places.map((p) => p.name)
      );
    }

    if (places.length === 0) {
      console.log("No places found for selected places:", selectedPlaces);
      return res.status(404).json({
        message: "No places found",
      });
    }

    // Add categories and fix data structure for places
    const categories = {
      KLING: "restaurant",
      "Phoenix mall": "mall",
      "Lal bagh botanical garden": "garden",
      "Bangalore palace": "palace",
      "Chinnaswamy Stadium": "stadium",
    };

    places = places.map((place) => {
      // Handle original places (from data.json)
      if (place["O.T"] !== undefined) {
        return {
          ...place,
          openingTime: place["O.T"],
          closingTime: place["C.T"],
          distanceTime: place["distance-time"],
          category: categories[place.name] || "other",
        };
      }
      // Handle Nominatim places
      else {
        // Generate distance-time matrix for Nominatim places
        const distanceTime = {};
        places.forEach((otherPlace) => {
          if (otherPlace.name !== place.name) {
            // Simple distance calculation (you can improve this with real API)
            const distance = Math.random() * 20 + 5; // Random distance 5-25 km
            const time = distance * 3 + Math.random() * 10; // Rough time calculation
            distanceTime[otherPlace.name] = {
              distance: Math.round(distance * 10) / 10,
              time: Math.round(time),
            };
          }
        });

        return {
          ...place,
          distanceTime: distanceTime,
          category: place.category || "other",
        };
      }
    });

    // Generate itinerary
    const { itinerary, skippedPlaces } = suggestItinerary(
      places,
      day,
      startHour,
      stayDuration
    );

    // Calculate summary statistics
    const totalPlaces = places.length;
    const visitedPlaces = itinerary.length;
    const averageFootfall =
      itinerary.length > 0
        ? itinerary.reduce((sum, item) => sum + item.footfallAtArrival, 0) /
          itinerary.length
        : 0;

    const totalTravelTime =
      itinerary.length > 1
        ? itinerary.slice(1).reduce((sum, item, index) => {
            const prevPlace = places.find(
              (p) => p.name === itinerary[index].place
            );
            const currentPlace = places.find((p) => p.name === item.place);
            if (
              prevPlace &&
              currentPlace &&
              prevPlace.distanceTime[currentPlace.name]
            ) {
              return sum + prevPlace.distanceTime[currentPlace.name].time;
            }
            return sum;
          }, 0)
        : 0;

    res.json({
      itinerary,
      skippedPlaces,
      summary: {
        totalPlaces,
        visitedPlaces,
        skippedPlaces: skippedPlaces.length,
        averageFootfall: Math.round(averageFootfall * 100) / 100,
        totalTravelTime: Math.round(totalTravelTime),
        day,
        startHour,
        stayDuration,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all places for frontend
app.get("/api/places", (req, res) => {
  try {
    const categories = {
      KLING: "restaurant",
      "Phoenix mall": "mall",
      "Lal bagh botanical garden": "garden",
      "Bangalore palace": "palace",
      "Chinnaswamy Stadium": "stadium",
    };

    const places = placesData.map((place) => ({
      name: place.name,
      openingTime: place["O.T"],
      closingTime: place["C.T"],
      distanceTime: place["distance-time"],
      category: categories[place.name] || "other",
      description: `Visit ${place.name} for a great experience.`,
    }));
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get places from Nominatim API
app.get("/api/nominatim-places", async (req, res) => {
  try {
    const { query, city = "Bangalore", limit = 50 } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Search for places in Bangalore using Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query + " " + city
      )}&format=json&limit=${limit}&addressdetails=1&extratags=1`
    );

    const data = await response.json();

    // Transform data to match your app's format
    const transformedPlaces = data.map((place) => ({
      name: place.display_name.split(",")[0], // Get the main name
      coordinates: {
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
      },
      address: place.display_name,
      category: getCategoryFromType(place.type, place.class),
      place_id: place.place_id,
      importance: place.importance,
      openingTime: getDefaultOpeningTime(place.type),
      closingTime: getDefaultClosingTime(place.type),
      footfall: generateDefaultFootfall(place.type),
      distanceTime: {}, // Will be calculated later
      description: `Visit ${
        place.display_name.split(",")[0]
      } for a great experience.`,
    }));

    res.json(transformedPlaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to categorize places
function getCategoryFromType(type, classType) {
  const categoryMap = {
    restaurant: "restaurant",
    cafe: "restaurant",
    fast_food: "restaurant",
    food: "restaurant",
    mall: "mall",
    shopping: "mall",
    market: "mall",
    shop: "mall",
    tourist_attraction: "attraction",
    monument: "attraction",
    palace: "palace",
    park: "garden",
    garden: "garden",
    stadium: "stadium",
    cinema: "entertainment",
    theater: "entertainment",
    museum: "attraction",
  };

  return categoryMap[type] || categoryMap[classType] || "other";
}

// Helper function to get default opening time based on place type
function getDefaultOpeningTime(type) {
  const openingTimes = {
    restaurant: 8,
    cafe: 7,
    fast_food: 10,
    mall: 10,
    shopping: 9,
    market: 6,
    park: 5,
    garden: 5,
    stadium: 6,
    cinema: 10,
    theater: 10,
    museum: 9,
    tourist_attraction: 9,
  };

  return openingTimes[type] || 9;
}

// Helper function to get default closing time based on place type
function getDefaultClosingTime(type) {
  const closingTimes = {
    restaurant: 23,
    cafe: 22,
    fast_food: 24,
    mall: 22,
    shopping: 21,
    market: 20,
    park: 19,
    garden: 19,
    stadium: 22,
    cinema: 24,
    theater: 23,
    museum: 17,
    tourist_attraction: 18,
  };

  return closingTimes[type] || 21;
}

// Helper function to generate default footfall data
function generateDefaultFootfall(type) {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const footfall = {};

  // Base footfall patterns by type
  const basePatterns = {
    restaurant: { peak: [12, 13, 19, 20, 21], base: 30 },
    cafe: { peak: [8, 9, 15, 16, 17], base: 25 },
    mall: { peak: [14, 15, 16, 17, 18, 19, 20], base: 40 },
    park: { peak: [6, 7, 8, 17, 18, 19], base: 20 },
    stadium: { peak: [18, 19, 20, 21], base: 15 },
    cinema: { peak: [14, 15, 16, 19, 20, 21, 22], base: 35 },
    museum: { peak: [10, 11, 12, 14, 15, 16], base: 25 },
  };

  const pattern = basePatterns[type] || { peak: [12, 13, 19, 20], base: 30 };

  days.forEach((day) => {
    footfall[day] = {};
    for (let hour = 0; hour < 24; hour++) {
      let footfallLevel = pattern.base;

      // Add peak time boost
      if (pattern.peak.includes(hour)) {
        footfallLevel += 40;
      }

      // Weekend boost
      if (day === "saturday" || day === "sunday") {
        footfallLevel *= 1.3;
      }

      // Add some randomness
      footfallLevel += Math.random() * 20 - 10;

      // Ensure it's within 0-100 range
      footfallLevel = Math.max(0, Math.min(100, Math.round(footfallLevel)));

      footfall[day][hour.toString()] = footfallLevel;
    }
  });

  return footfall;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Smart Itinerary Planner API is running" });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
