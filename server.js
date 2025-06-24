const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MySQL local
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '', // Cambia si tienes contraseña
//   database: 'gestion_equipos',
// });
const db = mysql.createConnection({
    host: '190.107.177.243',
    user: 'cja63651_cja63651',
    password: 'Pesso@01', // Cambia si tienes contraseña
    database: 'cja63651_Checklist_Base',
  });

db.connect(err => {
  if (err) throw err;
  console.log('Conectado a MySQL');
});

// --- RUTAS ---

// Obtener lista de equipos
app.get('/equipos', (req, res) => {
  db.query('SELECT * FROM equipos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Obtener estado de equipo en fecha específica
app.get('/estado', (req, res) => {
  const { equipo_id, fecha } = req.query;
  if (!equipo_id || !fecha) {
    return res.status(400).json({ error: 'Faltan parámetros equipo_id o fecha' });
  }
  const sql = `
    SELECT * FROM mantenimiento
    WHERE equipo_id = ? AND fecha = ?
  `;
  db.query(sql, [equipo_id, fecha], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      // No hay mantenimiento registrado para esa fecha
      return res.json(null);
    }
    res.json(results[0]);
  });
});
//Obtencion de fechas 
app.get('/mantenimientos-fechas', (req, res) => {
    const equipo_id = req.query.equipo_id;
    if (!equipo_id) return res.status(400).json({ error: 'ID de equipo requerido' });
  
    db.query(
      'SELECT fecha FROM mantenimiento WHERE equipo_id = ?',
      [equipo_id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error al obtener fechas' });
        }
  
        const fechas = results.map(row => {
          const fecha = new Date(row.fecha);
          return fecha.toISOString().split('T')[0];
        });
  
        res.json({ fechas });
      }
    );
  });
  
app.get('/mantenimientos-fechas-semanal', (req, res) => {
    const equipo_id = req.query.equipo_id;
    if (!equipo_id) return res.status(400).json({ error: 'ID de equipo requerido' });
  
    db.query(
      'SELECT fecha FROM mantenimiento_semanal WHERE equipo_id = ?',
      [equipo_id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error al obtener fechas' });
        }
  
        const fechas = results.map(row => {
          const fecha = new Date(row.fecha);
          return fecha.toISOString().split('T')[0];
        });
  
        res.json({ fechas });
      }
    );
  });
// Fin de obtencion de fechas   

// Obtener estado semanal
app.get('/estado_semanal', (req, res) => {
    const { equipo_id, fecha } = req.query;
    if (!equipo_id || !fecha) {
      return res.status(400).json({ error: 'Faltan parámetros equipo_id o fecha' });
    }
  
    const sql = `
      SELECT * FROM mantenimiento_semanal
      WHERE equipo_id = ? AND fecha = ?
    `;
    db.query(sql, [equipo_id, fecha], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.json(null);
      res.json(results[0]);
    });
  });
  
  // Guardar o actualizar mantención semanal
  app.post('/estado_semanal', (req, res) => {
    const {
      equipo_id,
      fecha,
      mantencion,
      estado_componentes,
      cambio_pasta_termica,
      funcionamiento_equipo,
      observaciones
    } = req.body;
  
    if (!equipo_id || !fecha) {
      return res.status(400).json({ error: 'Faltan equipo_id o fecha' });
    }
  
    const checkSql = `
      SELECT * FROM mantenimiento_semanal WHERE equipo_id = ? AND fecha = ?
    `;
    db.query(checkSql, [equipo_id, fecha], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
  
      if (results.length > 0) {
        const updateSql = `
          UPDATE mantenimiento_semanal
          SET mantencion = ?, estado_componentes = ?, cambio_pasta_termica = ?, funcionamiento_equipo = ?, observaciones = ?
          WHERE equipo_id = ? AND fecha = ?
        `;
        db.query(
          updateSql,
          [mantencion, estado_componentes, cambio_pasta_termica, funcionamiento_equipo, observaciones, equipo_id, fecha],
          err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Mantención semanal actualizada' });
          }
        );
      } else {
        const insertSql = `
          INSERT INTO mantenimiento_semanal (equipo_id, fecha, mantencion, estado_componentes, cambio_pasta_termica, funcionamiento_equipo, observaciones)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
          insertSql,
          [equipo_id, fecha, mantencion, estado_componentes, cambio_pasta_termica, funcionamiento_equipo, observaciones],
          err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Mantención semanal guardada' });
          }
        );
      }
    });
  });
  
  // Eliminar mantención semanal
  app.delete('/mantenimientosemanal/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM mantenimiento_semanal WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Mantención semanal no encontrada' });
      res.json({ message: 'Mantención semanal eliminada' });
    });
  });
  

// Guardar o actualizar estado de equipo en fecha específica
app.post('/estado', (req, res) => {
    const { equipo_id, fecha, limpieza, conexiones, verificacion, observaciones } = req.body;
    if (!equipo_id || !fecha) {
      return res.status(400).json({ error: 'Faltan equipo_id o fecha' });
    }
  
    const checkSql = `
      SELECT * FROM mantenimiento WHERE equipo_id = ? AND fecha = ?
    `;
    db.query(checkSql, [equipo_id, fecha], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
  
      if (results.length > 0) {
        // Actualizar
        const updateSql = `
          UPDATE mantenimiento
          SET limpieza = ?, conexiones = ?, verificacion = ?, observaciones = ?
          WHERE equipo_id = ? AND fecha = ?
        `;
        db.query(
          updateSql,
          [limpieza, conexiones, verificacion, observaciones, equipo_id, fecha],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Estado actualizado' });
          }
        );
      } else {
        // Insertar nuevo
        const insertSql = `
          INSERT INTO mantenimiento (equipo_id, fecha, limpieza, conexiones, verificacion, observaciones)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(
          insertSql,
          [equipo_id, fecha, limpieza, conexiones, verificacion, observaciones],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Estado guardado' });
          }
        );
      }
    });
  });
  

// Crear nuevo equipo (opcional)
app.post('/equipos', (req, res) => {
  const { nombre_equipo, destinado_a } = req.body;
  if (!nombre_equipo || !destinado_a) {
    return res.status(400).json({ error: 'Faltan nombre_equipo o destinado_a' });
  }
  db.query(
    'INSERT INTO equipos (nombre_equipo, destinado_a) VALUES (?, ?)',
    [nombre_equipo, destinado_a],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, message: 'Equipo creado' });
    }
  );
});

// Eliminar equipo por id
app.delete('/equipos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM equipos WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Equipo no encontrado' });
      res.json({ message: 'Equipo eliminado' });
    });
  });
  
  // Eliminar mantención por id
  app.delete('/mantenimiento/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM mantenimiento WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Mantención no encontrada' });
      res.json({ message: 'Mantención eliminada' });
    });
  });
  

// Servidor escuchando
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
