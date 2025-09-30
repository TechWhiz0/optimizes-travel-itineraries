// Client-side data service for places and itinerary generation
import { placesService, initializeDefaultData } from './firebaseService';

// Transform the data.json format to our app format
function transformPlacesData(rawData) {
  return rawData.map(place => ({
    name: place.name,
    openingTime: place["O.T"] || 9,
    closingTime: place["C.T"] || 21,
    category: getCategoryFromName(place.name),
    footfall: place.footfall,
    distanceTime: place.distanceTime || {},
    description: `Visit ${place.name} for a great experience.`,
    coordinates: place.coordinates || { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore
  }));
}

// Helper function to categorize places based on name
function getCategoryFromName(name) {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('mall') || nameLower.includes('shopping')) return 'mall';
  if (nameLower.includes('park') || nameLower.includes('garden')) return 'garden';
  if (nameLower.includes('palace') || nameLower.includes('fort')) return 'palace';
  if (nameLower.includes('stadium') || nameLower.includes('sports')) return 'stadium';
  if (nameLower.includes('restaurant') || nameLower.includes('cafe') || nameLower.includes('food')) return 'restaurant';
  if (nameLower.includes('cinema') || nameLower.includes('theater') || nameLower.includes('entertainment')) return 'entertainment';
  if (nameLower.includes('hotel') || nameLower.includes('resort')) return 'hotel';
  if (nameLower.includes('temple') || nameLower.includes('church') || nameLower.includes('mosque')) return 'temple';
  if (nameLower.includes('market') || nameLower.includes('bazaar')) return 'market';
  if (nameLower.includes('museum') || nameLower.includes('gallery')) return 'museum';
  
  return 'attraction';
}

// Get busy percentage for a place at a specific day and hour
function getBusyPercentage(place, day, hour) {
  const dayFootfall = place.footfall[day];
  if (!dayFootfall) return 50; // Default if no data
  
  // Find the closest hour in the data
  const availableHours = Object.keys(dayFootfall).map(Number).sort((a, b) => a - b);
  let closestHour = availableHours[0];
  
  for (const availableHour of availableHours) {
    if (availableHour <= hour) {
      closestHour = availableHour;
    } else {
      break;
    }
  }
  
  return dayFootfall[closestHour.toString()] || 50;
}

// Core itinerary planning algorithm (moved from server)
function suggestItinerary(places, day, startHour, stayDuration = 1) {
  console.log("=== STARTING ITINERARY GENERATION ===");
  console.log("Places to process:", places.length);
  console.log("Places:", places.map(p => ({ name: p.name, openingTime: p.openingTime, closingTime: p.closingTime })));
  console.log("Day:", day, "Start hour:", startHour, "Stay duration:", stayDuration);
  
  const itinerary = [];
  let currentHour = startHour;
  let currentPlace = null;
  const visitedPlaces = new Set();
  const skippedPlaces = [];

  while (visitedPlaces.size < places.length) {
    console.log(`\n--- ITERATION ${visitedPlaces.size + 1} ---`);
    console.log("Current hour:", currentHour);
    console.log("Visited places:", Array.from(visitedPlaces));
    console.log("Remaining places:", places.length - visitedPlaces.size);
    
    // Find available places at current time (be more flexible with hours)
    const availablePlaces = places.filter((place) => {
      // If place is already visited, skip it
      if (visitedPlaces.has(place.name)) {
        return false;
      }

      // For places without proper opening hours (Nominatim places), assume they're open
      if (!place.openingTime || !place.closingTime) {
        console.log(`Place ${place.name} has no opening hours - assuming open`);
        return true;
      }

      // Be more flexible with opening hours - allow places that are close to opening
      const isCurrentlyOpen =
        place.closingTime === 0
          ? currentHour >= place.openingTime // 24-hour operation
          : place.openingTime <= currentHour && currentHour < place.closingTime;

      // Also allow places that open within the next 2 hours (more flexible)
      const opensSoon = place.openingTime > currentHour && place.openingTime <= currentHour + 2;

      const isAvailable = isCurrentlyOpen || opensSoon;

      console.log(`Place ${place.name}: opening=${place.openingTime}, closing=${place.closingTime}, current=${currentHour}, isOpen=${isCurrentlyOpen}, opensSoon=${opensSoon}, available=${isAvailable}`);
      return isAvailable;
    });
    
    console.log("Available places:", availablePlaces.map(p => p.name));

    if (availablePlaces.length === 0) {
      console.log("No places available at current time, checking unvisited places...");
      const unvisitedPlaces = places.filter((place) => !visitedPlaces.has(place.name));
      console.log("Unvisited places:", unvisitedPlaces.map(p => p.name));
      
      if (unvisitedPlaces.length === 0) {
        console.log("All places visited, breaking loop");
        break; // All places visited
      }

      // For places without opening hours, just add them to itinerary
      const placesWithoutHours = unvisitedPlaces.filter(place => !place.openingTime || !place.closingTime);
      console.log("Places without hours:", placesWithoutHours.map(p => p.name));
      if (placesWithoutHours.length > 0) {
        console.log("Found places without hours, continuing...");
        // Just continue with the first place without hours
        continue;
      }

      // If we have places that are closed, try to include them anyway by adjusting time
      console.log("No places open, but trying to include closed places by adjusting time...");
      
      // Find the place that opens earliest from current time
      const nextAvailablePlace = unvisitedPlaces.reduce((earliest, place) => {
        const earliestOpening = earliest.openingTime || 0;
        const currentOpening = place.openingTime || 0;
        
        // If current place opens earlier today or tomorrow
        if (currentOpening > currentHour) {
          if (earliestOpening <= currentHour || currentOpening < earliestOpening) {
            return place;
          }
        }
        return earliest;
      });

      // Skip to the opening time of the next available place
      if (nextAvailablePlace.openingTime && nextAvailablePlace.openingTime > currentHour) {
        console.log(`Skipping time to ${nextAvailablePlace.openingTime} for ${nextAvailablePlace.name}`);
        currentHour = nextAvailablePlace.openingTime;
        continue;
      } else {
        // If we can't find any place that opens later, just add the first unvisited place anyway
        console.log("No future opening times, adding first unvisited place anyway");
        const firstUnvisited = unvisitedPlaces[0];
        console.log(`Adding ${firstUnvisited.name} despite timing constraints`);
        
        // Add this place to available places so it gets processed
        availablePlaces.push(firstUnvisited);
      }
    }

    // Choose the least busy place at current time
    const nextPlace = availablePlaces.reduce((min, place) => {
      const busyPercentage = getBusyPercentage(place, day, currentHour);
      const minBusyPercentage = getBusyPercentage(min, day, currentHour);
      console.log(`Place ${place.name}: busy=${busyPercentage}%, Place ${min.name}: busy=${minBusyPercentage}%`);
      return busyPercentage < minBusyPercentage ? place : min;
    });
    
    console.log(`Selected place: ${nextPlace.name} (least busy)`);

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
    
    console.log(`Added ${nextPlace.name} to itinerary. Total visited: ${visitedPlaces.size}/${places.length}`);

    // Determine travel time to next destination
    const nextDestCandidates = places.filter(
      (place) => !visitedPlaces.has(place.name)
    );
    
    console.log("Next destination candidates:", nextDestCandidates.map(p => p.name));

    if (nextDestCandidates.length === 0) {
      console.log("No more destinations, all places visited");
      break; // All places visited
    }

    // Find next destination with shortest travel time (or use default if no distance data)
    const nextDest = nextDestCandidates.reduce((min, place) => {
      const currentTime = currentPlace.distanceTime && currentPlace.distanceTime[place.name] 
        ? currentPlace.distanceTime[place.name].time 
        : 30; // Default 30 minutes if no distance data
      const minTime = currentPlace.distanceTime && currentPlace.distanceTime[min.name]
        ? currentPlace.distanceTime[min.name].time
        : 30; // Default 30 minutes if no distance data
      return currentTime < minTime ? place : min;
    });

    const travelTime = currentPlace.distanceTime && currentPlace.distanceTime[nextDest.name]
      ? currentPlace.distanceTime[nextDest.name].time
      : 30; // Default 30 minutes if no distance data

    console.log(`Travel time to ${nextDest.name}: ${travelTime} minutes`);

    // Convert travel time from minutes to hours and round to nearest 0.1 hour
    const travelHours = travelTime / 60;
    currentHour = Math.round((leaveTime + travelHours) * 10) / 10;
    
    console.log(`Updated current hour to: ${currentHour} (leave time: ${leaveTime} + travel: ${travelHours})`);
  }

  // Final check: if we have unvisited places, add them to the itinerary anyway
  const finalUnvisitedPlaces = places.filter((place) => !visitedPlaces.has(place.name));
  if (finalUnvisitedPlaces.length > 0) {
    console.log("Adding remaining unvisited places to itinerary:", finalUnvisitedPlaces.map(p => p.name));
    
    finalUnvisitedPlaces.forEach((place, index) => {
      // Add them with a slight time offset to avoid conflicts
      const adjustedTime = currentHour + (index * 0.5); // 30 minutes apart
      
      itinerary.push({
        place: place.name,
        arrivalTime: adjustedTime,
        footfallAtArrival: getBusyPercentage(place, day, adjustedTime),
        stayDuration: stayDuration,
        leaveTime: Math.round((adjustedTime + stayDuration) * 10) / 10,
        reasonForLeaving: "Included to complete itinerary",
        category: place.category || "other",
        openingTime: place.openingTime,
        closingTime: place.closingTime,
      });
    });
  }

  console.log("\n=== FINAL RESULTS ===");
  console.log("Itinerary length:", itinerary.length);
  console.log("Skipped places:", skippedPlaces.length);
  console.log("Itinerary:", itinerary.map(i => i.place));
  
  return { itinerary, skippedPlaces };
}

// Search for places using Nominatim API (client-side)
async function searchNominatimPlaces(query, city = "Bangalore", limit = 50) {
  try {
    const searchQueries = [
      `${query} ${city}`,
      `${query} in ${city}`,
      `${query} near ${city}`,
      `${query} ${city} India`
    ];

    let allResults = [];

    // Try multiple search queries to get more results
    for (const searchQuery of searchQueries) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchQuery
          )}&format=json&limit=${Math.ceil(limit / searchQueries.length)}&addressdetails=1&extratags=1&countrycodes=in`,
          {
            headers: {
              "User-Agent": "SmartItineraryPlanner/1.0 (contact@example.com)",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          allResults = allResults.concat(data);
        }
      } catch (err) {
        console.log(`Search failed for query: ${searchQuery}`);
      }
    }

    // Remove duplicates based on place_id
    const uniqueResults = allResults.filter((place, index, self) => 
      index === self.findIndex(p => p.place_id === place.place_id)
    );

    // Limit results
    const limitedResults = uniqueResults.slice(0, limit);

    // Transform data to match our app's format
    const transformedPlaces = limitedResults.map((place) => ({
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

    return transformedPlaces;
  } catch (error) {
    console.error("Nominatim search error:", error);
    throw error;
  }
}

// Helper function to categorize places from Nominatim
function getCategoryFromType(type, classType) {
  const categoryMap = {
    restaurant: "restaurant",
    cafe: "cafe",
    fast_food: "restaurant",
    food: "restaurant",
    mall: "mall",
    shopping: "shopping",
    market: "market",
    shop: "shopping",
    tourist_attraction: "attraction",
    monument: "attraction",
    palace: "palace",
    park: "garden",
    garden: "garden",
    stadium: "stadium",
    cinema: "entertainment",
    theater: "entertainment",
    museum: "museum",
    hotel: "hotel",
    temple: "temple",
    place_of_worship: "temple",
    religious: "temple",
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
    hotel: 0, // 24/7
    temple: 5,
    place_of_worship: 5,
    religious: 5,
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
    hotel: 24, // 24/7
    temple: 21,
    place_of_worship: 21,
    religious: 21,
  };

  return closingTimes[type] || 21;
}

// Generate default footfall data for Nominatim places
function generateDefaultFootfall(type) {
  const baseFootfall = {
    monday: { 9: 20, 10: 25, 11: 30, 12: 35, 13: 40, 14: 45, 15: 50, 16: 55, 17: 60, 18: 65, 19: 70, 20: 75, 21: 80 },
    tuesday: { 9: 25, 10: 30, 11: 35, 12: 40, 13: 45, 14: 50, 15: 55, 16: 60, 17: 65, 18: 70, 19: 75, 20: 80, 21: 85 },
    wednesday: { 9: 30, 10: 35, 11: 40, 12: 45, 13: 50, 14: 55, 15: 60, 16: 65, 17: 70, 18: 75, 19: 80, 20: 85, 21: 90 },
    thursday: { 9: 35, 10: 40, 11: 45, 12: 50, 13: 55, 14: 60, 15: 65, 16: 70, 17: 75, 18: 80, 19: 85, 20: 90, 21: 95 },
    friday: { 9: 40, 10: 45, 11: 50, 12: 55, 13: 60, 14: 65, 15: 70, 16: 75, 17: 80, 18: 85, 19: 90, 20: 95, 21: 100 },
    saturday: { 9: 45, 10: 50, 11: 55, 12: 60, 13: 65, 14: 70, 15: 75, 16: 80, 17: 85, 18: 90, 19: 95, 20: 100, 21: 100 },
    sunday: { 9: 50, 10: 55, 11: 60, 12: 65, 13: 70, 14: 75, 15: 80, 16: 85, 17: 90, 18: 95, 19: 100, 20: 100, 21: 95 }
  };

  // Adjust footfall based on place type
  const multipliers = {
    restaurant: 1.2,
    cafe: 1.1,
    mall: 1.3,
    park: 0.8,
    temple: 0.9,
    museum: 0.7,
    hotel: 0.6,
    market: 1.4,
    cinema: 1.5,
    theater: 1.2
  };

  const multiplier = multipliers[type] || 1.0;
  
  const adjustedFootfall = {};
  Object.keys(baseFootfall).forEach(day => {
    adjustedFootfall[day] = {};
    Object.keys(baseFootfall[day]).forEach(hour => {
      adjustedFootfall[day][hour] = Math.min(100, Math.round(baseFootfall[day][hour] * multiplier));
    });
  });

  return adjustedFootfall;
}

// Local fallback function
const loadPlacesFromLocal = async () => {
  try {
    console.log("Loading places from local JSON data...");
    const placesModule = await import('../data/places.json');
    const transformedPlaces = transformPlacesData(placesModule.default);
    console.log("Loaded places from local data:", transformedPlaces.length);
    return transformedPlaces;
  } catch (error) {
    console.error("Error loading local places:", error);
    throw error;
  }
};

// Local search function
const searchPlacesInLocal = async (query, category = "all") => {
  try {
    console.log("Searching places in local data...");
    const places = await loadPlacesFromLocal();
    
    let filteredPlaces = places;
    
    // Filter by category
    if (category && category !== "all") {
      filteredPlaces = places.filter(place => place.category === category);
    }
    
    // Filter by search query
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredPlaces = filteredPlaces.filter(place => 
        place.name.toLowerCase().includes(searchTerm) ||
        place.description?.toLowerCase().includes(searchTerm) ||
        place.category?.toLowerCase().includes(searchTerm)
      );
    }
    
    console.log("Found places in local data:", filteredPlaces.length);
    return filteredPlaces;
  } catch (error) {
    console.error("Error searching local places:", error);
    throw error;
  }
};

// Firebase-based data functions
const loadPlacesFromFirebase = async () => {
  try {
    // Initialize default data if needed
    await initializeDefaultData();
    
    // Get all places from Firebase
    const places = await placesService.getAllPlaces();
    console.log("Loaded places from Firebase:", places.length);
    return places;
  } catch (error) {
    console.error("Error loading places from Firebase:", error);
    
    // If Firebase is blocked, fall back to local data
    if (error.message === 'FIREBASE_BLOCKED' || 
        error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.log("Firebase blocked, falling back to local data...");
      return loadPlacesFromLocal();
    }
    
    throw error;
  }
};

const searchPlacesInFirebase = async (query, category = "all") => {
  try {
    const places = await placesService.searchPlaces(query, category);
    console.log("Found places in Firebase:", places.length);
    return places;
  } catch (error) {
    console.error("Error searching places in Firebase:", error);
    
    // If Firebase is blocked, fall back to local search
    if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || 
        error.message.includes('Failed to fetch')) {
      console.log("Firebase blocked, falling back to local search...");
      return searchPlacesInLocal(query, category);
    }
    
    throw error;
  }
};

// Export the service functions
export {
  transformPlacesData,
  suggestItinerary,
  searchNominatimPlaces,
  getBusyPercentage,
  loadPlacesFromFirebase,
  searchPlacesInFirebase
};
