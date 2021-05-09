'use strict'
class App {
    constructor(input, searchBtn) {
        this.input = input;
        this.searchBtn = searchBtn.addEventListener('click',this.searchCity.bind(this));
        this.smallCloud = document.querySelector('.intro__small-cloud');
        this.bigCloud = document.querySelector('.intro__big-cloud');
        this.sun = document.querySelector('.intro__sun');
        this.navigation = document.querySelector('.nav');
        this.sectionSearch = document.querySelector('.city-search');
        this.sectionAllCity = document.querySelector('.all-city');

        this.weatherData = {};
        this.bestCity = [];
        this.userData = { latitude: '', longitude: '', city: '' };

        this.introAnimation();
        this.userCurrentCity();
        this.initNavBtn();
    };
    // intro animation
    introAnimation() {
        const tl = new TimelineMax();
        tl.fromTo(this.smallCloud, .2, { scale: 0 }, { scale: 1 })
        .fromTo(this.bigCloud, .2, { scale: 0 }, { scale: 1 })
        .fromTo(this.sun, .3, { scale: 0 }, { scale: 1.3 })
        .to(this.sun, .3, { scale: 1 })
        .to(this.smallCloud, 1, {left:"73%"},"-=0.5")
        .to(this.bigCloud, 1, { left: "32%" }, "-=1.5")
        .to(this.sun, .5, {y: -280 })
        .to(this.sun, .3, {y: 500,opacity:0 },"-=0.2")
        .to(this.smallCloud, 1, {left:"120%",opacity:0},"-=0.4")
        .to(this.bigCloud, 1, { left: "-100%",opacity:0 },"-=1")
        .set(this.navigation,{opacity:1})

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
        <img class="main__weather-location-png" src="http://openweathermap.org/img/wn/${this.weatherData.weatherDescription[0].icon}.png"
        alt="weather icon"img>
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
        this.sectionSearch.classList.toggle('city-search--active');
        this.sectionSearch.classList.toggle('city-search');
    };
    // add cities to list max. 4 cities!
    addCityToList() {
        if (this.bestCity.length <= 3) {
            const markup = `
            <p class="all-city__name">${this.weatherData.location}, ${this.weatherData.country}</p>
            <button class="all-city__remove"><i class="fas fa-minus"></i></button>`;

            const htmlEl = document.createElement('div');
            htmlEl.classList.add('all-city__content');
            htmlEl.setAttribute('data-city', `${this.weatherData.location}`);
            htmlEl.innerHTML = markup;
            this.sectionAllCity.insertAdjacentElement('afterbegin', htmlEl);
            this.checkWeatherBestCity();
            this.removeCityFromList();
            this.bestCity.push(htmlEl);
        } else  return
    };
    // go to city from bestCity
    checkWeatherBestCity() {
        this.bestCity.forEach(city => {
            city.addEventListener('click', (e) => {
                if (e.target.classList.contains('all-city__remove')) return
                const getCityName = city.getAttribute('data-city');
                this.currentWeatherAPI(getCityName);
                this.sectionAllCity.classList.toggle('all-city--active');
                this.sectionAllCity.classList.toggle('all-city');
            });
        });
    };
    // remove city from the list (remove from all HTML)
    removeCityFromList() {
        this.bestCity.forEach((city) => {
            city.addEventListener('click', (e) => {
                const target = e.target;
                if (target.className === 'all-city__remove') {
                    this.bestCity = this.bestCity.filter(item => item !== city);
                    city.remove();
                    return this.bestCity
                };
            });
        });
    };
    // remove data or HTML???
    removeData(clearThisHtml) {
        if (document.querySelector(`.${clearThisHtml}`)) document.querySelector(`.${clearThisHtml}`).remove();
    };
    // render any Error
    renderErr(message) {

    };
    // click for all nav btn
    initNavBtn() {
        const ulList = this.navigation.childNodes;
        ulList[1].addEventListener('click',  (e) => {
            if (e.target.classList.contains('nav__btn-current-position') || e.target.classList.contains('fa-map-marker-alt')) {
                this.userCurrentCity();
                this.sectionSearch.classList.remove('city-search--active');
                this.sectionAllCity.classList.remove('all-city--active');
            };
            if (e.target.classList.contains('nav__btn-search') || e.target.classList.contains('fa-search-location')) {
                this.sectionSearch.classList.toggle('city-search--active');
                this.sectionSearch.classList.toggle('city-search');
                this.sectionAllCity.classList.remove('all-city--active');
                this.sectionAllCity.classList.add('all-city');
            };
            if (e.target.classList.contains('nav__btn-cities') || e.target.classList.contains('fa-list')) {
                this.sectionAllCity.classList.toggle('all-city--active');
                this.sectionAllCity.classList.toggle('all-city');
                this.sectionSearch.classList.remove('city-search--active');
                this.sectionSearch.classList.add('city-search');
            };
        });
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

const app = new App(input, searchBtn);
