var apiKey = "7d5f132842d59d170c3c85b09a262256";
var test = "https://api.openweathermap.org/data/2.5/onecall?lat=33.44&lon=-94.04&exclude=hourly,daily&appid=7d5f132842d59d170c3c85b09a262256";

fetch(test).then(res => {
    return res.json();
}).then(function(res) {
    console.log(res);
});

//construct string and fetch data