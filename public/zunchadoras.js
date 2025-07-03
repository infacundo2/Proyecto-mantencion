// zunchadoras.js: gestión de zunchadoras

export const zunchadoraSelect = document.getElementById('zunchadoraSelect');
export const nuevaZunchadora = document.getElementById('nuevaZunchadora'); // input opcional si quieres crear
export const crearZunchadoraBtn = document.getElementById('crearZunchadoraBtn'); // botón opcional
export const eliminarZunchadoraBtn = document.getElementById('eliminarZunchadoraBtn'); // botón opcional

// Cargar listado de zunchadoras en el select
export async function cargarZunchadoras() {
  try {
    const res = await fetch('/zunchadoras');
    if (!res.ok) throw new Error('Error al obtener las zunchadoras');
    const zunchadoras = await res.json();

    zunchadoraSelect.innerHTML = '';

    zunchadoras.forEach(z => {
      const option = document.createElement('option');
      option.value = z.id;
      option.textContent = `${z.numero_zunchadora}`;
      zunchadoraSelect.appendChild(option);
    });

    if (zunchadoras.length > 0) {
      zunchadoraSelect.value = zunchadoras[0].id;
    }

    console.log('Zunchadoras cargados:', zunchadoras);
      } catch (error) {
        console.error('Error en cargar Zuncahdoras', error);
        alert('Error cargando Zcunchadoras');
      }
}
