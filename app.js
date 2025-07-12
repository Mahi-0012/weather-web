// Main Weather Application Class
class WeatherApp {
    constructor() {
        this.weatherProcessor = new WeatherDataProcessor();
        this.locationService = new LocationService();
        this.currentLocation = null;
        this.isLoading = false;
        this.selectedSuggestionIndex = -1;
        this.currentSuggestions = [];
        this.recentSearches = UTILS.getFromLocalStorage('recentSearches') || [];
        
        // DOM Elements
        this.elements = {
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            locationBtn: document.getElementById('locationBtn'),
            loadingState: document.getElementById('loadingState'),
            errorState: document.getElementById('errorState'),
            errorMessage: document.getElementById('errorMessage'),
            retryBtn: document.getElementById('retryBtn'),
            currentWeather: document.getElementById('currentWeather'),
            hourlyForecast: document.getElementById('hourlyForecast'),
            dailyForecast: document.getElementById('dailyForecast'),
            alertsSection: document.getElementById('alertsSection'),
            alertMessage: document.getElementById('alertMessage'),
            alertClose: document.getElementById('alertClose'),
            suggestionsDropdown: document.getElementById('suggestionsDropdown'),
            suggestionsContainer: document.getElementById('suggestionsContainer'),
            clearRecentBtn: document.getElementById('clearRecentBtn'),
            
            // Current weather elements
            locationName: document.getElementById('locationName'),
            locationDetails: document.getElementById('locationDetails'),
            lastUpdated: document.getElementById('lastUpdated'),
            temperature: document.getElementById('temperature'),
            feelsLike: document.getElementById('feelsLike'),
            weatherIcon: document.getElementById('weatherIcon'),
            weatherCondition: document.getElementById('weatherCondition'),
            visibility: document.getElementById('visibility'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            uvIndex: document.getElementById('uvIndex'),
            chanceOfRain: document.getElementById('chanceOfRain'),
            hourlyContainer: document.getElementById('hourlyContainer'),
            dailyContainer: document.getElementById('dailyContainer')
        };
        
        this.init();
    }

    // Initialize the application
    init() {
        this.bindEvents();
        this.loadDefaultWeather();
        this.setupAutoRefresh();
    }

    // Bind event listeners
    bindEvents() {
        // Search functionality
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch();
            }
        });
        
        // Location button
        this.elements.locationBtn.addEventListener('click', () => this.handleCurrentLocation());
        
        // Retry button
        this.elements.retryBtn.addEventListener('click', () => this.handleRetry());
        
        // Alert close button
        this.elements.alertClose.addEventListener('click', () => this.closeAlert());
        
        // Clear recent searches
        this.elements.clearRecentBtn.addEventListener('click', () => this.clearRecentSearches());
        
        // Search input with suggestions
        this.elements.searchInput.addEventListener('input', 
            UTILS.debounce((e) => this.handleSearchInput(e), 300)
        );
        
        // Search input focus and blur
        this.elements.searchInput.addEventListener('focus', () => this.showSuggestions());
        this.elements.searchInput.addEventListener('blur', () => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => this.hideSuggestions(), 200);
        });
        
        // Keyboard navigation for suggestions
        this.elements.searchInput.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        
        // Click outside to close suggestions
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });
    }

    // Handle search input for suggestions
    async handleSearchInput(event) {
        const query = event.target.value.trim();
        
        if (query.length < 2) {
            this.showRecentSearches();
            return;
        }
        
        try {
            const suggestions = await this.locationService.searchLocations(query);
            this.currentSuggestions = suggestions;
            this.selectedSuggestionIndex = -1;
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            this.showRecentSearches();
        }
    }

    // Display suggestions
    displaySuggestions(suggestions) {
        const container = this.elements.suggestionsContainer;
        container.innerHTML = '';
        
        if (suggestions.length === 0) {
            container.innerHTML = '<div class="no-suggestions">No locations found</div>';
            this.elements.suggestionsDropdown.style.display = 'block';
            return;
        }
        
        suggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            suggestionElement.dataset.index = index;
            
            suggestionElement.innerHTML = `
                <i class="suggestion-icon fas fa-map-marker-alt"></i>
                <div class="suggestion-content">
                    <div class="suggestion-name">${suggestion.name}</div>
                    <div class="suggestion-details">${suggestion.region}${suggestion.region ? ', ' : ''}${suggestion.country}</div>
                </div>
                <div class="suggestion-type">City</div>
            `;
            
            suggestionElement.addEventListener('click', () => this.selectSuggestion(suggestion));
            container.appendChild(suggestionElement);
        });
        
        this.elements.suggestionsDropdown.style.display = 'block';
    }

    // Show recent searches
    showRecentSearches() {
        const container = this.elements.suggestionsContainer;
        container.innerHTML = '';
        
        if (this.recentSearches.length === 0) {
            container.innerHTML = '<div class="no-suggestions">No recent searches</div>';
            this.elements.suggestionsDropdown.style.display = 'block';
            return;
        }
        
        // Add recent searches title
        const titleElement = document.createElement('div');
        titleElement.className = 'recent-searches-title';
        titleElement.textContent = 'Recent Searches';
        container.appendChild(titleElement);
        
        this.recentSearches.forEach((search, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item recent';
            suggestionElement.dataset.index = index;
            
            suggestionElement.innerHTML = `
                <i class="suggestion-icon fas fa-history"></i>
                <div class="suggestion-content">
                    <div class="suggestion-name">${search.name}</div>
                    <div class="suggestion-details">${search.region}${search.region ? ', ' : ''}${search.country}</div>
                </div>
                <div class="suggestion-type">Recent</div>
            `;
            
            suggestionElement.addEventListener('click', () => this.selectRecentSearch(search));
            container.appendChild(suggestionElement);
        });
        
        this.elements.suggestionsDropdown.style.display = 'block';
    }

    // Show suggestions dropdown
    showSuggestions() {
        const query = this.elements.searchInput.value.trim();
        if (query.length < 2) {
            this.showRecentSearches();
        } else {
            this.elements.suggestionsDropdown.style.display = 'block';
        }
    }

    // Hide suggestions dropdown
    hideSuggestions() {
        this.elements.suggestionsDropdown.style.display = 'none';
        this.selectedSuggestionIndex = -1;
    }

        // Handle keyboard navigation (continued)
    handleKeyboardNavigation(event) {
        if (!this.elements.suggestionsDropdown.style.display || this.elements.suggestionsDropdown.style.display === 'none') {
            return;
        }
        
        const items = this.elements.suggestionsContainer.querySelectorAll('.suggestion-item');
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, items.length - 1);
                this.updateSelectedSuggestion(items);
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
                this.updateSelectedSuggestion(items);
                break;
                
            case 'Enter':
                event.preventDefault();
                if (this.selectedSuggestionIndex >= 0 && items[this.selectedSuggestionIndex]) {
                    items[this.selectedSuggestionIndex].click();
                } else {
                    this.handleSearch();
                }
                break;
                
            case 'Escape':
                this.hideSuggestions();
                this.elements.searchInput.blur();
                break;
        }
    }

    // Update selected suggestion visual state
    updateSelectedSuggestion(items) {
        items.forEach((item, index) => {
            if (index === this.selectedSuggestionIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // Select a suggestion
    selectSuggestion(suggestion) {
        const locationString = `${suggestion.name}, ${suggestion.region ? suggestion.region + ', ' : ''}${suggestion.country}`;
        this.elements.searchInput.value = locationString;
        this.hideSuggestions();
        this.addToRecentSearches(suggestion);
        this.loadWeatherData(locationString);
    }

    // Select a recent search
    selectRecentSearch(search) {
        const locationString = `${search.name}, ${search.region ? search.region + ', ' : ''}${search.country}`;
        this.elements.searchInput.value = locationString;
        this.hideSuggestions();
        this.loadWeatherData(locationString);
    }

    // Add to recent searches
    addToRecentSearches(location) {
        // Remove if already exists
        this.recentSearches = this.recentSearches.filter(item => 
            !(item.name === location.name && item.region === location.region && item.country === location.country)
        );
        
        // Add to beginning
        this.recentSearches.unshift({
            name: location.name,
            region: location.region,
            country: location.country,
            timestamp: Date.now()
        });
        
        // Keep only the latest searches
        this.recentSearches = this.recentSearches.slice(0, APP_SETTINGS.MAX_RECENT_SEARCHES);
        
        // Save to localStorage
        UTILS.saveToLocalStorage('recentSearches', this.recentSearches);
    }

    // Clear recent searches
    clearRecentSearches() {
        this.recentSearches = [];
        UTILS.removeFromLocalStorage('recentSearches');
        this.showRecentSearches();
    }

    // Load default weather (try current location, fallback to default city)
    async loadDefaultWeather() {
        try {
            // Try to get weather by current location
            await this.handleCurrentLocation();
        } catch (error) {
            // Fallback to default city
            console.log('Using default location');
            await this.loadWeatherData('Hyderabad, India');
        }
    }

    // Handle search functionality
    async handleSearch() {
        const query = this.elements.searchInput.value.trim();
        if (!query) {
            this.showError('Please enter a location to search');
            return;
        }
        
        this.hideSuggestions();
        await this.loadWeatherData(query);
        this.elements.searchInput.value = '';
    }

    // Handle current location
    async handleCurrentLocation() {
        this.showLoading();
        
        try {
            const position = await this.locationService.getCurrentPosition();
            const location = `${position.latitude},${position.longitude}`;
            await this.loadWeatherData(location);
        } catch (error) {
            console.error('Geolocation error:', error);
            this.showError(error.message);
        }
    }

    // Handle retry
    async handleRetry() {
        if (this.currentLocation) {
            await this.loadWeatherData(this.currentLocation);
        } else {
            await this.loadDefaultWeather();
        }
    }

    // Load weather data for a location
    async loadWeatherData(location) {
        if (this.isLoading) {
            return;
        }
        
        this.isLoading = true;
        this.currentLocation = location;
        this.showLoading();
        
        try {
            const weatherData = await this.weatherProcessor.getCompleteWeatherData(location);
            
            if (weatherData.errors.length > 0) {
                console.warn('Some weather data failed to load:', weatherData.errors);
            }
            
            if (weatherData.current) {
                this.displayCurrentWeather(weatherData.current);
            }
            
            if (weatherData.forecast) {
                this.displayForecast(weatherData.forecast);
            }
            
            if (weatherData.alerts && weatherData.alerts.length > 0) {
                this.displayWeatherAlerts(weatherData.alerts);
            }
            
            this.showWeatherData();
            
        } catch (error) {
            console.error('Weather data error:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    // Display current weather
    displayCurrentWeather(data) {
        const { location, current } = data;
        
        // Location information
        this.elements.locationName.textContent = location.name;
        this.elements.locationDetails.textContent = `${location.region}, ${location.country}`;
        this.elements.lastUpdated.textContent = `Last updated: ${UTILS.formatDateTime(current.lastUpdated)}`;
        
        // Main weather info
        this.elements.temperature.textContent = UTILS.formatTemperature(current.temperature);
        this.elements.feelsLike.textContent = `Feels like ${UTILS.formatTemperature(current.feelsLike)}`;
        this.elements.weatherIcon.src = `https:${current.icon}`;
        this.elements.weatherIcon.alt = current.condition;
        this.elements.weatherCondition.textContent = current.condition;
        
        // Weather details
        this.elements.visibility.textContent = UTILS.formatVisibility(current.visibility);
        this.elements.humidity.textContent = `${current.humidity}%`;
        this.elements.windSpeed.textContent = UTILS.formatWindSpeed(current.windSpeed);
        this.elements.uvIndex.textContent = `${current.uvIndex} (${UTILS.getUVDescription(current.uvIndex)})`;
        this.elements.chanceOfRain.textContent = `${current.cloudCover}%`;
    }

    // Display forecast data
    displayForecast(data) {
        const { forecast } = data;
        
        // Display hourly forecast (next 24 hours)
        this.displayHourlyForecast(forecast.forecastday[0].hour);
        
        // Display daily forecast
        this.displayDailyForecast(forecast.forecastday);
    }

    // Display hourly forecast
    displayHourlyForecast(hourlyData) {
        const currentHour = new Date().getHours();
        const next24Hours = hourlyData.slice(currentHour).concat(
            hourlyData.slice(0, currentHour)
        ).slice(0, 24);
        
        this.elements.hourlyContainer.innerHTML = '';
        
        next24Hours.forEach((hour, index) => {
            const hourElement = document.createElement('div');
            hourElement.className = 'hourly-item';
            
            const timeLabel = index === 0 ? 'Now' : UTILS.formatTime(hour.time);
            
            hourElement.innerHTML = `
                <div class="hourly-time">${timeLabel}</div>
                <img src="https:${hour.icon}" alt="${hour.condition}" class="hourly-icon">
                <div class="hourly-temp">${UTILS.formatTemperature(hour.temp)}</div>
                <div class="hourly-desc">${hour.condition}</div>
            `;
            
            this.elements.hourlyContainer.appendChild(hourElement);
        });
    }

    // Display daily forecast
    displayDailyForecast(dailyData) {
        this.elements.dailyContainer.innerHTML = '';
        
        dailyData.forEach((day, index) => {
            const dayElement = document.createElement('div');
            dayElement.className = 'daily-item';
            
            const dayLabel = UTILS.formatDay(day.date);
            
            dayElement.innerHTML = `
                <div class="daily-day">${dayLabel}</div>
                <img src="https:${day.day.icon}" alt="${day.day.condition}" class="daily-icon">
                <div class="daily-desc">${day.day.condition}</div>
                <div class="daily-temps">
                    <span class="daily-high">${UTILS.formatTemperature(day.day.maxTemp)}</span>
                    <span class="daily-low">${UTILS.formatTemperature(day.day.minTemp)}</span>
                </div>
            `;
            
            this.elements.dailyContainer.appendChild(dayElement);
        });
    }

    // Display weather alerts
    displayWeatherAlerts(alerts) {
        if (alerts.length === 0) {
            this.elements.alertsSection.style.display = 'none';
            return;
        }
        
        // Show the first alert (most important)
        const alert = alerts[0];
        this.elements.alertMessage.textContent = alert.headline || alert.description;
        this.elements.alertsSection.style.display = 'block';
        
        // Auto-dismiss after configured time
        setTimeout(() => {
            this.closeAlert();
        }, ALERT_CONFIG.AUTO_DISMISS);
    }

    // Close weather alert
    closeAlert() {
        this.elements.alertsSection.style.display = 'none';
    }

    // Show loading state
    showLoading() {
        this.elements.loadingState.style.display = 'block';
        this.elements.errorState.style.display = 'none';
        this.elements.currentWeather.style.display = 'none';
        this.elements.hourlyForecast.style.display = 'none';
        this.elements.dailyForecast.style.display = 'none';
    }

    // Show weather data
    showWeatherData() {
        this.elements.loadingState.style.display = 'none';
        this.elements.errorState.style.display = 'none';
        this.elements.currentWeather.style.display = 'block';
        this.elements.hourlyForecast.style.display = 'block';
        this.elements.dailyForecast.style.display = 'block';
    }

    // Show error state
    showError(message) {
        this.elements.loadingState.style.display = 'none';
        this.elements.currentWeather.style.display = 'none';
        this.elements.hourlyForecast.style.display = 'none';
        this.elements.dailyForecast.style.display = 'none';
        this.elements.errorState.style.display = 'block';
        this.elements.errorMessage.textContent = message;
    }

    // Setup auto-refresh
    setupAutoRefresh() {
        setInterval(() => {
            if (this.currentLocation && !this.isLoading) {
                console.log('Auto-refreshing weather data...');
                this.loadWeatherData(this.currentLocation);
            }
        }, APP_SETTINGS.REFRESH_INTERVAL);
    }

    // Public method to refresh weather data
    refreshWeather() {
        if (this.currentLocation) {
            this.loadWeatherData(this.currentLocation);
        }
    }

    // Public method to change units
    changeUnits(newUnits) {
        Object.assign(APP_SETTINGS.UNITS, newUnits);
        if (this.currentLocation) {
            this.loadWeatherData(this.currentLocation);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});

// Global error handler for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.weatherApp) {
        window.weatherApp.showError('An unexpected error occurred. Please try again.');
    }
});

// Service Worker registration (for offline support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}