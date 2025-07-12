# ⛅ Weather Web App

A modern, responsive weather web application that provides real-time weather information, forecasts, and weather alerts for any location worldwide. The app features search suggestions, recent searches, and offline support via a service worker.

## ✨ Features

- 🌡️ **Current Weather:** View up-to-date weather conditions for any city or your current location.
- 📅 **7-Day Forecast:** Detailed daily and hourly forecasts.
- 🚨 **Weather Alerts:** Displays weather warnings and advisories.
- 🔍 **Search Suggestions:** Smart search with suggestions and recent searches.
- 📱 **Responsive Design:** Optimized for desktop and mobile devices.
- 📴 **Offline Support:** Works offline using a service worker and cache.
- ⚙️ **Customizable Units:** Switch between Celsius/Fahrenheit, km/h/mph, and km/miles.

## 🛠️ Technologies Used

- 📝 HTML5, CSS3 (with responsive design)
- 💻 JavaScript (ES6+)
- ☁️ [WeatherAPI.com](https://www.weatherapi.com/) for weather data
- 🎨 Font Awesome for icons
- 🛡️ Service Worker for offline support

## 🚀 Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/weather-web.git
   cd weather-web
   ```

2. **API Key:**
- The app uses [WeatherAPI.com](https://www.weatherapi.com/) for weather data.
- Replace the `API_KEY` in `config.js` with your own key if needed.

3. **Run Locally:**
- Open `index.html` in your browser.
- For full offline support and service worker functionality, use a local server (e.g., VS Code Live Server, Python's `http.server`, etc.).

4. **Build & Deploy:**
- No build step required. Deploy the contents of the folder to any static web host.

## File Structure

Each file serves a specific purpose to keep the project organized and maintainable.  
- **index.html**: The entry point of the app  
- **styles.css**: All styles and responsive design  
- **config.js**: API keys, endpoints, and utility functions  
- **weather.js**: Handles API calls and weather data processing  
- **app.js**: Manages UI, events, and app logic  
- **sw.js**: Enables offline support and caching  
- **README.md** – Project documentation

```
weather-web/
├── 📄 [index.html]          # Main HTML file
├── 🎨 [styles.css]          # App styling
├── ⚙️  [config.js]          # Configuration and utility functions
├── 🌦️  [weather.js]         # Weather API and data processing logic
├── 🖥️  [app.js]             # Main application logic and UI handling
├── 🛡️  [sw.js]              # Service Worker for offline support
└── 📖 [README.md]           # Project documentation
```

## 📬 Contact

For questions, feedback, or contributions, feel free to reach out:

- **GitHub:** [mahi-0012](https://github.com/mahi-0012)
- **Email:** cmaheshkumarguptha@gmail.com

---

**Enjoy using the Weather Web App!**