// Weather API Configuration
const CONFIG = {
    API_KEY: 'dada103b32fb49768d6210107251007',
    BASE_URL: 'http://api.weatherapi.com/v1',
    ENDPOINTS: {
        CURRENT: '/current.json',
        FORECAST: '/forecast.json',
        SEARCH: '/search.json',
        ALERTS: '/alerts.json'
    },
    DEFAULT_PARAMS: {
        aqi: 'yes',
        days: 7,
        alerts: 'yes'
    }
};

// Application Settings
const APP_SETTINGS = {
    UNITS: {
        TEMPERATURE: 'celsius', // celsius or fahrenheit
        WIND_SPEED: 'kph', // kph or mph
        VISIBILITY: 'km' // km or miles
    },
    REFRESH_INTERVAL: 300000, // 5 minutes in milliseconds
    GEOLOCATION_TIMEOUT: 10000, // 10 seconds
    MAX_RECENT_SEARCHES: 5
};

// Weather Condition Icons Mapping
const WEATHER_ICONS = {
    'sunny': 'fas fa-sun',
    'clear': 'fas fa-moon',
    'partly cloudy': 'fas fa-cloud-sun',
    'cloudy': 'fas fa-cloud',
    'overcast': 'fas fa-cloud',
    'mist': 'fas fa-smog',
    'fog': 'fas fa-smog',
    'light rain': 'fas fa-cloud-rain',
    'moderate rain': 'fas fa-cloud-rain',
    'heavy rain': 'fas fa-cloud-showers-heavy',
    'light snow': 'fas fa-snowflake',
    'moderate snow': 'fas fa-snowflake',
    'heavy snow': 'fas fa-snowflake',
    'thunderstorm': 'fas fa-bolt',
    'drizzle': 'fas fa-cloud-drizzle',
    'default': 'fas fa-cloud-sun'
};

// Weather Alerts Configuration
const ALERT_CONFIG = {
    TYPES: {
        WARNING: 'warning',
        WATCH: 'watch',
        ADVISORY: 'advisory'
    },
    COLORS: {
        WARNING: '#ff6b6b',
        WATCH: '#ffa500',
        ADVISORY: '#4ecdc4'
    },
    AUTO_DISMISS: 30000 // 30 seconds
};

// Utility Functions
const UTILS = {
    // Format temperature based on user preference
    formatTemperature: (temp, unit = APP_SETTINGS.UNITS.TEMPERATURE) => {
        if (unit === 'fahrenheit') {
            return `${Math.round(temp * 9/5 + 32)}°F`;
        }
        return `${Math.round(temp)}°C`;
    },
    
    // Format wind speed
    formatWindSpeed: (speed, unit = APP_SETTINGS.UNITS.WIND_SPEED) => {
        if (unit === 'mph') {
            return `${Math.round(speed * 0.621371)} mph`;
        }
        return `${Math.round(speed)} km/h`;
    },
    
    // Format visibility
    formatVisibility: (visibility, unit = APP_SETTINGS.UNITS.VISIBILITY) => {
        if (unit === 'miles') {
            return `${Math.round(visibility * 0.621371)} miles`;
        }
        return `${Math.round(visibility)} km`;
    },
    
    // Format date and time
    formatDateTime: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Format time only
    formatTime: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Format day of week
    formatDay: (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        }
    },
    
    // Get weather icon class
    getWeatherIcon: (condition) => {
        const conditionLower = condition.toLowerCase();
        for (const [key, icon] of Object.entries(WEATHER_ICONS)) {
            if (conditionLower.includes(key)) {
                return icon;
            }
        }
        return WEATHER_ICONS.default;
    },
    
    // Get UV index description
    getUVDescription: (uvIndex) => {
        if (uvIndex <= 2) return 'Low';
        if (uvIndex <= 5) return 'Moderate';
        if (uvIndex <= 7) return 'High';
        if (uvIndex <= 10) return 'Very High';
        return 'Extreme';
    },
    
    // Get air quality description
    getAirQualityDescription: (aqi) => {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    },
    
    // Debounce function for search input
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Local storage helpers
    saveToLocalStorage: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Unable to save to localStorage:', error);
        }
    },
    
    getFromLocalStorage: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Unable to read from localStorage:', error);
            return null;
        }
    },
    
    removeFromLocalStorage: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Unable to remove from localStorage:', error);
        }
    }
};