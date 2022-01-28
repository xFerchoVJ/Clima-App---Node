const fs = require("fs");
const axios = require("axios");
class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    //TODO: Leer db si existe.
    this.leerDB();
  }

  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map( palabra => palabra[0].toUpperCase() + palabra.substring(1));
      return palabras.join(' ');
    });
  }

  get paramsCity() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es",
      timeout: 1000,
    };
  }
  get paramsTemp() {
    return {
      appid: process.env.WEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }
  async ciudad(lugar = "") {
    try {
      const instace = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsCity,
      });
      const resp = await instace.get();
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async temperatura(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        //?lat={lat}&lon={lon}&appid={API key}
        params: { ...this.paramsTemp, lat, lon },
      });
      const resp = await instance.get();
      const { weather, main } = resp.data;
      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  agregarHistorial(lugar = "") {
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    this.historial = this.historial.splice(0,5);
    this.historial.unshift(lugar.toLocaleLowerCase());
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    if (!fs.existsSync(this.dbPath)) return null;
    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);
    console.log(data);
    this.historial = data.historial;
  }
}

module.exports = Busquedas;
