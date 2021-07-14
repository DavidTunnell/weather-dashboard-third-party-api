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
var inputGroup = document.querySelector(".input-group");
var submitButton = document.querySelector(".submit-button");
var navMenu = document.querySelector(".nav-pills");
var yearCrEl = document.querySelector(".current-year");
var userInputFieldEl = document.querySelector(".form-control");

//max search history
var maxNumberOfMenuItems = 8;

//set year in DOM footer
yearCrEl.innerHTML = moment().year();

//event listeners for both enter and button press
//enter pressed by user in input
inputGroup.addEventListener("keyup", function(event) {
    if (event.key === 'Enter') {
        var userInputControl = event.target;
        userEntryAction(userInputControl);
    }
});

//search button pressed by user
submitButton.addEventListener("click", function(event) {
    var userInputControl = event.target.parentNode.parentNode.parentNode.querySelector('.form-control');
    userEntryAction(userInputControl);
});

//search history event listener
navMenu.addEventListener("click", function(event) {
    var lat = event.target.parentNode.dataset.lat;
    var lon = event.target.parentNode.dataset.lon;
    //if undefined then user didn't click button (clicked parent)
    if (lat) {
        getWeatherAndCityThenLoad(lat, lon, apiKey);
        cardRows.innerHTML = "";
        userInputFieldEl.classList.remove("invalid");
        userInputFieldEl.placeholder = "Search City Name...";
    }
});

//functionality of the user entry
function userEntryAction(userInput) {
    addCity(userInput.value);
    userInput.value = "";
    userInputFieldEl.classList.remove("invalid");
    userInputFieldEl.placeholder = "Search City Name...";
}

//add a city to the DOM and local storage, update the object array if it goes over the max allowed
function addCity(cityUserEntry) {
    var coords = getCoordinates(cityUserEntry, apiKey);
    //get data needed to add to DOM and local storage
    coords.then((data) => {
        if (data) {
            //create object to add to local storage array
            var cityObject = {
                name: cityUserEntry,
                lat: data.city.coord.lat,
                lon: data.city.coord.lon
            };
            //create HTML to insert
            var listHtml = "<li class='active' data-lat='" + cityObject.lat + "' data-lon='" +
                cityObject.lon + "'><a>" + cityObject.name + "</a></li>";
            //add to DOM at the beginning of the element
            navMenu.insertAdjacentHTML("afterbegin", listHtml);
            //if the max number is reached, remove the last item from the DOM
            if (navMenu.children.length == maxNumberOfMenuItems + 1) {
                navMenu.children[maxNumberOfMenuItems].remove();
            }
            //add to local storage
            // Parse any JSON previously stored in allEntries
            var existingEntries = JSON.parse(localStorage.getItem("allSavedCities"));
            if (existingEntries == null) {
                existingEntries = [];
            }
            if (existingEntries.length >= maxNumberOfMenuItems) {
                //if >= maxNumberOfMenuItems remove one before adding
                existingEntries.pop();
            }
            //add to beginning of array
            existingEntries.unshift(cityObject);
            // Save array back to local storage
            localStorage.setItem("allSavedCities", JSON.stringify(existingEntries));
            cardRows.innerHTML = "";
            //also load weather data in DOM
            getWeatherAndCityThenLoad(cityObject.lat, cityObject.lon, apiKey);
        }
    });
}

//add elements from local storage to DOM
function populateMenu() {
    var existingEntries = JSON.parse(localStorage.getItem("allSavedCities"));
    if (existingEntries != null) {
        for (let i = 0; i < existingEntries.length; i++) {
            navMenu.innerHTML += "<li class='active' data-lat='" + existingEntries[i].lat + "' data-lon='" +
                existingEntries[i].lon + "'><a>" + existingEntries[i].name + "</a></li>";
        }
    }
}

//on page load ask the user for their location a populate data based on geolocation and get weather
function onLoad() {
    //https://stackoverflow.com/questions/6033561/geolocation-zip-code/42350178
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(a) {
            if (a.coords) {
                //get lat and long coordinates
                var lat = a.coords.latitude;
                var long = a.coords.longitude;
                getWeatherAndCityThenLoad(lat, long, apiKey)
            }
        });
    } else {
        //if the users browser doesn't support geolocation they won't get a default 
        alert('Browser geolocation is not supported. Please enter a city or zip code.');
    }
    //populate the menu if it exists from local storage
    populateMenu();
}

//get the weather, city name and load to DOM 
function getWeatherAndCityThenLoad(lat, long, apiKey) {
    //get data from both APIs since one call doesn't have city name
    var cityRes = getCityName(lat, long, apiKey);
    //https://stackoverflow.com/questions/14220321/how-to-return-the-response-from-an-asynchronous-call
    cityRes.then((dataFromForecastApi) => {
        var weatherObject = getWeatherByGeolocation(lat, long, apiKey);
        weatherObject.then((dataFromOneCallApi) => {
            //use data to populate page by default
            populateForecast(dataFromForecastApi, dataFromOneCallApi);
        });
    });
}

//get weather using latitude and longitude
async function getWeatherByGeolocation(geoLat, geoLong, apiKey) {
    var consCoords = "https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" +
        geoLat + "&lon=" +
        geoLong + "&appid=" + apiKey;
    const response = await fetch(consCoords).then(response => {
        return response.json();
    });
    return response;
}

//get city name from lat and lon
//one call doesn't appear to have a city name so getting it here
async function getCityName(geoLat, geoLong, apiKey) {
    var consCoords = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=" +
        geoLat + "&lon=" +
        geoLong + "&appid=" + apiKey;
    const response = await fetch(consCoords).then(response => {
        if (response.ok) {
            return response.json();
        }
    });
    return response.city.name;
}

//get coordinates via city name
async function getCoordinates(cityName, apiKey) {
    var consCoords = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=" + cityName +
        "&appid=" + apiKey;
    const response = await fetch(consCoords).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            //user entry validation
            userInputFieldEl.classList.add("invalid");
            userInputFieldEl.placeholder = "Enter Valid City (" + response.status + ")";
        }
    });
    return response;
}

//generate URL for weather icon from open weather map
function getWeatherIcon(iconCode) {
    return "http://openweathermap.org/img/w/" + iconCode + ".png";
}

//populate the DOM with the forecast requested
function populateForecast(cityName, jsonObject) {
    //populate jumbo header
    jumboHeaderEl.innerHTML = cityName + " - " + moment.unix(jsonObject.current.dt).format("MM/DD/YYYY");
    jumboIconEl.src = getWeatherIcon(jsonObject.current.weather[0].icon);
    jumboTempEl.innerHTML = jsonObject.current.temp;
    jumboWindEl.innerHTML = jsonObject.current.wind_speed;
    jumboHumidityEl.innerHTML = jsonObject.current.humidity;
    var currentUvi = jsonObject.current.uvi;
    jumboUvEl.innerHTML = currentUvi;
    //give color to UV index based on value
    if (currentUvi < 3) {
        jumboUvEl.classList.add("btn-success");
    } else if (currentUvi < 7) {
        jumboUvEl.classList.add("btn-warning");
    } else {
        jumboUvEl.classList.add("btn-danger");
    }
    //generate weather cards
    for (let i = 1; i < 6; i++) {
        cardRows.innerHTML += "<div class='col-sm-2 bg-primary cards'><h5>" +
            moment.unix(jsonObject.daily[i].dt).format("MM/DD/YYYY") +
            "</h5><img src='" + getWeatherIcon(jsonObject.daily[i].weather[0].icon) +
            "'><p>Temp: " + jsonObject.daily[i].temp.day + "°F</p><p>Wind: " +
            jsonObject.daily[i].wind_speed + " MPH</p><p>Humidity: " +
            jsonObject.daily[i].humidity + "</p></div>";
    }
}

//run when page loads
onLoad();