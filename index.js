require("dotenv").config();
const {
  inquirerMenu,
  pausa,
  leerInput,
  listadoLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
  let opt;
  const busquedas = new Busquedas();
  do {
    opt = await inquirerMenu();
    switch (opt) {
      case 1:
        console.clear();
        const termino = await leerInput("Ciudad: ");
        const lugares = await busquedas.ciudad(termino);
        const idSeleccionado = await listadoLugares(lugares);
        if (idSeleccionado === "0") continue;
        //Guardar en DB
        const lugarSeleccionado = lugares.find(
          (lugar) => lugar.id == idSeleccionado
        );
        busquedas.agregarHistorial(lugarSeleccionado.nombre);
        const { nombre, lng, lat } = lugarSeleccionado;
        const clima = await busquedas.temperatura(lat, lng);
        console.log("\nInformacion de la ciudad\n".green);
        console.log(`Ciudad: ${nombre}`);
        console.log(`Lat: ${lat}`);
        console.log(`Lng: ${lng}`);
        console.log(`Temperatura: ${clima.temp}`);
        console.log(`Minima: ${clima.min}`);
        console.log(`Maxima: ${clima.max}`);
        console.log(`¿Cómo esta el clima? ${clima.desc}`);
        break;
      case 2:
        busquedas.historialCapitalizado.forEach((lugar, indice) => {
          const idx = `${indice + 1}`.green;
          console.log(`${idx}. ${lugar}`);
        });
        break;
      case 0:
        console.log("Fin de la aplicacion...");
        break;
      default:
        console.log("Ingresaste una opcion invalida, intenta de nuevo...");
        break;
    }

    await pausa();
  } while (opt != 0);
};

main();
