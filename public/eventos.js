import { equipoSelect, nuevoNombre, nuevoDestinado, crearEquipoBtn, eliminarEquipoBtn, cargarEquipos } from './equipo.js';
import { fechaInput, limpiezaChk, conexionesChk, verificacionChk, observaciones, eliminarMantencionBtn, cargarEstado } from './mantenimiento.js';
import { mantencionChk, estadoComponentesChk, cambioPastaChk, funcionamientoChk, observacionesTrimestral, eliminarMantencionSemanalBtn, cargarEstadoSemanal} from './mantenimiento_semanal.js';


// Importar idioma español para flatpickr

let fechasMantenimiento = [];
const guardarBtn = document.getElementById('guardarBtn');

// Inicializar flatpickr
const picker = flatpickr(fechaInput, {
  locale: 'es',
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'F j, Y',
  allowInput: true,
  monthSelectorType: 'dropdown',
  yearSelectorType: 'dropdown',
  onDayCreate: function(_, __, ___, dayElem) {
    const date = dayElem.dateObj.toISOString().split('T')[0];
    if (fechasMantenimiento.includes(date)) {
      dayElem.classList.add('fecha-con-marca');
    }
  },
  onChange: function() {
    cargarEstado();
  }
});


// Función para actualizar el calendario con fechas de mantenciones
// export async function actualizarFechasCalendario() {
//   const equipoId = equipoSelect.value;
//   if (!equipoId) return;

//   try {
//     const res = await fetch(`/mantenimientos-fechas?equipo_id=${equipoId}`);
//     const data = await res.json();
//     fechasMantenimiento = data.fechas || [];
//     picker.redraw(); // Redibuja para marcar las fechas
//   } catch (err) {
//     console.error('Error cargando fechas:', err);
//   }
// }
export async function actualizarFechasCalendario() {
  const equipoId = equipoSelect.value;
  if (!equipoId) return;

  try {
    // Traer fechas de mantenimiento
    const resMant = await fetch(`/mantenimientos-fechas?equipo_id=${equipoId}`);
    const dataMant = await resMant.json();
    const fechasMant = dataMant.fechas || [];

    // Traer fechas de mantenimiento semanal
    const resMantSem = await fetch(`/mantenimientos-fechas-semanal?equipo_id=${equipoId}`);
    const dataMantSem = await resMantSem.json();
    const fechasMantSem = dataMantSem.fechas || [];

    // Unir fechas y eliminar duplicados
    fechasMantenimiento = [...new Set([...fechasMant, ...fechasMantSem])];

    picker.redraw(); // Redibuja para marcar las fechas
  } catch (err) {
    console.error('Error cargando fechas:', err);
  }
}


// Guardar mantención
guardarBtn.addEventListener('click', async () => {
  const equipo_id = equipoSelect.value;
  const fecha = fechaInput.value;
  if (!equipo_id || !fecha) {
    alert('Por favor selecciona un equipo y una fecha válida.');
    return;
  }

  const body = {
    equipo_id: parseInt(equipo_id),
    fecha,
    limpieza: limpiezaChk.checked,
    conexiones: conexionesChk.checked,
    verificacion: verificacionChk.checked,
    observaciones: observaciones.value.trim()
  };

  try {
    const res = await fetch('/estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    alert(data.message);
    cargarEstado();
    actualizarFechasCalendario();
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  }
});

document.getElementById('guardarMantencionSemanalBtn')?.addEventListener('click', async () => {
  const equipo_id = equipoSelect.value;
  const fecha = fechaInput.value;
  if (!equipo_id || !fecha) {
    alert('Por favor selecciona un equipo y una fecha válida.');
    return;
  }

  const body = {
    equipo_id: parseInt(equipo_id),
    fecha,
    mantencion: mantencionChk.checked,
    estado_componentes: estadoComponentesChk.checked,
    cambio_pasta_termica: cambioPastaChk.checked,
    funcionamiento_equipo: funcionamientoChk.checked,
    observaciones: observacionesTrimestral.value.trim()
  };

  try {
    const res = await fetch('/estado_semanal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    alert(data.message);
    cargarEstadoSemanal();
    actualizarFechasCalendario();
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  }
});


// Crear nuevo equipo
crearEquipoBtn.addEventListener('click', async () => {
  const nombre = nuevoNombre.value.trim();
  const destinado = nuevoDestinado.value.trim();
  if (!nombre || !destinado) {
    alert('Por favor completa nombre y destinado a.');
    return;
  }

  const res = await fetch('/equipos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre_equipo: nombre, destinado_a: destinado }),
  });

  const data = await res.json();
  if (data.error) {
    alert('Error: ' + data.error);
  } else {
    alert('Equipo creado!');
    nuevoNombre.value = '';
    nuevoDestinado.value = '';
    await cargarEquipos();
    actualizarFechasCalendario();
  }
});

// Eliminar equipo
eliminarEquipoBtn.addEventListener('click', async () => {
  if (!confirm('¿Seguro que quieres eliminar este equipo y todo su historial?')) return;

  const id = equipoSelect.value;
  const res = await fetch(`/equipos/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.error) {
    alert('Error: ' + data.error);
  } else {
    alert(data.message);
    await cargarEquipos();
    fechaInput.value = '';
    limpiezaChk.checked = false;
    conexionesChk.checked = false;
    verificacionChk.checked = false;
    observaciones.value = '';
    eliminarMantencionBtn.style.display = 'none';
    actualizarFechasCalendario();
  }
});

// Eliminar mantención
eliminarMantencionBtn.addEventListener('click', async () => {
  if (!confirm('¿Quieres eliminar esta mantención?')) return;

  const id = eliminarMantencionBtn.dataset.mantencionId;
  if (!id) return;

  const res = await fetch(`/mantenimiento/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.error) {
    alert('Error: ' + data.error);
  } else {
    alert(data.message);
    cargarEstado();
    actualizarFechasCalendario();
  }
});

// Eliminar mantención semanal
eliminarMantencionSemanalBtn.addEventListener('click', async () => {
  if (!confirm('¿Quieres eliminar esta mantención?')) return;

  const id = eliminarMantencionSemanalBtn.dataset.mantencionId;
  if (!id) return;

  const res = await fetch(`/mantenimientosemanal/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.error) {
    alert('Error: ' + data.error);
  } else {
    alert(data.message);
    cargarEstado();
    actualizarFechasCalendario();
  }
});


// Eventos al cambiar selección
equipoSelect.addEventListener('change', () => {
  actualizarFechasCalendario();
  cargarEstado();
  cargarEstadoSemanal();
});


fechaInput.addEventListener('change', () => {
  cargarEstado();
  cargarEstadoSemanal();
});


// Carga inicial
cargarEquipos();
actualizarFechasCalendario();
