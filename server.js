// ============================================
// PROYECTO 19 - SERVIDOR BACKEND (server.js)
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const sql = require('msnodesqlv8');

const app = express();
const PORT = 4000;

// ─── CONFIGURACIÓN ──────────────────────────────────────────────────────────
const connStr = "Driver={SQL Server};Server=localhost;Database=hospestar;Trusted_Connection=yes;";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ─── HELPER ─────────────────────────────────────────────────────────────────
function query(sqlStr, params = []) {
    return new Promise((resolve, reject) => {
        sql.query(connStr, sqlStr, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// ─── TEST CONEXIÓN ───────────────────────────────────────────────────────────
query("SELECT 1 AS ok")
    .then(() => console.log('✅ Conectado a SQL Server - hospestar'))
    .catch(err => console.error('❌ Error BD:', err.message));

// ─── REPORTE 1: Resumen por Banda y Género ───────────────────────────────────
app.get('/api/reports/banda-genero', async (req, res) => {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Falta el parámetro fecha' });
    try {
        const rows = await query(`
            SELECT
                Banda AS banda,
                SUM(CASE WHEN genero = 'M' THEN 1 ELSE 0 END) AS masculino,
                SUM(CASE WHEN genero = 'F' THEN 1 ELSE 0 END) AS femenino,
                COUNT(*) AS total
            FROM HistoryOcu
            WHERE CAST(FechaPer AS DATE) = ?
            GROUP BY Banda
            ORDER BY Banda
        `, [fecha]);
        res.json(rows);
    } catch (err) {
        console.error('Error reporte 1:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── REPORTE 2: Total por Género ─────────────────────────────────────────────
app.get('/api/reports/total-genero', async (req, res) => {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Falta el parámetro fecha' });
    try {
        const rows = await query(`
            SELECT
                genero AS genero,
                COUNT(*) AS cantidad,
                CAST(ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS DECIMAL(5,2)) AS porcentaje
            FROM HistoryOcu
            WHERE CAST(FechaPer AS DATE) = ?
            GROUP BY genero
            ORDER BY genero
        `, [fecha]);
        res.json(rows);
    } catch (err) {
        console.error('Error reporte 2:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── REPORTE 3: Por Módulo (Edificio) y Nivel ────────────────────────────────
app.get('/api/reports/modulo-nivel', async (req, res) => {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Falta el parámetro fecha' });
    try {
        const rows = await query(`
            SELECT
                CONCAT(nombreedif, ' / ', Nombre) AS modulo,
                SUM(CASE WHEN ESTADO = 'D' THEN 1 ELSE 0 END) AS disponible,
                SUM(CASE WHEN ESTADO = 'O' THEN 1 ELSE 0 END) AS ocupado,
                COUNT(*) AS total
            FROM HistoryOcu
            WHERE CAST(FechaPer AS DATE) = ?
            GROUP BY nombreedif, Nombre
            ORDER BY nombreedif, Nombre
        `, [fecha]);
        res.json(rows);
    } catch (err) {
        console.error('Error reporte 3:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── REPORTE 4: Ocupabilidad Histórica ──────────────────────────────────────
app.get('/api/reports/ocupabilidad', async (req, res) => {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) return res.status(400).json({ error: 'Faltan parámetros desde/hasta' });
    try {
        const rows = await query(`
            SELECT
                CAST(FechaPer AS DATE) AS fecha,
                COUNT(*) AS ocupantes
            FROM HistoryOcu
            WHERE CAST(FechaPer AS DATE) BETWEEN ? AND ?
            GROUP BY CAST(FechaPer AS DATE)
            ORDER BY CAST(FechaPer AS DATE)
        `, [desde, hasta]);
        res.json(rows);
    } catch (err) {
        console.error('Error reporte 4:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── RUTA RAÍZ ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── INICIAR ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
});