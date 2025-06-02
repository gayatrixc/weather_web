// OpenWeather API key
const apiKey = "3ed96b0be01c9e9b8372c7d2826fe6e4";
let city = "Hyderabad";

// Function to fetch current weather
async function fetchWeather() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    // Update current weather
    document.getElementById("temp").textContent = Math.round(data.main.temp) + "°C";
    document.getElementById("condition").textContent = data.weather[0].main;
    document.getElementById("description").textContent =
      data.weather[0].description;
    document.getElementById("location").textContent = data.name;
    document.getElementById(
      "weather-icon"
    ).src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    const lat = data.coord.lat;
    const lon = data.coord.lon;

    updateHumidity(data.main.humidity);
    updateWindInfo(data.wind.speed, data.wind.deg);
    fetchAirQuality(lat, lon);
    updateSunriseSunset(data.sys.sunrise, data.sys.sunset);
  } catch (error) {
    console.error("Weather Error:", error);
    alert("Weather data could not be retrieved. Please check the city name.");
  }
}

// Function to fetch 5-day forecast
async function fetchForecast() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    const dailyForecasts = {};
    data.list.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "long" });

      if (!dailyForecasts[day]) {
        dailyForecasts[day] = {
          day,
          icon: forecast.weather[0].icon,
          temps: [],
        };
      }

      dailyForecasts[day].temps.push(forecast.main.temp);
    });

    const forecasts = Object.values(dailyForecasts).slice(1, 6);
    const cards = document.querySelectorAll(".forecast-card");

    forecasts.forEach((forecast, index) => {
      if (cards[index]) {
        const minTemp = Math.round(Math.min(...forecast.temps));
        const maxTemp = Math.round(Math.max(...forecast.temps));

        cards[index].querySelector(".forecast-day").textContent = forecast.day;
        cards[index].querySelector(
          ".forecast-icon"
        ).src = `https://openweathermap.org/img/wn/${forecast.icon}@2x.png`;
        cards[index].querySelector(
          ".forecast-temp-low"
        ).textContent = `${minTemp}°`;
        cards[index].querySelector(
          ".forecast-temp-high"
        ).textContent = `${maxTemp}°`;
      }
    });
  } catch (error) {
    console.error("Forecast Error:", error);
  }
}

// Update humidity bar
function updateHumidity(humidity) {
  document.getElementById("humidity-value").textContent = `${humidity}`;
  document.getElementById("humidity-bar").style.width = `${humidity}%`;

  let color = "bg-green-400";
  let text = "Comfortable";

  if (humidity < 30) {
    color = "bg-yellow-500";
    text = "Low";
  } else if (humidity > 65) {
    color = "bg-blue-500";
    text = "High";
  }

  document.getElementById("humidity-bar").className =
    `${color} h-2.5 rounded-full transition-all duration-300`;
  document.getElementById("humidity-text").textContent = text;
}

// Update Wind Information
function updateWindInfo(speed, degree) {
  const speedKmh = Math.round(speed * 3.6);
  document.getElementById("wind-speed").textContent = speedKmh;

  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
  ];
  const index = Math.round(degree / 22.5) % 16;

  document.getElementById("wind-direction").textContent = directions[index];
  document.getElementById("wind-arrow").style.transform = `rotate(${degree}deg)`;
  document.getElementById("wind-arrow").style.transition = `transform 0.3s`;
}

// Fetch Air Quality Index
async function fetchAirQuality(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const data = await response.json();
    const aqi = data.list[0].main.aqi;

    const aqiConfig = {
      1: { text: "Good", color: "bg-green-500", width: "20%" },
      2: { text: "Fair", color: "bg-yellow-300", width: "40%" },
      3: { text: "Moderate", color: "bg-orange-400", width: "60%" },
      4: { text: "Poor", color: "bg-red-500", width: "80%" },
      5: { text: "Very Poor", color: "bg-purple-700", width: "100%" },
    };

    const { text, color, width } = aqiConfig[aqi] || aqiConfig[1];

    document.getElementById("aqi-value").textContent = aqi;
    document.getElementById("aqi-text").textContent = text;
    document.getElementById("aqi-bar").className =
      `${color} h-2.5 rounded-full transition-all duration-300`;
    document.getElementById("aqi-bar").style.width = width;
  } catch (error) {
    console.error("Air Quality Error:", error);
  }
}

// Update Sunrise and Sunset
function updateSunriseSunset(sunrise, sunset) {
  const sunriseTime = new Date(sunrise * 1000);
  const sunsetTime = new Date(sunset * 1000);

  document.getElementById("sunrise").textContent = sunriseTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  document.getElementById("sunset").textContent = sunsetTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Search Function
function performSearch() {
  const query = document.getElementById("search-input").value.trim();
  if (query.length > 0) {
    city = query;
    fetchWeather();
    fetchForecast();
    document.getElementById("search-input").value = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchWeather();
  fetchForecast();
});
