import { equipoSelect, 
         nuevoNombre, 
         nuevoDestinado, 
         crearEquipoBtn, 
         eliminarEquipoBtn, 
         cargarEquipos } from './equipo.js';
import { fechaInput, 
         limpiezaChk, 
         conexionesChk, 
         verificacionChk, 
         observaciones, 
         eliminarMantencionBtn, 
         cargarEstado } from './mantenimiento.js';
import { mantencionChk, 
         estadoComponentesChk, 
         cambioPastaChk, 
         funcionamientoChk, 
         observacionesTrimestral, 
         eliminarMantencionSemanalBtn, 
         cargarEstadoSemanal} from './mantenimiento_semanal.js';
import { fechaZunchadoraInput, 
         mantencionZunChk, 
         estadoComponentesZunChk, 
         limpiezaZunChk, 
         funcionamientoZunChk,
         observacionesZunchadora, 
         eliminarMantencionZunchadoraBtn,
         cargarEstadoZunchadora,} from './mantenimiento_zunchadoras.js';
import { zunchadoraSelect, 
         cargarZunchadoras } from './zunchadoras.js'; 



// Importar idioma español para flatpickr

let fechasMantenimiento = [];
const guardarBtn = document.getElementById('guardarBtn');

// Inicializar flatpickr
const picker = flatpickr(fechaInput, {
  //pon el lenguaje español
  locale: es,
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

const pickerZunchadora = flatpickr(fechaZunchadoraInput, {
  locale: es,
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
    cargarEstadoZunchadora();
  }
});

//Actualziar FechasCalendario mantenimiento equipos
export async function actualizarFechasCalendario() {
  const equipoId = equipoSelect.value;
  if (!equipoId) return;

  try {
    let fechasTotales = [];

    const resMant = await fetch(`/mantenimientos-fechas?equipo_id=${equipoId}`);
    const dataMant = await resMant.json();
    const fechasMant = dataMant.fechas || [];

    const resMantSem = await fetch(`/mantenimientos-fechas-semanal?equipo_id=${equipoId}`);
    const dataMantSem = await resMantSem.json();
    const fechasMantSem = dataMantSem.fechas || [];

    fechasTotales = fechasTotales.concat(fechasMant, fechasMantSem);

    // Quitar duplicados
    fechasMantenimiento = [...new Set(fechasTotales)];
    // Actualizar calendario de equipos
    picker.redraw();
  } catch (err) {
    console.error('Error cargando fechas de equipos:', err);
  }
}

// Actualizar FechasCalendario zunchadoras
export async function actualizarFechasZunchadora() {
  const zunchadoraId = zunchadoraSelect?.value;
  if (!zunchadoraId) return;

  try {
    const resZunch = await fetch(`/mantenimientos-fechas-zunchadora?zunchadora_id=${zunchadoraId}`);
    const dataZunch = await resZunch.json();
    const fechasZunch = dataZunch.fechas || [];

    fechasMantenimiento = [...new Set(fechasZunch)];
    // Actualizar calendario de zunchadoras
    pickerZunchadora.redraw();
  } catch (err) {
    console.error('Error cargando fechas de zunchadora:', err);
  }
}


// export async function actualizarFechasCalendario() {
//   const equipoId = equipoSelect.value;
//   const zunchadoraId = zunchadoraSelect?.value; // Solo si tienes ese elemento

//   if (!equipoId && !zunchadoraId) return;

//   try {
//     let fechasTotales = [];

//     if (equipoId) {
//       const resMant = await fetch(`/mantenimientos-fechas?equipo_id=${equipoId}`);
//       const dataMant = await resMant.json();
//       const fechasMant = dataMant.fechas || [];

//       const resMantSem = await fetch(`/mantenimientos-fechas-semanal?equipo_id=${equipoId}`);
//       const dataMantSem = await resMantSem.json();
//       const fechasMantSem = dataMantSem.fechas || [];

//       fechasTotales = fechasTotales.concat(fechasMant, fechasMantSem);
//     }

//     if (zunchadoraId) {
//       const resZunch = await fetch(`/mantenimientos-fechas-zunchadora?zunchadora_id=${zunchadoraId}`);
//       const dataZunch = await resZunch.json();
//       const fechasZunch = dataZunch.fechas || [];

//       fechasTotales = fechasTotales.concat(fechasZunch);
//     }

//     // Quitar duplicados
//     fechasMantenimiento = [...new Set(fechasTotales)];
//     // Actualizar el calendario
//     picker.redraw();
//     pickerZunchadora.redraw();
//   } catch (err) {
//     console.error('Error cargando fechas:', err);
//   }
// }


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

// Guardad mantencion zunchadoras
document.getElementById('guardarMantencionZunchadoraBtn')?.addEventListener('click', async () => {
  const zunchadora_id = zunchadoraSelect.value;
  const fecha = fechaZunchadoraInput.value;

  if (!zunchadora_id || !fecha) {
    alert('Por favor selecciona una zunchadora y una fecha válida.');
    return;
  }

  const body = {
    zunchadora_id: parseInt(zunchadora_id),
    fecha,
    mantencion: mantencionZunChk.checked,
    estado_componentes: estadoComponentesZunChk.checked,
    Limpieza: limpiezaZunChk.checked,
    funcionamiento_equipo: funcionamientoZunChk.checked,
    observaciones: observacionesZunchadora.value.trim()
  };

  try {
    const res = await fetch('/estado_zunchadora', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    alert(data.message);
    cargarEstadoZunchadora();
    actualizarFechasZunchadora();
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

crearZunchadoraBtn.addEventListener('click', async () => {
  const numero = nuevaZunchadora.value.trim();
  if (!numero) return alert('Ingresa el número de la zunchadora');

  const res = await fetch('/zunchadoras', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numero_zunchadora: numero })
  });

  const data = await res.json();
  if (data.error) {
    alert('Error: ' + data.error);
  } else {
    alert('Zunchadora creada');
    nuevaZunchadora.value = '';
    await cargarZunchadoras();
    
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


//Eliminar zunchadoras
eliminarZunchadoraBtn.addEventListener('click', async () => {
  if (!confirm('¿Eliminar esta zunchadora y su historial?')) return;
  const id = zunchadoraSelect.value;
  const res = await fetch(`/zunchadoras/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.error) {
    alert('Error: ' + data.error);
  } else {
    alert(data.message);
    await cargarZunchadoras();
    actualizarFechasCalendario();
  }
});

// Eliminar mantencion zunchadora
eliminarMantencionZunchadoraBtn?.addEventListener('click', async () => {
  if (!confirm('¿Quieres eliminar esta mantención?')) return;

  const id = eliminarMantencionZunchadoraBtn.dataset.mantencionId;
  if (!id) return;

  const res = await fetch(`/mantenimientozunchadora/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.error) {
    alert('Error: ' + data.error);
  } else {
    alert(data.message);
    cargarEstadoZunchadora();
    actualizarFechasZunchadora();
  }
});

// eventos de zunchadora
zunchadoraSelect?.addEventListener('change', () => {
  cargarEstadoZunchadora();
  actualizarFechasZunchadora();
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

fechaZunchadoraInput.addEventListener('change', () => {
  cargarEstadoZunchadora();
  actualizarFechasZunchadora();
});

// Carga inicial
cargarEquipos();
actualizarFechasCalendario();
actualizarFechasZunchadora();
cargarZunchadoras();
cargarEstado();

