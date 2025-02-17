const apiKey = '';

let tempChart;

async function fetchWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) return alert('Unesite naziv grada!');

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();

        if (data.cod !== 200) {
            alert('Grad nije pronađen!');
            return;
        }

        // Osnovne informacije
        document.getElementById('cityName').innerText = data.name;
        document.getElementById('temperature').innerText = `${Math.round(data.main.temp)}°C`;
        document.getElementById('description').innerText = data.weather[0].description;
        
        // Vremenska ikonica
        const weatherIcon = document.getElementById('weatherIcon');
        const iconCode = data.weather[0].icon;
        weatherIcon.className = getWeatherIcon(iconCode);

        // Detalji
        document.getElementById('wind').innerText = `${data.wind.speed} km/h`;
        document.getElementById('rainChance').innerText = `${data.rain ? data.rain['1h'] + '%' : '0%'}`;
        document.getElementById('uvIndex').innerText = `${data.uvi} UV`;
        document.getElementById('humidity').innerText = `${data.main.humidity}%`;

        fetchForecast(city);
    } catch (error) {
        console.error('Greška pri dohvaćanju podataka:', error);
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
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();

        const forecastElement = document.getElementById('forecast');
        forecastElement.innerHTML = '';

        const tempData = []; // Ostavite samo niz za temperaturu
        const labels = []; // Niz za oznake

        for (let i = 0; i < 5; i++) {
            const item = data.list[i * 8]; // Uzimamo podatke na svakih 8 sati
            const day = new Date(item.dt_txt).toLocaleDateString('sr-RS', { 
                weekday: 'long',
                month: 'short', 
                day: 'numeric' 
            });

            labels.push(day); // Dodajte dan u oznake
            tempData.push(Math.round(item.main.temp)); // Dodajte podatke o temperaturi

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

        // Inicijalizacija grafika
        const ctxTemp = document.getElementById('tempChart').getContext('2d');

        // Uništavanje prethodnog grafika ako postoji
        if (tempChart) {
            tempChart.destroy();
        }

        // Graf za temperaturu
        tempChart = new Chart(ctxTemp, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: tempData,
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    tension: 0.1,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Dan'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Greška u prognozi:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    document.getElementById('toggleSidebar').addEventListener('click', function() {
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed'); // Otvorite sidebar
        } else {
            sidebar.classList.add('collapsed'); // Zatvorite sidebar
        }
    });
});