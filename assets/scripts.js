//this would normally be obfuscated
var apiKey = "7d5f132842d59d170c3c85b09a262256";

//on page load ask the user for their location a populate data based on geolocation
function onLoad() {
    //https://stackoverflow.com/questions/6033561/geolocation-zip-code/42350178
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(a) {
            if (a.coords) {
                var lat = a.coords.latitude;
                var long = a.coords.longitude;
                getWeatherByGeolocation(lat, long, apiKey);
            }
        });
    } else {
        alert('Browser geolocation is not supported. Please enter a city or zip code.');
    }
}

function getWeatherByGeolocation(geoLat, geoLong, apiKey) {
    var consCoords = "https://api.openweathermap.org/data/2.5/forecast?lat=" +
        geoLat + "&lon=" +
        geoLong + "&appid=" + apiKey;

    fetch(consCoords).then(response => {
        return response.json();
    }).then(function(response) {
        console.log(response);
        //call new function here to populate data
        populateForecast(res);
    });
}

function getWeatherByZipCode(zipCode, apiKey) {
    var consZip = "https://api.openweathermap.org/data/2.5/forecast?zip=" +
        zipCode + "&appid=" + apiKey;

    fetch(consZip).then(response => {
        return response.json();
    }).then(function(response) {
        console.log(response);
        //call new function here to populate data
    });
}

function getWeatherByCityName(cityName, apiKey) {
    var consCity = "https://api.openweathermap.org/data/2.5/forecast?q=" +
        cityName + "&appid=" + apiKey;

    fetch(consCity).then(response => {
        return response.json();
    }).then(function(response) {
        console.log(response);
        //call new function here to populate data
    });
}

function populateForecast(jsonObject) {
    var test;
}

onLoad();