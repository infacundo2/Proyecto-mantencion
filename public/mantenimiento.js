// mantenimiento.js: carga, guardado y eliminación de mantenciones

import { equipoSelect } from './equipo.js';

export const fechaInput = document.getElementById('fechaInput');
export const limpiezaChk = document.getElementById('limpiezaChk');
export const conexionesChk = document.getElementById('conexionesChk');
export const verificacionChk = document.getElementById('verificacionChk');
export const observaciones = document.getElementById('observaciones');
export const eliminarMantencionBtn = document.getElementById('eliminarMantencionBtn');

export async function cargarEstado() {
  const equipo_id = equipoSelect.value;
  const fecha = fechaInput.value;
  if (!equipo_id || !fecha) {
    limpiezaChk.checked = false;
    conexionesChk.checked = false;
    verificacionChk.checked = false;
    observaciones.value = '';
    eliminarMantencionBtn.style.display = 'none';
    return;
  }

  const res = await fetch(`/estado?equipo_id=${equipo_id}&fecha=${fecha}`);
  const estado = await res.json();

  if (estado) {
    limpiezaChk.checked = !!estado.limpieza;
    conexionesChk.checked = !!estado.conexiones;
    verificacionChk.checked = !!estado.verificacion;
    observaciones.value = estado.observaciones || '';
    eliminarMantencionBtn.style.display = 'inline';
    eliminarMantencionBtn.dataset.mantencionId = estado.id;
  } else {
    limpiezaChk.checked = false;
    conexionesChk.checked = false;
    verificacionChk.checked = false;
    observaciones.value = '';
    eliminarMantencionBtn.style.display = 'none';
    eliminarMantencionBtn.dataset.mantencionId = '';
  }
}
