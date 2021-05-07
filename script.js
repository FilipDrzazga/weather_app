'use strict'

class App {
    constructor(input, searchBtn) {
        this.input = input;
        this.searchBtn = searchBtn.addEventListener('click',this.searchCity.bind(this));
        this.weatherData = {};
        this.bestCity = [];
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
        .then(res => {
            this.renderData(res);
            this.displayWeather();
            this.checkIfElementExist('.main__add-location', this.addCityToList.bind(this));
        })
        .catch(err=> console.log(err.message, 'Something wrong with getting weather!'));

    };
    // take data from promise and take to the class
    renderData(data) {
        this.weatherData = {
            locationDate: data.dt,
            country: data.sys.country,
            location: data.name,
            temp: data.main.temp,
            weatherDescription: data.weather,
            weatherPlus: {
                feelslike: `${ data.main.feels_like.toFixed(0)}°C`,
                humidity: `${data.main.humidity}%`,
                tempMax: `${data.main.temp_max.toFixed(0)}°C`,
                tempMin: `${data.main.temp_min.toFixed(0)}°C`,
                wind: `${data.wind.speed.toFixed(0)} km/h`
            }
        };
    };
    // create all html on currentWeather() method display all content
    displayWeather() {
        this.removeData('main');

        const markup = `
        <h1 class="main__location">${this.weatherData.location}, ${this.weatherData.country}</h1>
        <button class="main__add-location"><i class="fas fa-plus"></i></button>
        <p class="main__date">${this.dateConverter()}</p>
        <p class="main__location-time">15:32</p>
        <div class="main__weather-location">
        <svg class="sunny" viewBox="0 0 118 118">
        <circle cx="59" cy="59" r="59" fill="#f8ab1c" /></svg>
        </div>
        <p class="main__weather-description">${this.weatherData.weatherDescription[0].main}</p>
        <p class="main__weather-temp">${+(this.weatherData.temp).toFixed(1)}°C</p>
        <div class="main__swiper-container swiper-container">
        <div class="main__swiper-wrapper swiper-wrapper">
        </div>
        </div>`;

        const htmlEl = document.createElement('section');
        htmlEl.innerHTML = markup;
        htmlEl.classList.add('main');
        introSection.insertAdjacentElement('afterend', htmlEl);
        this.displayWeatherPlus();
        this.swiperInit();
    };
    // display in html weatherplus
    displayWeatherPlus() {
        const container = document.querySelector('.main__swiper-wrapper');
        const { weatherPlus } = this.weatherData;
        for (const weatherCondition in weatherPlus) {
            const markup = `
            <p class="main__title">${weatherCondition}</p>
            <p class="main__value">${weatherPlus[weatherCondition]}</p>`;

            const htmlEl = document.createElement('div');
            htmlEl.classList.add(`main__swiper-slide`);
            htmlEl.classList.add(`swiper-slide`);
            htmlEl.innerHTML = markup;
            container.insertAdjacentElement('afterbegin', htmlEl);

        };
    };
    // search cities by input
    searchCity() {
        this.currentWeatherAPI(this.input.value);
    };
    // add cities to list max. 4 cities!
    addCityToList() {
        const markup = `
        <p class="all-city__name">${this.weatherData.location}, ${this.weatherData.country}</p>
        <button class="all-city__remove"><i class="fas fa-minus"></i></button>`;

        const htmlEl = document.createElement('div');
        htmlEl.classList.add('all-city__content');
        htmlEl.setAttribute('data-city', `${this.weatherData.location}`);
        htmlEl.innerHTML = markup;
        allCity.insertAdjacentElement('afterbegin', htmlEl);

        this.bestCity.length > 3 ? alert('kurwa duzo') : this.bestCity.push(htmlEl);
        this.checkWeatherBestCity();
    };
    // go to city from bestCity
    checkWeatherBestCity() {
        this.bestCity.forEach(city => {
            city.addEventListener('click', () => {
                const getCityName = city.getAttribute('data-city');
                this.currentWeatherAPI(getCityName);
            });
        });
    };
    // remove city from the list (remove from all HTML)
    removeCityFromList() {

    };
    // remove data or HTML???
    removeData(clearThisHtml) {
        if (document.querySelector(`.${clearThisHtml}`)) document.querySelector(`.${clearThisHtml}`).remove();
    };
    // render any Error
    renderErr(message) {

    };
    // check if element exist?
    checkIfElementExist(element,func) {
        const check = new Promise(resolve => {
            if (document.querySelector(element)) {
                return resolve(document.querySelector(element).addEventListener('click', func));
            };

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(element)) {
                    resolve(document.querySelector(element).addEventListener('click', func));
                    observer.disconnect();
                };
            });

            observer.observe(document.body, {
                childList: true,
            });
        });

        check.then(response => this.addBtn = response);
    };
    // convert date
    dateConverter() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const { locationDate } = this.weatherData;
        let dayName = new Date(locationDate).getDay();
        let dayInMonth = new Date(locationDate).getDate();
        let month = new Date(locationDate).getMonth();

        return `${days[dayName]}, ${dayInMonth} ${months[month]}`;
    };
    // init. swiper lib.
    swiperInit() {
        const swiper = new Swiper('.swiper-container', {
            direction: 'horizontal',
            centeredSlides: true,
            freeMode: true,
            slidesPerView:'auto',
            spaceBetween: 5,
            autoplay: {
                delay: 5000,
            },
        });
    };
};

const input = document.querySelector('.city-search__input');
const searchBtn = document.querySelector('.city-search__btn');
const introSection = document.querySelector('.intro');
const allCity = document.querySelector('.all-city');

const app = new App(input, searchBtn);

