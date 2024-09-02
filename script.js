const apiKey = '32885c3e9bb85bf1bd7d286f6f1b78c7';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function searchLocation() {
    const query = document.getElementById('cityInput').value;
    fetchWeatherData(query);
}

function fetchWeatherData(location, isFavorite = false) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data not found');
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather data:', data);
            updateWeatherCard(data, isFavorite);
            if (!isFavorite) {
                fetchForecast(data.coord.lat, data.coord.lon);
            }
            updateBackground(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Weather data not found. Please try again.');
        });
}

function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data not found');
            }
            return response.json();
        })
        .then(data => {
            console.log('Current location weather data:', data);
            updateCurrentLocationWeather(data);
            fetchForecast(lat, lon);
            updateBackground(data);
        })
        .catch(error => {
            console.error('Error fetching current location weather data:', error);
            alert('Unable to fetch weather for your current location. Please try searching for a city.');
        });
}

function updateCurrentLocationWeather(data) {
    document.getElementById('currentLocation').textContent = `My Location (${data.name})`;
    document.getElementById('currentTemp').textContent = `${Math.round(data.main.temp)}°`;
    document.getElementById('currentCondition').textContent = data.weather[0].description;
    document.getElementById('highLow').textContent = `H:${Math.round(data.main.temp_max)}° L:${Math.round(data.main.temp_min)}°`;
}

function updateWeatherCard(data, isFavorite = false) {
    const locationCards = document.getElementById('locationCards');
    const card = document.createElement('div');
    card.className = 'location-card';
    card.innerHTML = `
        <h3>${data.name}</h3>
        <p>${Math.round(data.main.temp)}°C</p>
        <p>${data.weather[0].description}</p>
        ${isFavorite 
            ? `<button onclick="removeFromFavorites('${data.name}')">Remove from Favorites</button>`
            : `<button onclick="addToFavorites('${data.name}', ${data.coord.lat}, ${data.coord.lon})">Add to Favorites</button>`
        }
    `;
    locationCards.prepend(card);
}

function fetchForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast data not found');
            }
            return response.json();
        })
        .then(data => {
            console.log('Forecast data:', data);
            updateHourlyForecast(data.hourly);
            updateTenDayForecast(data.daily);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            alert('Forecast data not found. Please try again.');
        });
}

function updateHourlyForecast(hourlyData) {
    const hourlyForecast = document.getElementById('hourlyForecast');
    hourlyForecast.innerHTML = '<h3>Hourly Forecast</h3>';
    hourlyData.slice(0, 6).forEach(hour => {
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <p>${new Date(hour.dt * 1000).getHours()}:00</p>
            <i class="wi wi-owm-${hour.weather[0].id}"></i>
            <p>${Math.round(hour.temp)}°</p>
        `;
        hourlyForecast.appendChild(hourlyItem);
    });
}

function updateTenDayForecast(dailyData) {
    const tenDayForecast = document.getElementById('tenDayForecast');
    tenDayForecast.innerHTML = '<h3>10-Day Forecast</h3>';
    dailyData.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <span>${new Date(day.dt * 1000).toLocaleDateString('en-US', {weekday: 'short'})}</span>
            <i class="wi wi-owm-${day.weather[0].id}"></i>
            <span>${Math.round(day.temp.min)}° - ${Math.round(day.temp.max)}°</span>
        `;
        tenDayForecast.appendChild(forecastItem);
    });
}

function addToFavorites(location, lat, lon) {
    const favorite = { location, lat, lon };
    if (!favorites.some(fav => fav.location === location)) {
        favorites.push(favorite);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavorites();
    }
}

function removeFromFavorites(location) {
    favorites = favorites.filter(fav => fav.location !== location);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavorites();
}

function updateFavorites() {
    const locationCards = document.getElementById('locationCards');
    locationCards.innerHTML = '<h2>Favorite Locations</h2>';
    favorites.forEach(fav => {
        fetchWeatherData(fav.location, true);
    });
}

function createClouds() {
    const cloudsContainer = document.getElementById('clouds');
    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.top = `${Math.random() * 100}%`;
        cloud.style.left = `${Math.random() * 100}%`;
        cloud.style.width = `${50 + Math.random() * 100}px`;
        cloud.style.height = `${30 + Math.random() * 60}px`;
        cloud.style.animationDuration = `${30 + Math.random() * 20}s`;
        cloudsContainer.appendChild(cloud);
    }
}

function updateBackground(data) {
    const now = new Date();
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    const isDayTime = now >= sunrise && now < sunset;

    if (isDayTime) {
        document.body.classList.add('day');
        document.body.classList.remove('night');
    } else {
        document.body.classList.add('night');
        document.body.classList.remove('day');
    }
}

window.onload = function() {
    updateFavorites();
    createClouds();
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        }, function(error) {
            console.error("Error getting geolocation:", error);
            alert("Unable to get your current location. Please search for a city manually.");
        });
    } else {
        console.log("Geolocation is not available");
        alert("Geolocation is not supported by your browser. Please search for a city manually.");
    }
};