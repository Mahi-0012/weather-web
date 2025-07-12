// Weather Service Class
class WeatherService {
    constructor() {
        this.apiKey = CONFIG.API_KEY;
        this.baseUrl = CONFIG.BASE_URL;
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    // Build API URL with parameters
    buildUrl(endpoint, params = {}) {
        const url = new URL(this.baseUrl + endpoint);
        url.searchParams.append('key', this.apiKey);
        
        // Add default parameters
        Object.entries(CONFIG.DEFAULT_PARAMS).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        
        // Add custom parameters
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        
        return url.toString();
    }

    // Generic fetch with error handling
    async fetchData(url, cacheKey = null) {
        try {
            // Check cache first
            if (cacheKey && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheExpiry) {
                    return cached.data;
                }
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Handle API errors
            if (data.error) {
                throw new Error(data.error.message || 'API Error');
            }

            // Cache the result
            if (cacheKey) {
                this.cache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
            }

            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    // Get current weather by location
    async getCurrentWeather(location) {
        const url = this.buildUrl(CONFIG.ENDPOINTS.CURRENT, { q: location });
        const cacheKey = `current_${location}`;
        return await this.fetchData(url, cacheKey);
    }

    // Get weather forecast
    async getForecast(location, days = 7) {
        const url = this.buildUrl(CONFIG.ENDPOINTS.FORECAST, { 
            q: location, 
            days: days 
        });
        const cacheKey = `forecast_${location}_${days}`;
        return await this.fetchData(url, cacheKey);
    }

    // Search for locations
    async searchLocations(query) {
        if (!query || query.length < 2) {
            return [];
        }
        
        const url = this.buildUrl(CONFIG.ENDPOINTS.SEARCH, { q: query });
        const cacheKey = `search_${query}`;
        return await this.fetchData(url, cacheKey);
    }

    // Get weather alerts
    async getWeatherAlerts(location) {
        try {
            const url = this.buildUrl(CONFIG.ENDPOINTS.ALERTS, { q: location });
            const cacheKey = `alerts_${location}`;
            return await this.fetchData(url, cacheKey);
        } catch (error) {
            // Alerts endpoint might not be available in all plans
            console.warn('Weather alerts not available:', error);
            return null;
        }
    }

    // Get weather by coordinates
    async getWeatherByCoords(lat, lon) {
        const location = `${lat},${lon}`;
        return await this.getCurrentWeather(location);
    }

    // Get forecast by coordinates
    async getForecastByCoords(lat, lon, days = 7) {
        const location = `${lat},${lon}`;
        return await this.getForecast(location, days);
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get cache size
    getCacheSize() {
        return this.cache.size;
    }
}

// Weather Data Processor Class
class WeatherDataProcessor {
    constructor() {
        this.weatherService = new WeatherService();
    }

    // Process current weather data
    processCurrentWeather(data) {
        const { location, current } = data;
        
        return {
            location: {
                name: location.name,
                region: location.region,
                country: location.country,
                localtime: location.localtime,
                coordinates: {
                    lat: location.lat,
                    lon: location.lon
                }
            },
            current: {
                temperature: current.temp_c,
                temperatureF: current.temp_f,
                feelsLike: current.feelslike_c,
                feelsLikeF: current.feelslike_f,
                condition: current.condition.text,
                icon: current.condition.icon,
                humidity: current.humidity,
                windSpeed: current.wind_kph,
                windSpeedMph: current.wind_mph,
                windDirection: current.wind_dir,
                visibility: current.vis_km,
                visibilityMiles: current.vis_miles,
                uvIndex: current.uv,
                cloudCover: current.cloud,
                lastUpdated: current.last_updated
            },
            airQuality: current.air_quality ? {
                co: current.air_quality.co,
                no2: current.air_quality.no2,
                o3: current.air_quality.o3,
                so2: current.air_quality.so2,
                pm2_5: current.air_quality.pm2_5,
                pm10: current.air_quality.pm10,
                usEpaIndex: current.air_quality['us-epa-index'],
                gbDefraIndex: current.air_quality['gb-defra-index']
            } : null
        };
    }

    // Process forecast data
    processForecast(data) {
        const { location, forecast } = data;
        
        return {
            location: {
                name: location.name,
                region: location.region,
                country: location.country,
                localtime: location.localtime
            },
            forecast: {
                forecastday: forecast.forecastday.map(day => ({
                    date: day.date,
                    dateEpoch: day.date_epoch,
                    day: {
                        maxTemp: day.day.maxtemp_c,
                        maxTempF: day.day.maxtemp_f,
                        minTemp: day.day.mintemp_c,
                        minTempF: day.day.mintemp_f,
                        avgTemp: day.day.avgtemp_c,
                        avgTempF: day.day.avgtemp_f,
                        condition: day.day.condition.text,
                        icon: day.day.condition.icon,
                        maxWind: day.day.maxwind_kph,
                        maxWindMph: day.day.maxwind_mph,
                        totalPrecip: day.day.totalprecip_mm,
                        totalPrecipIn: day.day.totalprecip_in,
                        avgHumidity: day.day.avghumidity,
                        willItRain: day.day.daily_will_it_rain,
                        chanceOfRain: day.day.daily_chance_of_rain,
                        willItSnow: day.day.daily_will_it_snow,
                        chanceOfSnow: day.day.daily_chance_of_snow,
                        uvIndex: day.day.uv
                    },
                    astro: {
                        sunrise: day.astro.sunrise,
                        sunset: day.astro.sunset,
                        moonrise: day.astro.moonrise,
                        moonset: day.astro.moonset,
                        moonPhase: day.astro.moon_phase,
                        moonIllumination: day.astro.moon_illumination
                    },
                    hour: day.hour.map(hour => ({
                        time: hour.time,
                        timeEpoch: hour.time_epoch,
                        temp: hour.temp_c,
                        tempF: hour.temp_f,
                        condition: hour.condition.text,
                        icon: hour.condition.icon,
                        windSpeed: hour.wind_kph,
                        windSpeedMph: hour.wind_mph,
                        windDirection: hour.wind_dir,
                        humidity: hour.humidity,
                        cloudCover: hour.cloud,
                        feelsLike: hour.feelslike_c,
                        feelsLikeF: hour.feelslike_f,
                        visibility: hour.vis_km,
                        visibilityMiles: hour.vis_miles,
                        uvIndex: hour.uv,
                        willItRain: hour.will_it_rain,
                        chanceOfRain: hour.chance_of_rain,
                        willItSnow: hour.will_it_snow,
                        chanceOfSnow: hour.chance_of_snow,
                        precipitation: hour.precip_mm,
                        precipitationIn: hour.precip_in
                    }))
                }))
            }
        };
    }

    // Process weather alerts
    processWeatherAlerts(data) {
        if (!data || !data.alerts || !data.alerts.alert) {
            return [];
        }

        return data.alerts.alert.map(alert => ({
            headline: alert.headline,
            msgType: alert.msgtype,
            severity: alert.severity,
            urgency: alert.urgency,
            areas: alert.areas,
            category: alert.category,
            certainty: alert.certainty,
            event: alert.event,
            note: alert.note,
            effective: alert.effective,
            expires: alert.expires,
            description: alert.desc,
            instruction: alert.instruction
        }));
    }

    // Get processed current weather
    async getCurrentWeatherProcessed(location) {
        const data = await this.weatherService.getCurrentWeather(location);
        return this.processCurrentWeather(data);
    }

    // Get processed forecast
    async getForecastProcessed(location, days = 7) {
        const data = await this.weatherService.getForecast(location, days);
        return this.processForecast(data);
    }

    // Get processed weather alerts
    async getWeatherAlertsProcessed(location) {
        const data = await this.weatherService.getWeatherAlerts(location);
        return data ? this.processWeatherAlerts(data) : [];
    }

    // Get complete weather data
    async getCompleteWeatherData(location) {
        try {
            const [currentData, forecastData, alertsData] = await Promise.allSettled([
                this.getCurrentWeatherProcessed(location),
                this.getForecastProcessed(location),
                this.getWeatherAlertsProcessed(location)
            ]);

            return {
                current: currentData.status === 'fulfilled' ? currentData.value : null,
                forecast: forecastData.status === 'fulfilled' ? forecastData.value : null,
                alerts: alertsData.status === 'fulfilled' ? alertsData.value : [],
                errors: [
                    ...(currentData.status === 'rejected' ? [currentData.reason] : []),
                    ...(forecastData.status === 'rejected' ? [forecastData.reason] : []),
                    ...(alertsData.status === 'rejected' ? [alertsData.reason] : [])
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get complete weather data: ${error.message}`);
        }
    }
}

// Location Service Class
class LocationService {
    constructor() {
        this.weatherService = new WeatherService();
    }

    // Get current position using Geolocation API
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    let errorMessage = 'Unable to retrieve your location';
                    
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: APP_SETTINGS.GEOLOCATION_TIMEOUT,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    // Search for locations
    async searchLocations(query) {
        return await this.weatherService.searchLocations(query);
    }

    // Get weather by current location
    async getWeatherByCurrentLocation() {
        const position = await this.getCurrentPosition();
        return await this.weatherService.getWeatherByCoords(
            position.latitude, 
            position.longitude
        );
    }

    // Get forecast by current location
    async getForecastByCurrentLocation(days = 7) {
        const position = await this.getCurrentPosition();
        return await this.weatherService.getForecastByCoords(
            position.latitude, 
            position.longitude, 
            days
        );
    }
}

// Export classes for use in other files
window.WeatherService = WeatherService;
window.WeatherDataProcessor = WeatherDataProcessor;
window.LocationService = LocationService;