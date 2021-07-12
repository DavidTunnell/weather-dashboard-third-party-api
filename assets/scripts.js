//this would normally be obfuscated
var apiKey = "7d5f132842d59d170c3c85b09a262256";

//DOM elements
var jumboHeaderEl = document.querySelector(".jumbo-header");
var jumboIconEl = document.querySelector(".jumbo-icon");
var jumboTempEl = document.querySelector(".jumbo-temp");
var jumboWindEl = document.querySelector(".jumbo-wind");
var jumboHumidityEl = document.querySelector(".jumbo-humidity");
var jumboUvEl = document.querySelector(".jumbo-uv");
var cardRows = document.querySelector(".card-rows");

//on page load ask the user for their location a populate data based on geolocation
function onLoad() {
    //https://stackoverflow.com/questions/6033561/geolocation-zip-code/42350178
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(a) {
            if (a.coords) {
                //get lat and long coordinates
                var lat = a.coords.latitude;
                var long = a.coords.longitude;
                //get data from both APIs since onecall doesn't have city name
                var cityRes = getCityName(lat, long, apiKey);
                //https://stackoverflow.com/questions/14220321/how-to-return-the-response-from-an-asynchronous-call
                cityRes.then((dataFromForecastApi) => {
                    var weatherObject = getWeatherByGeolocation(lat, long, apiKey);
                    weatherObject.then((dataFromOneCallApi) => {
                        //use data to populate page by default
                        populateForecast(dataFromForecastApi.city.name, dataFromOneCallApi);
                    });
                });
            }
        });
    } else {
        //if the users browser doesn't support geolocation they won't get a default 
        alert('Browser geolocation is not supported. Please enter a city or zip code.');
    }
}

async function getWeatherByGeolocation(geoLat, geoLong, apiKey) {
    var consCoords = "https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" +
        geoLat + "&lon=" +
        geoLong + "&appid=" + apiKey;

    const response = await fetch(consCoords).then(response => {
        return response.json();
    });
    return response;
}

// function getWeatherByZipCode(zipCode, apiKey) {
//     var consZip = "https://api.openweathermap.org/data/2.5/onecall?units=imperial&zip=" +
//         zipCode + "&appid=" + apiKey;

//     fetch(consZip).then(response => {
//         return response.json();
//     }).then(function(response) {
//         console.log(response);
//         //call new function here to populate data
//     });
// }

// function getWeatherByCityName(cityName, apiKey) {
//     var consCity = "https://api.openweathermap.org/data/2.5/onecall?units=imperial&q=" +
//         cityName + "&appid=" + apiKey;

//     fetch(consCity).then(response => {
//         return response.json();
//     }).then(function(response) {
//         console.log(response);
//         //call new function here to populate data
//     });
// }

async function getCityName(geoLat, geoLong, apiKey) {
    var consCoords = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=" +
        geoLat + "&lon=" +
        geoLong + "&appid=" + apiKey;

    const response = await fetch(consCoords).then(response => {
        return response.json();
    });
    return response;
}

function getWeatherIcon(iconCode) {
    return "http://openweathermap.org/img/w/" + iconCode + ".png";
}

function populateForecast(cityName, jsonObject) {
    console.log(jsonObject);
    jumboHeaderEl.innerHTML = cityName + " - " + moment.unix(jsonObject.current.dt).format("MM/DD/YYYY");
    jumboIconEl.src = getWeatherIcon(jsonObject.current.weather[0].icon);
    jumboTempEl.innerHTML = jsonObject.current.temp;
    jumboWindEl.innerHTML = jsonObject.current.wind_speed;
    jumboHumidityEl.innerHTML = jsonObject.current.humidity;
    var currentUvi = jsonObject.current.uvi;
    jumboUvEl.innerHTML = currentUvi;
    if (currentUvi < 3) {
        jumboUvEl.classList.add("btn-success");
    } else if (currentUvi < 7) {
        jumboUvEl.classList.add("btn-warning");
    } else {
        jumboUvEl.classList.add("btn-danger");
    }
    for (let i = 1; i < 6; i++) {
        cardRows.innerHTML += "<div class='col-sm-2 bg-primary cards'><h4>" +
            moment.unix(jsonObject.daily[i].dt).format("MM/DD/YYYY") +
            "</h4><img src='" + getWeatherIcon(jsonObject.daily[i].weather[0].icon) +
            "'><p>Temp: " + jsonObject.daily[i].temp.day + "°F</p><p>Wind: " +
            jsonObject.daily[i].wind_speed + " MPH</p><p>Humidity: " +
            jsonObject.daily[i].humidity + "</p></div>";
    }
}

onLoad();