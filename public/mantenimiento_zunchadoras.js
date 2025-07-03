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

export async function actualizarFechasZunchadoras() {
  const zunchadoraId = zunchadoraSelect.value;
  if (!zunchadoraId) return;

  try {
    const res = await fetch(`/mantenimientos-fechas-zunchadora?zunchadora_id=${zunchadoraId}`);
    const data = await res.json();
    fechaZunchadoraInput = data.fechas || [];

    if (pickerZunchadora) {
      pickerZunchadora.destroy(); // Elimina el anterior si ya existe
    }

    pickerZunchadora = flatpickr(fechaZunchadoraInput, {
      locale: 'es',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'F j, Y',
      defaultDate: new Date(),
      onDayCreate: function (_, __, ___, dayElem) {
        const date = dayElem.dateObj.toISOString().split('T')[0];
        if (fechasZunchadora.includes(date)) {
          dayElem.classList.add('fecha-con-marca');
        }
      },
      onChange: cargarEstadoZunchadora
    });
  } catch (err) {
    console.error('Error al cargar fechas de zunchadoras:', err);
  }
}
