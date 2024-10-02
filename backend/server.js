const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const fs = require('fs');  // To read the dummy data file

app.use(cors()); // Enable CORS for cross-origin requests

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

const dummyDataFile = path.join(__dirname, '../data/dummy_data.json');
let dummyData = {};

fs.readFile(dummyDataFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading dummy data file:', err);
        return;
    }
    dummyData = JSON.parse(data);
});

// API endpoint to get the route for a specific date
app.get('/api/vehicle-route/:date', (req, res) => {
    const date = req.params.date;
    const routeData = dummyData[date] || [];

    if (routeData.length > 0) {
        res.json(routeData);
    } else {
        res.status(404).json({ message: 'No data found for this date.' });
    }
});

// Vehicle data
let vehicleLocation = {
    latitude: 17.385644,
    longitude: 78.487271,
    speed: 30, // speed in km/h
    totalDistance: 0, // total distance traveled in km
    lastStopDistance: 0, // distance from last stop in km
    lastUpdateTime: new Date().toISOString() // timestamp
};

// Function to simulate vehicle movement
function updateVehicleLocation() {
    vehicleLocation.latitude += 0.0001;  // Increment latitude slightly
    vehicleLocation.longitude += 0.0001;  // Increment longitude slightly
    
    // Update other vehicle data
    vehicleLocation.lastUpdateTime = new Date().toISOString();
    
    // Calculate new total distance and last stop distance
    const distanceIncrement = 0.01; // Simulated distance increment in km
    vehicleLocation.totalDistance += distanceIncrement;
    vehicleLocation.lastStopDistance += distanceIncrement; // For simplicity
}

// API endpoint to get the current vehicle location
app.get('/api/vehicle-location', (req, res) => {
    res.json(vehicleLocation);
});

// Update the vehicle location every 3 seconds
setInterval(updateVehicleLocation, 1000);

// Serve the index.html on the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
