const express = require('express');
const router = express.Router();

// Simulated vehicle data
let vehiclePosition = {
    latitude: 17.385044,
    longitude: 78.486671
};

// Update vehicle position every few seconds
setInterval(() => {
    // Simulate vehicle movement by slightly incrementing the latitude and longitude
    vehiclePosition.latitude += 0.0001;
    vehiclePosition.longitude += 0.0001;
}, 3000);  // Updates every 3 seconds

// Endpoint to get the vehicle's current position
router.get('/vehicle-location', (req, res) => {
    res.json(vehiclePosition);
});

module.exports = router;
