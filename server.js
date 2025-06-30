const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
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
  
//  ZUNCHADORAS             

// Obtener lista de zunchadoras
app.get('/zunchadoras', (req, res) => {
  db.query('SELECT * FROM zunchadoras', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Crear nueva zunchadora
app.post('/zunchadoras', (req, res) => {
  const { numero_zunchadora } = req.body;
  if (!numero_zunchadora) return res.status(400).json({ error: 'Falta número de zunchadora' });

  db.query(
    'INSERT INTO zunchadoras (`Numero zunchadora`) VALUES (?)',
    [numero_zunchadora],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, message: 'Zunchadora creada' });
    }
  );
});

// Eliminar zunchadora
app.delete('/zunchadoras/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM zunchadoras WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Zunchadora no encontrada' });
    res.json({ message: 'Zunchadora eliminada' });
  });
});

// Obtener estado de zunchadora por fecha
app.get('/estado_zunchadora', (req, res) => {
  const { zunchadora_id, fecha } = req.query;
  if (!zunchadora_id || !fecha) {
    return res.status(400).json({ error: 'Faltan parámetros zunchadora_id o fecha' });
  }

  db.query(
    'SELECT * FROM mantenimiento_zunchadoras WHERE zunchadora_id = ? AND fecha = ?',
    [zunchadora_id, fecha],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0] || null);
    }
  );
});

// Guardar o actualizar mantención de zunchadora
app.post('/estado_zunchadora', (req, res) => {
  const {
    zunchadora_id,
    fecha,
    mantencion,
    estado_componentes,
    Limpieza,
    funcionamiento_equipo,
    observaciones
  } = req.body;

  if (!zunchadora_id || !fecha) {
    return res.status(400).json({ error: 'Faltan zunchadora_id o fecha' });
  }

  db.query(
    'SELECT * FROM mantenimiento_zunchadoras WHERE zunchadora_id = ? AND fecha = ?',
    [zunchadora_id, fecha],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        // Actualizar
        db.query(
          `UPDATE mantenimiento_zunchadoras
           SET mantencion = ?, estado_componentes = ?, Limpieza = ?, funcionamiento_equipo = ?, observaciones = ?
           WHERE zunchadora_id = ? AND fecha = ?`,
          [mantencion, estado_componentes, Limpieza, funcionamiento_equipo, observaciones, zunchadora_id, fecha],
          err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Mantención actualizada' });
          }
        );
      } else {
        // Insertar
        db.query(
          `INSERT INTO mantenimiento_zunchadoras
           (zunchadora_id, fecha, mantencion, estado_componentes, Limpieza, funcionamiento_equipo, observaciones)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [zunchadora_id, fecha, mantencion, estado_componentes, Limpieza, funcionamiento_equipo, observaciones],
          err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Mantención guardada' });
          }
        );
      }
    }
  );
});

// Eliminar mantención de zunchadora
app.delete('/mantenimientozunchadora/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM mantenimiento_zunchadoras WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Mantención no encontrada' });
    res.json({ message: 'Mantención eliminada' });
  });
});

// Obtener fechas de mantenciones de zunchadora
app.get('/mantenimientos-fechas-zunchadora', (req, res) => {
  const { zunchadora_id } = req.query;
  if (!zunchadora_id) return res.status(400).json({ error: 'ID de zunchadora requerido' });

  db.query(
    'SELECT fecha FROM mantenimiento_zunchadoras WHERE zunchadora_id = ?',
    [zunchadora_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener fechas' });
      const fechas = results.map(row => new Date(row.fecha).toISOString().split('T')[0]);
      res.json({ fechas });
    }
  );
});

// FIN ZUNCHADORAS

// Servidor escuchando
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
