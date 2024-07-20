import {
  numHabitacionInput,
  tipoHabitacionInput,
  precioHabitacionInput,
  estadoHabitacionInput,
  formulario,
} from "./selectores.js";
import { ui, editando } from "./variables.js";
export let database;

export function eventListeners() {
  formulario.addEventListener("submit", validarFormulario);
  numHabitacionInput.addEventListener("change", datosHabitaciones);
  tipoHabitacionInput.addEventListener("change", datosHabitaciones);
  precioHabitacionInput.addEventListener("change", datosHabitaciones);
  estadoHabitacionInput.addEventListener("change", datosHabitaciones);
}

export function datosHabitaciones(e) {
  if (e.target.name === "numero") {
    habitacionObj[e.target.name] = Number(e.target.value);
  } else {
    habitacionObj[e.target.name] = e.target.value;
  }
}

export function crearDB() {
  const crearDB = window.indexedDB.open("habitaciones", 1);

  crearDB.onerror = function () {
    console.log("Hubo un error al crear la DB...");
  };

  crearDB.onsuccess = function () {
    console.log("La DB fue creada correctamente.");

    database = crearDB.result;

    ui.mostrarHabitacionesHTML();
  };

  crearDB.onupgradeneeded = function (e) {
    const db = e.target.result;
    const objectStore = db.createObjectStore("habitaciones", {
      keyPath: "numero",
      autoIncrement: true,
    });

    objectStore.createIndex("numero", "numero", { unique: true });
    objectStore.createIndex("tipo", "tipo", { unique: false });
    objectStore.createIndex("precio", "precio", { unique: false });
    objectStore.createIndex("estado", "estado", { unique: false });

    console.log("Base de datos creada y lista.");
  };
}

export function validarFormulario(e) {
  e.preventDefault();
  if (
    numHabitacionInput.value === "" ||
    tipoHabitacionInput.value === "" ||
    precioHabitacionInput.value === "" ||
    estadoHabitacionInput.value === ""
  ) {
    ui.mostrarAlerta("Debes rellenar todos los campos", "error");
    return;
  }

  if (editando) {
    const transaction = database.transaction(["habitaciones"], "readwrite");
    const objectStore = transaction.objectStore("habitaciones");
    objectStore.put(habitacionObj);

    transaction.oncomplete = () => {
      ui.mostrarAlerta("Guardado correctamente", "exito");

      editando = false;
    };

    transaction.onerror = () => {
      console.log("Hubo un error al actualizar.");
    };
  } else {
    const transaction = database.transaction(["habitaciones"], "readwrite");

    const objectStore = transaction.objectStore("habitaciones");

    objectStore.add(habitacionObj);

    transaction.oncomplete = function () {
      console.log("Habitacion agregada a la DB.");
    };
  }

  ui.mostrarHabitacionesHTML();

  reiniciarObjeto();

  formulario.reset();
}

export function reiniciarObjeto() {
  habitacionObj.numero = "";
  habitacionObj.tipo = "";
  habitacionObj.precio = "";
  habitacionObj.estado = "";
}

export function cargarEdicion(habitacion) {
  const { numero, tipo, precio, estado } = habitacion;

  habitacionObj.numero = Number(numero);
  habitacionObj.tipo = tipo;
  habitacionObj.precio = precio;
  habitacionObj.estado = estado;

  numHabitacionInput.value = numero;
  tipoHabitacionInput.value = tipo;
  precioHabitacionInput.value = precio;
  estadoHabitacionInput.value = estado;

  editando = true;
}

export function eliminarHabitacion(id) {
  const transaction = database.transaction(["habitaciones"], "readwrite");
  const objectStore = transaction.objectStore("habitaciones");

  objectStore.delete(id);

  transaction.oncomplete = () => {
    console.log("Habitacion eliminada.");

    ui.mostrarHabitacionesHTML();
  };

  transaction.onerror = () => {
    console.log("Hubo un error en eliminar...");
  };
}
