   function isEmpty(myObject) {
  for (var key in myObject) {
    if (myObject.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}
function setPosition(Position) {
  console.log(Position);
  app.currentLocation.lat = Position.coords.latitude;
  app.currentLocation.lon = Position.coords.longitude;
  console.log(
    "Latitude: " +
      Position.coords.latitude +
      "<br>Longitude: " +
      Position.coords.longitude
  );
  app.checkForecastForCurrentLocation();
  app.checkCurrentWeather();
}
function locationError(PositionError) {
  console.log(PositionError);
}

var app = new Vue({
  el: "#should-i-shovel",
  data: {
    debugMode: true,
    userReportsSnow: undefined,
    city: "",
    api: "9e1c752ca2a86cc3f873a5ac1c72173b",
    currentLocation: {
      lat: 0,
      lon: 0
    },
    forecast: {},
    currentWeather: {},
    isPrivacyPolicyActive: false
  },
  computed: {
    message: function() {
      if (this.isLoading) {
        return "looking outside.";
      } else {
        if (!this.isTempOver50Today) {
          if (!this.isMoreThan5InchesToday) {
            /*if snow is less than 5 inches*/
            if (this.isGonnaBeWarmToday) {
              if (this.isGonnaBeWarmTomorrow) {
                return "It's going to be above freezing today and tomorrow, there's a good chance it will melt.";
              } else {
                return "It's above freezing today, there's a good chance it will melt.";
              }
            } else {
              /* it's going to be cold today */
              if (this.isGonnaBeWarmTomorrow) {
                return "it's going to be warm tomorrow, skip it!";
              } else if (this.isGonnaBeWarmIn2Days) {
                /*it's not going to be warm tomorrow but will be in 2 days*/
                return "it's going to melt in a couple days, most states require sidewalks to be cleared within 24 hours from snowfall end.";
              } else if (this.isGonnaSnowTomorrow) {
                /*it's going to be cold today and it's snowing tomorrow*/
                return "It's going to snow tomorrow, I'd shovel what you can today otherwise it's going to be harder tomorrow.";
              } else {
                /* it's cold today, it's not going to be warm tomorrow, or the next day, and not going to snow tomorrow */
                if (this.userReportsSnow === "true") {
                  return "it's not going to melt today or tomorrow, you should shovel.";
                } else if (this.userReportsSnow === "false") {
                  return "If there's no snow on the ground and it's not snowing, then...don't shovel.";
                } else {
                  /*user did not report anything, there is less than 5 inches of snow, it's cold today and tomorrow */
                  return "if you see an inch or more of snow outside, you should shovel it, it won't melt.";
                }
              }
              if (this.hasPotentialForIce) {
                return (
                  this.message +
                  "Be aware it could freeze though, it's going to be cold."
                );
              } else {
                return "You should shovel, It's not going to melt fast enough";
              }
            }
          } else {
            return "it will snow more than 5 inches, I would either start shoveling now or buy a snow blower.";
          }
        } else {
          return "There shouldn't be any snow on the ground it's over 50 degrees outside.";
        }
      }
    },
    isMoreThan5InchesToday: function() {
      //check if current snow is less than 5 inches
      if (this.currentWeather.precipitation) {
        if (this.currentWeather.precipitation.mode == "snow") {
          var precipitationInInches = this.currentWeather.value * 0.0393701; //convert from mm to inches
          if (precipitationInInches >= 5) {
            return true;
          }
        }
      }
      return false;
    },
    isLoading: function() {
      if (isEmpty(this.forecast) && isEmpty(this.currentWeather)) {
        return true;
      } else {
        return false;
      }
    },
    isTempOver50Today: function() {
      if (!this.isLoading) {
        var todaysLow = this.currentWeather.main.temp_min;
        if (todaysLow >= 50) {
          return true;
        }
      }
      return false;
    },
    isGonnaBeWarmToday: function() {
      if (!this.isLoading) {
        var tomorrowsLow = this.currentWeather.main.temp_min;
        if (tomorrowsLow >= 35) {
          return true;
        }
      }
      return false;
    },
    isGonnaBeWarmTomorrow: function() {
      if (!this.isLoading) {
        var tomorrowsLow = this.forecast.list[0].main.temp_min;
        if (tomorrowsLow >= 35) {
          return true;
        }
      }
      return false;
    },
    isGonnaBeWarmIn2Days: function() {
      if (!this.isLoading) {
        var dayAfterTomorrowsLow = this.forecast.list[1].main.temp_min;
        if (dayAfterTomorrowsLow >= 35) {
          return true;
        }
      }
      return false;
    },
    isGonnaSnowTomorrow: function() {
      return false;
    },
    hasPotentialForIce: function() {
      var tomorrowsLow = this.forecast.list[0].main.temp_min;
      if (tomorrowsLow <= 31) {
        return true;
      }
      return false;
    },
    isThereAlreadySnow: function() {
      return true;
    }
  },
  methods: {
    checkCurrentWeather() {
      //api.openweathermap.org/data/2.5/weather?lat=35&lon=139
      axios
        .get("https://api.openweathermap.org/data/2.5/weather", {
          params: {
            lat: this.currentLocation.lat,
            lon: this.currentLocation.lon,

            units: "imperial",
            appid: this.api
          }
        })
        .then(function(response) {
          console.log("Received current weather response!");
          app.currentWeather = response.data;
          console.log(response);
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    checkForecastForCurrentLocation() {
      console.log("checking forcast");
      // Optionally the request above could also be done as
      //http://samples.openweathermap.org/data/2.5/forecast?q=London,us&mode=xml&appid=b6907d289e10d714a6e88b30761fae22
      axios
        .get("https://api.openweathermap.org/data/2.5/forecast", {
          params: {
            lat: this.currentLocation.lat,
            lon: this.currentLocation.lon,
            cnt: 3,
            units: "imperial",
            appid: this.api
          }
        })
        .then(function(response) {
          console.log("Received forecast response!");
          app.forecast = response.data;
          console.log(response);
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    getLocation: function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setPosition, locationError);
      } else {
        return "Geolocation is not supported by this browser.";
      }
    }
  },
  mounted() {
    this.getLocation();
  }
});