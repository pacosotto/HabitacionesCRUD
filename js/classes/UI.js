import { eliminarHabitacion, cargarEdicion } from "../funciones.js";
import { habitacionesContainer, formulario } from "../selectores.js";
import { database } from "../funciones.js";

export default class UI {
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
