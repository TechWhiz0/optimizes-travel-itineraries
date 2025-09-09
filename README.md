# Smart Itinerary Planner 🗺️

A beautiful MERN application that optimizes travel itineraries using AI-powered footfall analysis. The app helps users plan their trips by analyzing crowd levels at different times and creating optimal routes to minimize waiting times and maximize experiences.

## ✨ Features

- **AI-Powered Optimization**: Analyzes footfall data to create optimal itineraries
- **Smart Route Planning**: Considers opening hours, travel times, and crowd levels
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Real-time Analysis**: Instant itinerary generation with detailed statistics
- **Place Categories**: Supports malls, gardens, palaces, stadiums, and restaurants
- **Interactive Form**: Easy-to-use interface for trip planning

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-itinerary-planner
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Start the development servers**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start them separately:
   npm run server    # Backend on port 5000
   npm run client    # Frontend on port 5173
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🏗️ Project Structure

```
smart-itinerary-planner/
├── server.js                 # Express server
├── data.json                 # Places and footfall data
├── package.json             # Backend dependencies
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ItineraryForm.jsx
│   │   │   ├── ItineraryResults.jsx
│   │   │   ├── PlacesList.jsx
│   │   │   └── StatsCard.jsx
│   │   ├── App.jsx          # Main app component
│   │   └── index.css        # Tailwind styles
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # Tailwind configuration
└── README.md
```

## 🎯 How It Works

### Core Algorithm
The application uses a sophisticated algorithm that:

1. **Analyzes Footfall Data**: Examines crowd levels for each place across different days and hours
2. **Optimizes Route**: Chooses the least busy places at optimal times
3. **Considers Constraints**: Respects opening hours, travel times, and user preferences
4. **Generates Itinerary**: Creates a step-by-step plan with timing and crowd information

### Data Structure
The system works with:
- **Places**: Name, opening hours, category, location
- **Footfall Data**: Hourly crowd percentages for each day
- **Distance Matrix**: Travel times between locations
- **User Preferences**: Start time, stay duration, selected places

## 🛠️ API Endpoints

### Generate Itinerary
```http
POST /api/generate-itinerary
Content-Type: application/json

{
  "day": "saturday",
  "startHour": 12,
  "stayDuration": 1,
  "selectedPlaces": ["KLING", "Phoenix mall"]
}
```

### Get Places
```http
GET /api/places
```

## 🎨 UI Components

- **ItineraryForm**: User input for trip planning
- **ItineraryResults**: Displays optimized route with statistics
- **PlacesList**: Shows available places with categories
- **StatsCard**: Summary statistics with visual indicators

## 🎨 Design Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with gradients and shadows
- **Interactive Elements**: Hover effects, loading states, and smooth transitions
- **Color-coded Information**: Visual indicators for crowd levels and categories
- **Accessibility**: Proper contrast ratios and keyboard navigation

## 📊 Sample Data

The application includes sample data for Bangalore locations:
- **KLING** (Restaurant)
- **Phoenix Mall** (Shopping Mall)
- **Lal Bagh Botanical Garden** (Garden)
- **Bangalore Palace** (Historical Palace)
- **Chinnaswamy Stadium** (Sports Stadium)

## 🔧 Customization

### Adding New Places
1. Update `data.json` with new place information
2. Include footfall data for all days and hours
3. Add distance/time data to existing places

### Modifying the Algorithm
The core optimization logic is in `server.js` in the `suggestItinerary` function.

### Styling
- Tailwind CSS classes in `frontend/src/index.css`
- Component-specific styles in each React component

## 🚀 Deployment

### Backend (Node.js)
```bash
npm start
```

### Frontend (Vite)
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Jay Jeswani** - Smart Itinerary Planner

---

**Built with ❤️ using React, Node.js, Express, and Tailwind CSS**
