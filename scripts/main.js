'use strict';
const main = document.getElementsByTagName('main')[0];
const loading = document.querySelector('.loading');

const params = {
	"latitude": 55.7522,
	"longitude": 37.6156,
	"hourly": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "weather_code", "surface_pressure", "wind_speed_10m", "wind_direction_10m", "is_day"],
    "wind_speed_unit": "ms",
	"timezone": "Europe/Moscow",
    "past_days": 2,
	"forecast_days": 16
};
const directions = {
    "С": [337.5, 22.5],
    "СВ": [22.5, 67.5],
    "В": [67.5, 112.5],
    "ЮВ": [112.5, 157.5],
    "Ю": [157.5, 202.5],
    "ЮЗ": [202.5, 247.5],
    "З": [247.5, 292.5],
    "СЗ": [292.5, 337.5],
};
const wmo_code = {
    0: ['Чистое небо', 'skc_d'],
    1: ['Преимущественно ясно', 'skc_d'],
    2: ['Переменная облачность', 'bkn_d'],
    3: ['Пасмурно', 'ovc'],
    45: ['Туман', 'fg_d'],
    48: ['Осаждающийся инейный туман', 'fg_d'],
    51: ['Пасмурно cо слабым дождем', 'ovc_-ra'],
    53: ['Пасмурно с дождем', 'ovc_ra'],
    55: ['Пасмурно c сильным дождем', 'ovc_+ra'],
    56: ['Пасмурно cо слабым снегом', 'ovc_-sn'],
    57: ['Пасмурно c сильным снегом', 'ovc_+sn'],
    61: ['Слабый дождь', 'bkn_-ra_d'],
    63: ['Дождь', 'bkn_ra_d'],
    67: ['Сильный дождь', 'bkn_+ra_d'],
    66: ['Пасмурно и снег с дождем', 'ovc_ra_sn'],
    67: ['Сильный ледяной дождь', 'ovc_ra_sn'],
    71: ['Слабый снег', 'bkn_-sn_d'],
    73: ['Снег', 'bkn_sn_d'],
    75: ['Сильный снег', 'bkn_+sn_d'],
    77: ['Снежные зерна', 'ovc_-sn'],
    80: ['Слабая метель', '-bl'],
    81: ['Метель', 'bl'],
    82: ['Сильная метель', '+bl'],
    85: ['Небольшой снегопад', 'ovc_+sn'],
    86: ['Сильный снегопад (град)', 'ovc_ha'],
    95: ['Гроза', 'ovc_ts'],
    96: ['Гроза с дождем', 'ovc_ts_ra'],
    99: ['Гроза с градом', 'ovc_ts_ha']
};
const cities = {
    'Москва': [55.7522, 37.6156],
    'Санкт-Петербург': [59.9386, 30.3141],
    'Новосибирск': [55.0415, 82.9346],
    'Екатеринбург': [56.8519, 60.6122],
    'Казань': [55.7887, 49.1221],
    'Красноярск': [56.0184, 92.8672],
    'Нижний Новгород': [56.3287, 44.002],
    'Челябинск': [55.154, 61.4291],
    'Самара': [53.2001, 50.15],
    'Ростов-на-Дону': [47.2313, 39.7233],
    'Краснодар': [45.0448, 38.976],
    'Омск': [54.9924, 73.3686],
    'Воронеж': [51.672, 39.1843],
    'Пермь': [58.0105, 56.2502],
    'Волгоград': [48.7194, 44.5018]
};

function fetchWeatherDate(){
    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = getWeatherUrl(url, params);

    fetch(responses)
        .then(res => res.json()
        .then(record =>{
            let timeArr = [];
            const temperature = record.hourly.temperature_2m;
            const app_temperature = record.hourly.apparent_temperature;
            const wind_direction = record.hourly.wind_direction_10m;
            const wind_speed = record.hourly.wind_speed_10m;
            const humidity = record.hourly.relative_humidity_2m;
            const pressure = record.hourly.surface_pressure;
            const weather_code = record.hourly.weather_code;

            // console.log(record);
            let t;
            reqData = weathDate.value;
            record.hourly.time.forEach(t = (e, i) => {
                if(e.slice(0, -6) == reqData) timeArr.push(i);
            });
            const maxTmp = getmaxMinValue(temperature, timeArr, 'max');
            const maxAppTmp = getmaxMinValue(app_temperature, timeArr, 'max');
            const averWindDir = getAverageValue(wind_direction, timeArr);
            const averWindSpeed = findMostFrequent(wind_speed, timeArr);
            const averHumidity = getAverageValue(humidity, timeArr);
            const averPressure = Math.floor(findMostFrequent(pressure, timeArr)*0.75);
            const minWeathCode = getmaxMinValue(weather_code, timeArr, 'min');

            insertWeathDate(maxTmp, maxAppTmp, averWindDir, averWindSpeed, averHumidity, averPressure, minWeathCode);
        }))
}

function getWeatherUrl(url, params){
    let finalURL = url + '?';
    Object.keys(params).forEach(key => {
        finalURL += key + '=' + params[key] + '&'
    });
    finalURL = finalURL.slice(0, -1);
    return finalURL;
}

function getmaxMinValue(arr, timeArr, param){
    const cutArr =  arr.slice(timeArr[0], timeArr.at(-1)+1);
    switch (param) {
        case 'max':
            const max_val = Math.max.apply(null, cutArr);
            return max_val;
        case 'min':
            const min_val = Math.max.apply(null, cutArr);
            return min_val;
    }
}

function getAverageValue(arr, timeArr){
    const cutArr = arr.slice(timeArr[0], timeArr.at(-1)+1);
    let sum = 0;
    let elem;
    for (elem of cutArr){
        sum += elem;
    }
    let average = Math.floor(sum/cutArr.length);
    return average
}


function findMostFrequent(arr, timeArr){
    const cutArr = arr.slice(timeArr[0], timeArr.at(-1)+1);
    var map = {};
    var mostFrequentElement = cutArr[0];
    for(var i = 0; i<cutArr.length; i++){
        if(!map[cutArr[i]]){
            map[cutArr[i]]=1;
        }else{
            ++map[cutArr[i]];
            if(map[cutArr[i]]>map[mostFrequentElement]){
                mostFrequentElement = cutArr[i];
            }
        }
    }
    return mostFrequentElement;
}

function insertWeathDate(maxTmp, maxAppTmp, averWindDir, averWindSpeed, averHumidity, averPressure, minWeathCode){
    Temp.textContent = maxTmp > 0 ? `+${maxTmp}`: maxTmp;
    appTemp.textContent = maxAppTmp > 0 ? `+${maxAppTmp}`: maxAppTmp;
    windSpeed.textContent = averWindSpeed;
    Humidity.textContent = averHumidity;
    Pressure.textContent = averPressure;
    Weath.textContent = wmo_code[minWeathCode][0];
    weathIcon.src = `images/${wmo_code[minWeathCode][1]}.svg`;
    
    Object.keys(directions).forEach(direction =>{
        let dir = directions[direction];
        if(dir[0]<averWindDir && averWindDir<dir[1]){
            windDir.textContent = direction;
        }
    })
    main.style.display = 'flex';
    loading.style.display = 'none';
}

const weathDate = document.getElementById('weathDate');
const citiesSelect = document.getElementById('citiesSelect');
const btnLocation = document.getElementById('btnLocation');

const Temp = document.getElementById('Temp');
const weathIcon = document.getElementById('weathIcon');
const Weath = document.getElementById('Weath');
const appTemp = document.getElementById('appTemp');
const windSpeed = document.getElementById('windSpeed');
const windDir = document.getElementById('windDir');
const Humidity = document.getElementById('Humidity');
const Pressure = document.getElementById('Pressure');

function toDateInputValue(dateObject){
    const local = new Date(dateObject);
    local.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
    return local.toJSON().slice(0,10);
};
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
const nowDate = new Date();
weathDate.value = toDateInputValue(nowDate);
weathDate.min = toDateInputValue(nowDate.addDays(-params.past_days));
weathDate.max = toDateInputValue(nowDate.addDays(params.forecast_days - 1));

let reqData = weathDate.value;

Object.keys(cities).sort().forEach(citie => {
    let option = document.createElement('option');
    option.textContent = citie;
    if (citie == 'Москва') option.selected = true;
    citiesSelect.appendChild(option);
})

let option = document.createElement('option');
option.textContent = 'Другой город';
option.disabled = true;
citiesSelect.appendChild(option)

citiesSelect.onchange = () => {
    params['latitude'] = cities[citiesSelect.value][0];
    params['longitude'] = cities[citiesSelect.value][1];
    fetchWeatherDate();
}
weathDate.onchange = () => {
    if (!!weathDate.value) fetchWeatherDate()
}

let is_have_loc = false;
let your_lati = params['latitude']; 
let your_long = params['longitude'];
btnLocation.onclick = () =>{
    // loading.style.display = 'inline';
    // loading.style.backgroundColor = '#d3d3d37d';
    if ("geolocation" in navigator) {
        if (!is_have_loc){
            navigator.geolocation.getCurrentPosition(getPossition, handleError)
        }
    }
    params['latitude'] = your_lati;
    params['longitude'] = your_long;
    weathDate.value = toDateInputValue(nowDate);
    citiesSelect.selectedIndex = 15;
    fetchWeatherDate();
}

function getPossition(possition){
    your_lati = possition.coords.latitude;
    your_long = possition.coords.longitude;
    is_have_loc = true;

    params['latitude'] = your_lati;
    params['longitude'] = your_long;
    weathDate.value = toDateInputValue(nowDate);
    citiesSelect.selectedIndex = 15;
    fetchWeatherDate();
}

function handleError(error) {
    // Эту функцию можно передать колбэком в случае ошибок
  
    const { code } = error;
  
    switch (code) {
      case GeolocationPositionError.TIMEOUT:
        // Время получения геолокации истекло
        alert('Время получения геолокации истекло');
        break
      case GeolocationPositionError.PERMISSION_DENIED:
        // Пользователь запретил отслеживание своей геопозиции
        alert('Вы не дали доступ к геолокации');
        break
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        // Получить местоположение не удалось
        alert('Получить местоположение не удалось');
        break
    }
}
  
window.onload = () => {
    fetchWeatherDate();
}