// Firebase service for database operations
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const COLLECTIONS = {
  PLACES: 'places',
  ITINERARIES: 'itineraries',
  USER_PREFERENCES: 'userPreferences'
};

// Places service
export const placesService = {
  // Get all places
  async getAllPlaces() {
    try {
      const placesRef = collection(db, COLLECTIONS.PLACES);
      const snapshot = await getDocs(placesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting places:', error);
      throw error;
    }
  },

  // Get place by ID
  async getPlaceById(id) {
    try {
      const placeRef = doc(db, COLLECTIONS.PLACES, id);
      const snapshot = await getDoc(placeRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting place:', error);
      throw error;
    }
  },

  // Search places by name or category
  async searchPlaces(searchTerm, category = null) {
    try {
      const placesRef = collection(db, COLLECTIONS.PLACES);
      let q = placesRef;
      
      if (category && category !== 'all') {
        q = query(placesRef, where('category', '==', category));
      }
      
      const snapshot = await getDocs(q);
      let places = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side filtering for search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        places = places.filter(place => 
          place.name.toLowerCase().includes(term) ||
          place.description?.toLowerCase().includes(term) ||
          place.category?.toLowerCase().includes(term)
        );
      }

      return places;
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  },

  // Add a new place
  async addPlace(placeData) {
    try {
      const placesRef = collection(db, COLLECTIONS.PLACES);
      const docRef = await addDoc(placesRef, {
        ...placeData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding place:', error);
      throw error;
    }
  },

  // Update a place
  async updatePlace(id, updateData) {
    try {
      const placeRef = doc(db, COLLECTIONS.PLACES, id);
      await updateDoc(placeRef, {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating place:', error);
      throw error;
    }
  },

  // Delete a place
  async deletePlace(id) {
    try {
      const placeRef = doc(db, COLLECTIONS.PLACES, id);
      await deleteDoc(placeRef);
    } catch (error) {
      console.error('Error deleting place:', error);
      throw error;
    }
  }
};

// Itineraries service
export const itinerariesService = {
  // Save an itinerary
  async saveItinerary(itineraryData) {
    try {
      const itinerariesRef = collection(db, COLLECTIONS.ITINERARIES);
      const docRef = await addDoc(itinerariesRef, {
        ...itineraryData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving itinerary:', error);
      throw error;
    }
  },

  // Get user's itineraries
  async getUserItineraries(userId) {
    try {
      const itinerariesRef = collection(db, COLLECTIONS.ITINERARIES);
      const q = query(
        itinerariesRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user itineraries:', error);
      throw error;
    }
  },

  // Get itinerary by ID
  async getItineraryById(id) {
    try {
      const itineraryRef = doc(db, COLLECTIONS.ITINERARIES, id);
      const snapshot = await getDoc(itineraryRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting itinerary:', error);
      throw error;
    }
  },

  // Update an itinerary
  async updateItinerary(id, updateData) {
    try {
      const itineraryRef = doc(db, COLLECTIONS.ITINERARIES, id);
      await updateDoc(itineraryRef, {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw error;
    }
  },

  // Delete an itinerary
  async deleteItinerary(id) {
    try {
      const itineraryRef = doc(db, COLLECTIONS.ITINERARIES, id);
      await deleteDoc(itineraryRef);
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      throw error;
    }
  }
};

// User preferences service
export const userPreferencesService = {
  // Save user preferences
  async saveUserPreferences(userId, preferences) {
    try {
      const prefsRef = collection(db, COLLECTIONS.USER_PREFERENCES);
      const q = query(prefsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Create new preferences
        await addDoc(prefsRef, {
          userId,
          ...preferences,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Update existing preferences
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...preferences,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  },

  // Get user preferences
  async getUserPreferences(userId) {
    try {
      const prefsRef = collection(db, COLLECTIONS.USER_PREFERENCES);
      const q = query(prefsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }
};

// Initialize default data with fallback
export const initializeDefaultData = async () => {
  try {
    // Check if places already exist
    const existingPlaces = await placesService.getAllPlaces();
    
    if (existingPlaces.length === 0) {
      console.log('No places found, initializing with default data...');
      
      // Import and transform the default places data
      const placesModule = await import('../data/places.json');
      const transformedPlaces = transformPlacesData(placesModule.default);
      
      // Add places to Firebase
      for (const place of transformedPlaces) {
        await placesService.addPlace(place);
      }
      
      console.log(`Initialized ${transformedPlaces.length} places in Firebase`);
    } else {
      console.log(`Found ${existingPlaces.length} existing places in Firebase`);
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
    
    // Check if it's a network/blocking error
    if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError')) {
      console.warn('Firebase connection blocked, using local fallback data');
      throw new Error('FIREBASE_BLOCKED');
    }
    
    throw error;
  }
};

// Transform places data (moved from dataService)
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
