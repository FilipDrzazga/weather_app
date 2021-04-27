'use strict'

const introSection = document.querySelector('.intro');
class App {
    constructor() {
        this.date = new Date();
        this.weatherData = '';
        this.userData = {
            latitude: '',
            longitude: '',
            city: '',
        };
        this.userCurrentCity();

    };
    // -get geolocation from web api
    userGeolocationAPI() {
       const userGeoPosition =  new Promise(function (resolve, reject) {
           return navigator.geolocation.getCurrentPosition(resolve, reject);
       });
        return userGeoPosition.then(res => {
            let { latitude, longitude } = res.coords;
            this.userData.latitude = latitude;
            this.userData.longitude = longitude;
        }).catch(err=>console.log(err.message));
    };

    // get current user city
    userCurrentCity() {
        const getUserCity = async () => {
            try {
                await this.userGeolocationAPI();
                const cityNameResponse = await fetch(`https://geocode.xyz/${this.userData.latitude},${this.userData.longitude}?geoit=json`);
                if (!cityNameResponse.ok) throw new Error('Something wrong with getting your location');
                const cityNameData = await cityNameResponse.json();
                this.userData.city = cityNameData.city;
                return this.currentWeatherAPI(cityNameData.city);

            } catch (err) {
                throw new Error(err.message);
            };
        };
        return getUserCity()
            .then(res => res)
            .catch(err => {console.log(err.message,'Something wrong with getting your location')});
    };
    // get data from weather api
    currentWeatherAPI(city) {
        const getActyallyWeather = async () => {
            try {
                const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&&units=metric&appid=a938e8c556fa1ec0d334507134f03c40`);
                if (!weatherResponse.ok) throw new Error('Something wrong with getting api weather!');
                const weatherData = await weatherResponse.json();
                return weatherData;
            } catch(err) {
                throw new Error(err.message);
            };
        };
        return getActyallyWeather()
            .then(res => this.renderData(res))
            .catch(err=> console.log(err.message, 'Something wrong with getting weather!'));

    };
    // take data from promise and take to the class
    renderData(data) {
        this.weatherData = data;
    };
    // create all html on currentWeather() method display all content
    displayWeather() {
        const markup = `
        <h1 class="main__location">${this.weatherData.name}, ${this.weatherData.sys.country}</h1>
        <button class="main__add-location"><i class="fas fa-plus"></i></button>
        <p class="main__date">Monday, 23 March</p>
        <p class="main__location-time">15:32</p>
        <div class="main__weather-location">
            <svg class="sunny" viewBox="0 0 118 118">
                <circle cx="59" cy="59" r="59" fill="#f8ab1c" /></svg>
        </div>
        <p class="main__weather-description">${this.weatherData.weather[0].description}</p>
        <p class="main__weather-temp">${+(this.weatherData.main.temp).toFixed(1)}°C</p>
        <div class="main__swiper-container swiper-container">
            <div class="main__swiper-wrapper swiper-wrapper">
                <div class="main__swiper-slide swiper-slide">
                    <p class="main__title">Wind</p>
                    <p class="main__value">${this.weatherData.wind.speed}km/h</p>
                </div>
            </div>
        </div>`;

        const htmlEl = document.createElement('section');
        htmlEl.innerHTML = markup;
        htmlEl.classList.add('main');
        introSection.insertAdjacentElement('afterend', htmlEl);
    };
    // search cities by input
    searchCity() {

    };
    // add cities to list max. 4 cities!
    addCityToList() {

    };
    // remove city from the list (remove from all HTML)
    removeCityFromList() {

    };
    // render any Error
    renderErr() {

    };

};
const app = new App();




