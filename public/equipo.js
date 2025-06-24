// equipo.js: gestión de equipos

export const equipoSelect = document.getElementById('equipoSelect');
export const nuevoNombre = document.getElementById('nuevoNombre');
export const nuevoDestinado = document.getElementById('nuevoDestinado');
export const crearEquipoBtn = document.getElementById('crearEquipoBtn');
export const eliminarEquipoBtn = document.getElementById('eliminarEquipoBtn');

export async function cargarEquipos() {
      try {
        const res = await fetch('/equipos');
        if (!res.ok) throw new Error('Error al obtener los equipos');
        const equipos = await res.json();
    
        equipoSelect.innerHTML = '';
    
        equipos.forEach(equipo => {
          const option = document.createElement('option');
          option.value = equipo.id;
          option.textContent = `${equipo.nombre_equipo} (${equipo.destinado_a})`;
          equipoSelect.appendChild(option);
        });
    
        if (equipos.length > 0) {
          equipoSelect.value = equipos[0].id;
        }
    
        console.log('Equipos cargados:', equipos);
      } catch (error) {
        console.error('Error en cargarEquipos:', error);
        alert('Error cargando equipos');
      }
    }
    
    
