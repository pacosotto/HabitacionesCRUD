import { eventListeners, crearDB } from "./funciones.js";

//Eventos
document.addEventListener("DOMContentLoaded", () => {
  eventListeners();
  crearDB();
});
