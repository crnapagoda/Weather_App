const apiKey = ''; 

let tempChart;
let cityHistory = JSON.parse(localStorage.getItem('cityHistory')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarButton = document.getElementById('toggleSidebar');
    if (toggleSidebarButton) {
        toggleSidebarButton.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
    getLocation();
    displayHistory();
});

async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
                );
                const data = await response.json();
                updateWeatherUI(data);
                fetchForecast(data.name);
            } catch (error) {
                console.error('Greška pri dohvaćanju podataka:', error);
                alert('Došlo je do greške pri dohvaćanju podataka. Molimo pokušajte ponovo kasnije.');
            }
        });
    } else {
        alert('Geolokacija nije podržana u ovom pretraživaču.');
    }
}

async function fetchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return alert('Unesite naziv grada!');

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();

        if (data.cod !== 200) {
            alert('Grad nije pronađen!');
            return;
        }

        updateWeatherUI(data);
        fetchForecast(city);
        addToHistory(city);
    } catch (error) {
        console.error('Greška pri dohvaćanju podataka:', error);
        alert('Došlo je do greške pri dohvaćanju podataka. Molimo pokušajte ponovo kasnije.');
    }
}

function updateWeatherUI(data) {
    const cityName = document.getElementById('cityName');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const weatherIcon = document.getElementById('weatherIcon');
    const wind = document.getElementById('wind');
    const rainChance = document.getElementById('rainChance');
    const uvIndex = document.getElementById('uvIndex');
    const humidity = document.getElementById('humidity');

    if (cityName) cityName.innerText = data.name;
    if (temperature) temperature.innerText = `${Math.round(data.main.temp)}°C`;
    if (description) description.innerText = data.weather[0].description;
    if (weatherIcon) weatherIcon.className = getWeatherIcon(data.weather[0].icon);
    if (wind) wind.innerText = `${data.wind.speed} km/h`;
    if (rainChance) rainChance.innerText = `${data.rain ? data.rain['1h'] + '%' : '0%'}`;
    if (uvIndex) uvIndex.innerText = `${data.uvi} UV`;
    if (humidity) humidity.innerText = `${data.main.humidity}%`;

    // Update detail cards inside weatherResult
    const weatherResult = document.getElementById('weatherResult');
    const weatherDetails = document.createElement('div');
    
    weatherResult.appendChild(weatherDetails);

    // Move today-highlight-card inside weatherResult
    const todayHighlightCard = document.querySelector('.today-highlight-card');
    if (todayHighlightCard) {
        weatherResult.appendChild(todayHighlightCard);
    }
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fa-solid fa-sun',
        '01n': 'fa-solid fa-moon',
        '02d': 'fa-solid fa-cloud-sun',
        '02n': 'fa-solid fa-cloud-moon',
        '03d': 'fa-solid fa-cloud',
        '03n': 'fa-solid fa-cloud',
        '04d': 'fa-solid fa-cloud-meatball',
        '04n': 'fa-solid fa-cloud-meatball',
        '09d': 'fa-solid fa-cloud-rain',
        '09n': 'fa-solid fa-cloud-rain',
        '10d': 'fa-solid fa-cloud-sun-rain',
        '10n': 'fa-solid fa-cloud-moon-rain',
        '11d': 'fa-solid fa-bolt',
        '11n': 'fa-solid fa-bolt',
        '13d': 'fa-solid fa-snowflake',
        '13n': 'fa-solid fa-snowflake',
        '50d': 'fa-solid fa-smog',
        '50n': 'fa-solid fa-smog'
    };
    return iconMap[iconCode] || 'fa-solid fa-question';
}

async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();

        updateForecastUI(data);
    } catch (error) {
        console.error('Greška u prognozi:', error);
        alert('Došlo je do greške pri dohvaćanju prognoze. Molimo pokušajte ponovo kasnije.');
    }
}

function updateForecastUI(data) {
    const forecastElement = document.getElementById('forecast');
    forecastElement.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const item = data.list[i * 8];
        const day = new Date(item.dt_txt).toLocaleDateString('sr-RS', { 
            weekday: 'long',
            month: 'short', 
            day: 'numeric' 
        });

        const div = document.createElement('div');
        div.classList.add('forecast-item');
        div.innerHTML = `
            <p>${day}</p>
            <i class="${getWeatherIcon(item.weather[0].icon)}"></i>
            <p>${Math.round(item.main.temp)}°C</p>
            <p>${item.weather[0].description}</p>
        `;
        forecastElement.appendChild(div);
    }
}

function addToHistory(city) {
    if (!cityHistory.includes(city)) {
        cityHistory.push(city);
        localStorage.setItem('cityHistory', JSON.stringify(cityHistory));
        displayHistory();
    }
}

function displayHistory() {
    const historyElement = document.getElementById('history');
    historyElement.innerHTML = '';
    cityHistory.forEach(city => {
        const div = document.createElement('div');
        div.classList.add('history-item');
        div.innerText = city;
        div.onclick = () => {
            document.getElementById('cityInput').value = city;
            fetchWeather();
        };
        historyElement.appendChild(div);
    });
}