//Variables
let database;

const numHabitacionInput = document.querySelector("#numero");
const tipoHabitacionInput = document.querySelector("#tipo");
const precioHabitacionInput = document.querySelector("#precio");
const estadoHabitacionInput = document.querySelector("#estado");

const habitacionesContainer = document.querySelector("#container-habitaciones");

const formulario = document.querySelector("#formulario");

let editando = false;

const habitacionObj = {
  numero: "",
  tipo: "",
  precio: "",
  estado: "",
};

document.addEventListener("DOMContentLoaded", () => {
  eventListeners();
  crearDB();
});

//Eventos
function eventListeners() {
  formulario.addEventListener("submit", validarFormulario);
  numHabitacionInput.addEventListener("change", datosHabitaciones);
  tipoHabitacionInput.addEventListener("change", datosHabitaciones);
  precioHabitacionInput.addEventListener("change", datosHabitaciones);
  estadoHabitacionInput.addEventListener("change", datosHabitaciones);
}

//Clases
class UI {
  mostrarAlerta(mensaje, tipo) {
    const alerta = document.querySelector(".alerta");

    if (!alerta) {
      const alerta = document.createElement("p");
      if (tipo === "error") {
        alerta.classList.add("alerta", "error");
      } else if (tipo === "exito") {
        alerta.classList.add("alerta", "exito");
      }
      alerta.textContent = mensaje;

      formulario.appendChild(alerta);

      setTimeout(() => {
        alerta.remove();
      }, 3000);
    }
  }
  mostrarHabitacionesHTML() {
    this.limpiarHTML();
    const objectStore = database
      .transaction("habitaciones")
      .objectStore("habitaciones");

    objectStore.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;
      if (cursor) {
        const { numero, tipo, precio, estado } = cursor.value;

        const divHabitacion = document.createElement("div");
        divHabitacion.innerHTML = `
          <h3>No. de Habitación: ${numero}</h3>
          <p>Tipo de Habitación: ${tipo}</p>
          <p>Precio: $${precio}</p>
          <p>Estado: ${estado}</p>
          `;

        const btnEliminar = document.createElement("button");
        btnEliminar.onclick = () => eliminarHabitacion(numero);
        btnEliminar.classList.add("error");
        btnEliminar.textContent = "Eliminar";

        const btnEditar = document.createElement("button");
        const habitacion = cursor.value;
        btnEditar.onclick = () => cargarEdicion(habitacion);

        btnEditar.classList.add("editarBtn");
        btnEditar.textContent = "Editar";

        divHabitacion.appendChild(btnEliminar);
        divHabitacion.appendChild(btnEditar);
        habitacionesContainer.appendChild(divHabitacion);
        //Ve al siguiente elemento
        cursor.continue();
      }
    };
  }
  limpiarHTML() {
    while (habitacionesContainer.firstChild) {
      habitacionesContainer.removeChild(habitacionesContainer.firstChild);
    }
  }
}

let ui = new UI();

//Funciones
function datosHabitaciones(e) {
  if (e.target.name === "numero") {
    habitacionObj[e.target.name] = Number(e.target.value);
  } else {
    habitacionObj[e.target.name] = e.target.value;
  }
}

function crearDB() {
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

function validarFormulario(e) {
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

function reiniciarObjeto() {
  habitacionObj.numero = "";
  habitacionObj.tipo = "";
  habitacionObj.precio = "";
  habitacionObj.estado = "";
}

function cargarEdicion(habitacion) {
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

function eliminarHabitacion(id) {
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
