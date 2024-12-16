document.addEventListener("DOMContentLoaded", () => {
    const dailyForecastContainer = document.getElementById("daily-forecast-container");
    const currentWeatherCard = document.getElementById("current-weather-card");
    const cityInput = document.getElementById("city-input");
    const searchButton = document.getElementById("search-button");
    const autocompleteList = document.getElementById("autocomplete-list");
    const themeToggle = document.getElementById("theme-toggle");
    const clockDisplay = document.getElementById("clock");

    const apiKey = "d4bac581aee6e8976c3822422c2835ee"; // OpenWeatherMap API Key

    // Load the user's theme preference from local storage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.body.classList.add(savedTheme);
    }

    const toggleTheme = () => {
        document.body.classList.toggle("dark-mode");
        const currentTheme = document.body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";
        localStorage.setItem("theme", currentTheme); // Save the user's theme preference
        themeToggle.textContent = currentTheme === "dark-mode" ? "☀️" : "🌙"; // Change button text based on theme
    };

    themeToggle.addEventListener("click", toggleTheme);

    const getDayName = (dateString) => {
        const days = ["Pirmadienis", "Antradienis", "Trečiadienis", "Ketvirtadienis", "Penktadienis"];
        return days[new Date(dateString).getDay() - 1]; // Adjusted to remove Saturday and Sunday
    };

    const formatTime = (dateString) => {
        const time = new Date(dateString).toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" });
        return time.slice(0, 5); // Return hours and minutes only
    };

    const fetchWeather = (city) => {
        const apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                const cityName = data.city.name;
                const country = data.city.country;

                // Display current weather with "feels like"
                currentWeatherCard.innerHTML = 
                    `<h3>${cityName}, ${country}</h3>
                    <div>
                        <img src="https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png" alt="weather icon">
                        <p>${data.list[0].main.temp.toFixed(1)}°C</p>
                        <p>Jaučiasi kaip: ${data.list[0].main.feels_like.toFixed(1)}°C</p>
                    </div>
                    <div class="additional-info">
                        <div class="icon">
                            <img src="https://img.icons8.com/dotty/80/rainmeter.png" alt="humidity"/>
                            <p>${data.list[0].main.humidity}%</p>
                        </div>
                    </div>`;

                // Display daily forecast (excluding Saturday and Sunday)
                dailyForecastContainer.innerHTML = "";
                data.list.forEach((entry, index) => {
                    if (index % 8 === 0) { // Every 8th entry is a new day
                        const dayName = getDayName(entry.dt_txt);
                        if (!dayName) return; // Skip Saturday and Sunday
                        const dayIcon = entry.weather[0].icon;
                        const dayTemp = entry.main.temp;

                        const dayCard = document.createElement("div");
                        dayCard.classList.add("day-card");
                        dayCard.innerHTML = 
                            `<h3>${dayName}</h3>
                            <img src="https://openweathermap.org/img/wn/${dayIcon}@2x.png" alt="${dayName} icon">
                            <p>${dayTemp.toFixed(1)}°C</p>`;

                        // Show hourly forecast on click
                        dayCard.addEventListener("click", () => {
                            const hourlyForecast = data.list.filter(hour => hour.dt_txt.startsWith(entry.dt_txt.split(" ")[0]));
                            const hourlyDetails = hourlyForecast.map(hour => 
                                `<div class="icon">
                                    <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="hourly weather icon">
                                    <p>${formatTime(hour.dt_txt)}: ${hour.main.temp.toFixed(1)}°C</p>
                                </div>`
                            ).join("");

                            const modal = document.createElement("div");
                            modal.classList.add("modal");
                            modal.innerHTML = 
                                `<div class="modal-content">
                                    <span class="close">&times;</span>
                                    <h3>${dayName}</h3>
                                    ${hourlyDetails}
                                </div>`;
                            document.body.appendChild(modal);

                            const closeModal = modal.querySelector(".close");
                            closeModal.addEventListener("click", () => {
                                modal.remove();
                            });
                        });

                        dailyForecastContainer.appendChild(dayCard);
                    }
                });
            });
    };

    const fetchCities = (query) => {
        const apiURL = `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&units=metric&appid=${apiKey}`;
        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                autocompleteList.innerHTML = "";
                data.list.forEach(city => {
                    const listItem = document.createElement("div");
                    listItem.classList.add("autocomplete-item");
                    listItem.textContent = `${city.name}, ${city.sys.country}`;
                    listItem.addEventListener("click", () => {
                        cityInput.value = `${city.name}, ${city.sys.country}`;
                        fetchWeather(city.name);
                        autocompleteList.innerHTML = "";
                    });
                    autocompleteList.appendChild(listItem);
                });
            });
    };

    cityInput.addEventListener("input", () => {
        const query = cityInput.value;
        if (query.length >= 3) {
            fetchCities(query);
            autocompleteList.style.display = "block";
        } else {
            autocompleteList.style.display = "none";
        }
    });

    searchButton.addEventListener("click", () => {
        fetchWeather(cityInput.value);
    });

    // Clock Functionality
    const updateClock = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const seconds = now.getSeconds().toString().padStart(2, "0");
        clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    };

    // Update clock every second
    setInterval(updateClock, 1000);
    updateClock(); // Initial call to display clock immediately
});
