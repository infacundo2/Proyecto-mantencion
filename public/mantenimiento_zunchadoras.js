// mantenimiento_zunchadoras.js
import { zunchadoraSelect } from './zunchadoras.js';

export const fechaZunchadoraInput = document.getElementById('fechaZunchadora');
export const mantencionZunChk = document.getElementById('mantencionZunChk');
export const estadoComponentesZunChk = document.getElementById('estadoComponentesZunChk');
export const limpiezaZunChk = document.getElementById('limpiezaZunChk');
export const funcionamientoZunChk = document.getElementById('funcionamientoZunChk');
export const observacionesZunchadora = document.getElementById('observacionesZunchadora');
export const eliminarMantencionZunchadoraBtn = document.getElementById('eliminarMantencionZunchadoraBtn');

let fechasZunchadora = [];
let pickerZunchadora = null;

export async function cargarEstadoZunchadora() {
  const zunchadora_id = zunchadoraSelect.value;
  const fecha = fechaZunchadoraInput.value;

  if (!zunchadora_id || !fecha) {
    mantencionZunChk.checked = false;
    estadoComponentesZunChk.checked = false;
    limpiezaZunChk.checked = false;
    funcionamientoZunChk.checked = false;
    observacionesZunchadora.value = '';
    eliminarMantencionZunchadoraBtn.style.display = 'none';
    return;
  }

  const res = await fetch(`/estado_zunchadora?zunchadora_id=${zunchadora_id}&fecha=${fecha}`);
  const estado = await res.json();

  if (estado) {
    mantencionZunChk.checked = !!estado.mantencion;
    estadoComponentesZunChk.checked = !!estado.estado_componentes;
    limpiezaZunChk.checked = !!estado.Limpieza;
    funcionamientoZunChk.checked = !!estado.funcionamiento_equipo;
    observacionesZunchadora.value = estado.observaciones || '';
    eliminarMantencionZunchadoraBtn.style.display = 'inline';
    eliminarMantencionZunchadoraBtn.dataset.mantencionId = estado.id;
  } else {
    mantencionZunChk.checked = false;
    estadoComponentesZunChk.checked = false;
    limpiezaZunChk.checked = false;
    funcionamientoZunChk.checked = false;
    observacionesZunchadora.value = '';
    eliminarMantencionZunchadoraBtn.style.display = 'none';
    eliminarMantencionZunchadoraBtn.dataset.mantencionId = '';
  }
}
