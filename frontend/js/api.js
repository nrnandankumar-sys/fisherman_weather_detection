// API Service Functions
class APIService {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return { success: true, data };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    }

    // Fisherman endpoints
    async registerFisherman(fishermanData) {
        return this.request('/fishermen', {
            method: 'POST',
            body: JSON.stringify(fishermanData)
        });
    }

    async getFisherman(fishermanId) {
        return this.request(`/fishermen/${fishermanId}`);
    }

    // Weather endpoints
    async addWeatherData(weatherData) {
        return this.request('/weather', {
            method: 'POST',
            body: JSON.stringify(weatherData)
        });
    }

    async getWeather(locationId) {
        return this.request(`/weather/${locationId}`);
    }

    // Alert endpoints
    async createAlert(alertData) {
        return this.request('/alerts', {
            method: 'POST',
            body: JSON.stringify(alertData)
        });
    }

    async getAlerts(filters = {}) {
        let endpoint = '/alerts?';
        if (filters.location_id) {
            endpoint += `location_id=${filters.location_id}&`;
        }
        if (filters.severity) {
            endpoint += `severity=${filters.severity}`;
        }
        return this.request(endpoint);
    }

    // GPS endpoints
    async updateGPSLocation(locationData) {
        return this.request('/gps/location', {
            method: 'POST',
            body: JSON.stringify(locationData)
        });
    }

    async getGPSLocation(fishermanId) {
        return this.request(`/gps/location/${fishermanId}`);
    }

    // Emergency SOS endpoints
    async triggerSOS(sosData) {
        return this.request('/sos', {
            method: 'POST',
            body: JSON.stringify(sosData)
        });
    }

    async getSOS(sosId) {
        return this.request(`/sos/${sosId}`);
    }

    async resolveSOS(sosId, resolveData) {
        return this.request(`/sos/${sosId}/resolve`, {
            method: 'PATCH',
            body: JSON.stringify(resolveData)
        });
    }

    // Broadcast endpoints
    async sendBroadcast(broadcastData) {
        return this.request('/broadcast', {
            method: 'POST',
            body: JSON.stringify(broadcastData)
        });
    }

    async getBroadcasts() {
        return this.request('/broadcast');
    }

    // Health check
    async checkHealth() {
        return this.request('/health');
    }
}

// Initialize API Service
const api = new APIService(API_BASE_URL);
