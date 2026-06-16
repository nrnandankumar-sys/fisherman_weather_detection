// App State
let appState = {
    fishermanId: localStorage.getItem('fishermanId') || 1,
    currentLocation: null,
    isTracking: false,
    notifications: []
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Load initial data
    loadDashboardData();
    loadWeatherData();
    loadAlerts();
    
    // Set up auto-refresh
    setInterval(() => {
        loadDashboardData();
        loadWeatherData();
    }, APP_SETTINGS.AUTO_REFRESH_INTERVAL);
    
    // Mobile menu toggle
    setupMobileMenu();
}

// Mobile Menu
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger?.addEventListener('click', () => {
        navMenu?.classList.toggle('active');
    });
    
    // Close menu on link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu?.classList.remove('active');
        });
    });
}

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        // Load section-specific data
        if (sectionId === 'weather') loadWeatherData();
        if (sectionId === 'alerts') loadAlerts();
        if (sectionId === 'gps') loadGPSData();
        if (sectionId === 'sos') loadSOSHistory();
        if (sectionId === 'profile') loadProfile();
    }
}

// Dashboard
async function loadDashboardData() {
    try {
        // Load weather data
        const weatherRes = await api.getWeather(1);
        if (weatherRes.success) {
            const weather = weatherRes.data;
            document.getElementById('temp-value').textContent = `${weather.temperature}°C`;
            document.getElementById('wind-value').textContent = `${weather.wind_speed} km/h`;
            document.getElementById('sea-value').textContent = weather.sea_condition || '--';
        }
        
        // Load alerts count
        const alertsRes = await api.getAlerts();
        if (alertsRes.success && Array.isArray(alertsRes.data)) {
            document.getElementById('alert-count').textContent = alertsRes.data.length;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Weather
async function loadWeatherData() {
    try {
        const res = await api.getWeather(1);
        if (res.success) {
            const weather = res.data;
            
            // Update weather details
            document.getElementById('weather-temp').textContent = `${weather.temperature}°C`;
            document.getElementById('weather-humidity').textContent = `${weather.humidity}%`;
            document.getElementById('weather-wind').textContent = `${weather.wind_speed} km/h`;
            document.getElementById('weather-direction').textContent = weather.wind_direction || '--';
            document.getElementById('weather-rainfall').textContent = `${weather.rainfall || 0} mm`;
            document.getElementById('weather-sea').textContent = weather.sea_condition || '--';
            document.getElementById('weather-visibility').textContent = `${weather.visibility || '--'} km`;
            
            // Update forecast if available
            if (weather.forecast_data) {
                displayForecast(weather.forecast_data);
            }
        }
    } catch (error) {
        console.error('Error loading weather:', error);
        showNotification('Error loading weather data', 'error');
    }
}

function displayForecast(forecastData) {
    const container = document.getElementById('forecast-container');
    if (!container || !Array.isArray(forecastData)) return;
    
    container.innerHTML = '';
    forecastData.forEach(day => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p><strong>${day.date}</strong></p>
            <p>Temp: ${day.temp}°C</p>
            <p>Wind: ${day.wind} km/h</p>
            <p>${day.condition}</p>
        `;
        container.appendChild(card);
    });
}

// Alerts
async function loadAlerts() {
    try {
        const severity = document.getElementById('severity-filter')?.value || '';
        const res = await api.getAlerts({ severity: severity || undefined });
        
        if (res.success && Array.isArray(res.data)) {
            displayAlerts(res.data);
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
        showNotification('Error loading alerts', 'error');
    }
}

function displayAlerts(alerts) {
    const container = document.getElementById('alerts-container');
    if (!container) return;
    
    if (alerts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No alerts at this time</p>';
        return;
    }
    
    container.innerHTML = '';
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `alert-item ${alert.severity}`;
        alertElement.innerHTML = `
            <div class="alert-header">
                <span class="alert-type">${alert.alert_type.replace(/_/g, ' ')}</span>
                <span class="alert-severity ${alert.severity}">${alert.severity.toUpperCase()}</span>
            </div>
            <p class="alert-message">${alert.message}</p>
            <p class="alert-timestamp">${new Date(alert.created_at).toLocaleString()}</p>
        `;
        container.appendChild(alertElement);
    });
}

// GPS
async function loadGPSData() {
    try {
        const res = await api.getGPSLocation(appState.fishermanId);
        if (res.success) {
            const location = res.data;
            appState.currentLocation = location;
            
            document.getElementById('gps-lat').textContent = location.latitude.toFixed(6);
            document.getElementById('gps-lon').textContent = location.longitude.toFixed(6);
            document.getElementById('gps-speed').textContent = `${location.speed || 0} km/h`;
            document.getElementById('gps-direction').textContent = location.direction || '--';
            document.getElementById('gps-altitude').textContent = `${location.altitude || 0} m`;
        }
    } catch (error) {
        console.error('Error loading GPS data:', error);
    }
}

function startTracking() {
    appState.isTracking = true;
    showNotification('Tracking started', 'success');
    
    const interval = setInterval(() => {
        if (!appState.isTracking) {
            clearInterval(interval);
            return;
        }
        
        // Get current position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude, accuracy } = position.coords;
                
                // Update location
                api.updateGPSLocation({
                    fisherman_id: appState.fishermanId,
                    latitude,
                    longitude,
                    accuracy
                });
            });
        }
    }, APP_SETTINGS.GPS_UPDATE_INTERVAL);
}

function stopTracking() {
    appState.isTracking = false;
    showNotification('Tracking stopped', 'success');
}

// Emergency SOS
async function triggerSOS() {
    const button = document.getElementById('sos-button');
    button.disabled = true;
    button.textContent = 'Sending...';
    
    // Get current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            
            try {
                const res = await api.triggerSOS({
                    fisherman_id: appState.fishermanId,
                    emergency_type: 'accident',
                    latitude,
                    longitude,
                    description: 'Emergency SOS triggered'
                });
                
                if (res.success) {
                    showNotification('Emergency SOS sent! Help is on the way.', 'success');
                    loadSOSHistory();
                } else {
                    showNotification('Failed to send SOS', 'error');
                }
            } catch (error) {
                showNotification('Error sending SOS', 'error');
            } finally {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-exclamation-triangle"></i>EMERGENCY SOS';
            }
        }, error => {
            showNotification('Unable to get location. Please enable location services.', 'error');
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-exclamation-triangle"></i>EMERGENCY SOS';
        });
    } else {
        showNotification('Geolocation not supported', 'error');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i>EMERGENCY SOS';
    }
}

async function loadSOSHistory() {
    // In a real app, you'd fetch the SOS history from the API
    const container = document.getElementById('sos-history-container');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align: center; color: #999;">No emergency calls</p>';
}

// Profile
function loadProfile() {
    // Load profile from localStorage or API
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    document.getElementById('profile-name').value = profile.name || '';
    document.getElementById('profile-phone').value = profile.phone || '';
    document.getElementById('profile-email').value = profile.email || '';
}

async function updateProfile() {
    const name = document.getElementById('profile-name').value;
    const phone = document.getElementById('profile-phone').value;
    const email = document.getElementById('profile-email').value;
    
    if (!name || !phone) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    const profile = { name, phone, email };
    localStorage.setItem('profile', JSON.stringify(profile));
    localStorage.setItem('fishermanId', appState.fishermanId);
    
    showNotification('Profile updated successfully', 'success');
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, APP_SETTINGS.NOTIFICATION_TIMEOUT);
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleString();
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => resolve(position.coords),
                error => reject(error)
            );
        } else {
            reject(new Error('Geolocation not supported'));
        }
    });
}
