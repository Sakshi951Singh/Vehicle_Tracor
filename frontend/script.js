let map;
let marker;
let routeLine;
let routeCoords = [];
let animationInterval;

function initMap() {
    const initialLocation = [17.385044, 78.486671];
    map = L.map('map').setView(initialLocation, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const vehicleIcon = L.icon({
        iconUrl: 'veicle2.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

    marker = L.marker(initialLocation, {
        icon: vehicleIcon,
        rotationAngle: 0,
        rotationOrigin: 'center center'
    }).addTo(map);
}

async function fetchVehicleData() {
    try {
        const response = await fetch('http://localhost:3000/api/vehicle-location');
        return await response.json();
    } catch (error) {
        console.error('Error fetching vehicle data:', error);
    }
}

function updateVehiclePosition(position, nextPosition, data) {
    const angle = calculateAngle(position, nextPosition);

    marker.setLatLng(position);
    marker.setRotationAngle(angle);

    map.panTo(position);

    const tooltipContent = `
        <strong>Current Location:</strong> ${position[0].toFixed(6)}, ${position[1].toFixed(6)}<br>
        <strong>Speed:</strong> ${data.speed} km/h<br>
        <strong>Total Distance:</strong> ${data.totalDistance.toFixed(2)} km<br>
        <strong>Last Stop Distance:</strong> ${data.lastStopDistance.toFixed(2)} km<br>
        <strong>Last Update:</strong> ${data.lastUpdateTime}
    `;
    
    marker.bindPopup(tooltipContent).openPopup();
}

function calculateAngle(position, nextPosition) {
    const latDiff = nextPosition[0] - position[0];
    const lngDiff = nextPosition[1] - position[1];
    return (Math.atan2(lngDiff, latDiff) * 180 / Math.PI) + 90;
}

async function fetchRouteData(date) {
    try {
        const response = await fetch(`http://localhost:3000/api/vehicle-route/${date}`);
        if (!response.ok) throw new Error('Data not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching route data:', error);
        alert('Error fetching route data. Please try again.');
        return [];
    }
}

function drawRoute(routeCoords) {
    if (routeLine) {
        map.removeLayer(routeLine);
    }
    routeLine = L.polyline(routeCoords, { color: 'blue', weight: 3 }).addTo(map);
    map.fitBounds(routeLine.getBounds());
}

function animateVehicle(routeCoords) {
    let i = 0;
    clearInterval(animationInterval);
    animationInterval = setInterval(async () => {
        if (i < routeCoords.length - 1) {
            const vehicleData = await fetchVehicleData();
            const currentPosition = routeCoords[i];
            const nextPosition = routeCoords[i + 1];
            updateVehiclePosition(currentPosition, nextPosition, vehicleData);
            i++;
        } else {
            clearInterval(animationInterval);
        }
    }, 200);
}

document.getElementById('show-button').addEventListener('click', async () => {
    const selectedDate = document.getElementById('time-frame').value;
    const routeData = await fetchRouteData(selectedDate);
    if (routeData.length > 0) {
        routeCoords = routeData.map(coord => [coord.latitude, coord.longitude]);
        drawRoute(routeCoords);
        setTimeout(() => animateVehicle(routeCoords), 1000);
    } else {
        alert('No route data found for the selected date.');
    }
});

window.onload = initMap;
