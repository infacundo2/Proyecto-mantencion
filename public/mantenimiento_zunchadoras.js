// mantenimiento_zunchadoras.js
import { zunchadoraSelect } from './zunchadoras.js';

export const fechaInput = document.getElementById('fechaZunchadora');
export const mantencionChk = document.getElementById('mantencionZunChk');
export const estadoComponentesChk = document.getElementById('estadoComponentesZunChk');
export const limpiezaChk = document.getElementById('limpiezaZunChk');
export const funcionamientoChk = document.getElementById('funcionamientoZunChk');
export const observacionesInput = document.getElementById('observacionesZunchadora');
export const eliminarBtn = document.getElementById('eliminarMantencionZunchadoraBtn');

export async function cargarEstadoZunchadora() {
  const zunchadora_id = zunchadoraSelect.value;
  const fecha = fechaInput.value;

  if (!zunchadora_id || !fecha) {
    mantencionChk.checked = false;
    estadoComponentesChk.checked = false;
    limpiezaChk.checked = false;
    funcionamientoChk.checked = false;
    observacionesInput.value = '';
    eliminarBtn.style.display = 'none';
    return;
  }

  const res = await fetch(`/estado_zunchadora?zunchadora_id=${zunchadora_id}&fecha=${fecha}`);
  const estado = await res.json();

  if (estado) {
    mantencionChk.checked = !!estado.mantencion;
    estadoComponentesChk.checked = !!estado.estado_componentes;
    limpiezaChk.checked = !!estado.Limpieza;
    funcionamientoChk.checked = !!estado.funcionamiento_equipo;
    observacionesInput.value = estado.observaciones || '';
    eliminarBtn.style.display = 'inline';
    eliminarBtn.dataset.mantencionId = estado.id;
  } else {
    mantencionChk.checked = false;
    estadoComponentesChk.checked = false;
    limpiezaChk.checked = false;
    funcionamientoChk.checked = false;
    observacionesInput.value = '';
    eliminarBtn.style.display = 'none';
    eliminarBtn.dataset.mantencionId = '';
  }
}
