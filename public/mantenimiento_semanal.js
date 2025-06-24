// mantenimiento_semanal.js
import { equipoSelect } from './equipo.js';

export const fechaInput = document.getElementById('fechaInput');
export const mantencionChk = document.getElementById('mantencionChk');
export const estadoComponentesChk = document.getElementById('estado_componentesChk');
export const cambioPastaChk = document.getElementById('cambio_pastaChk');
export const funcionamientoChk = document.getElementById('funcionamientoChk');
export const observacionesTrimestral = document.getElementById('observacionesTrimestral');
export const eliminarMantencionSemanalBtn = document.getElementById('eliminarMantencionSemanalBtn');

export async function cargarEstadoSemanal() {
  const equipo_id = equipoSelect.value;
  const fecha = fechaInput.value;
  if (!equipo_id || !fecha) {
    mantencionChk.checked = false;
    estadoComponentesChk.checked = false;
    cambioPastaChk.checked = false;
    funcionamientoChk.checked = false;
    observacionesTrimestral.value = '';
    eliminarMantencionSemanalBtn.style.display = 'none';
    return;
  }

  const res = await fetch(`/estado_semanal?equipo_id=${equipo_id}&fecha=${fecha}`);
  const estado = await res.json();

  if (estado) {
    mantencionChk.checked = !!estado.mantencion;
    estadoComponentesChk.checked = !!estado.estado_componentes;
    cambioPastaChk.checked = !!estado.cambio_pasta_termica;
    funcionamientoChk.checked = !!estado.funcionamiento_equipo;
    observacionesTrimestral.value = estado.observaciones || '';
    eliminarMantencionSemanalBtn.style.display = 'inline';
    eliminarMantencionSemanalBtn.dataset.mantencionId = estado.id;
  } else {
    mantencionChk.checked = false;
    estadoComponentesChk.checked = false;
    cambioPastaChk.checked = false;
    funcionamientoChk.checked = false;
    observacionesTrimestral.value = '';
    eliminarMantencionSemanalBtn.style.display = 'none';
    eliminarMantencionSemanalBtn.dataset.mantencionId = '';
  }
}
