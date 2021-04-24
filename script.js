'use strict'
class App {
    constructor() {
        this.date = new Date();
    }
    // -get user position from web api
    userGeolocationAPI() {
       const userGeoPosition =  new Promise(function (resolve, reject) {
            return navigator.geolocation.getCurrentPosition(resolve, reject)
       });
        return userGeoPosition
    };

    // get current user city name
    userCurrentCity() {
        const getUserCity = async () => {
            try {

                const latitudeAndLongitude = await this.userGeolocationAPI();
                const { latitude: lat, longitude: lon } = latitudeAndLongitude.coords;

                const cityNameResponse = await fetch(`https://geocode.xyz/${lat},${lon}?geoit=json`);
                if (!cityNameResponse.ok) throw new Error('Something wrong with getting your location');
                const cityNameData = await cityNameResponse.json();
                return cityNameData.city

            } catch (err) {
                throw new Error(err.message);
            };
        }
        return getUserCity().then(res => { console.log(res); }).catch(err => { console.log(err.message = `Something wrong with getting your location`)});
}
    // get data from weather api
    currentWeatherAPI() {

    };
    // create all html on currentWeather() method display all content
    displayWeather() {

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

};
const app = new App()
// https: //geocode.xyz/lat,lot?geoit=json




