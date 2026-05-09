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
// Agrupa por Banda > Empresa, cuenta MASCULINO/FEMENINO
// Solo registros Tipo='M' (ocupados) con GeneroH válido
app.get('/api/reports/banda-genero', async (req, res) => {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Falta el parámetro fecha' });
    try {
        const rows = await query(`
            SELECT
                Banda,
                nombreempr AS empresa,
                SUM(CASE WHEN GeneroH = 'MASCULINO' THEN 1 ELSE 0 END) AS masculino,
                SUM(CASE WHEN GeneroH = 'FEMENINO'  THEN 1 ELSE 0 END) AS femenino,
                COUNT(*) AS total
            FROM [dbo].[HistoryOcu]
            WHERE CAST(FechaPer AS DATE) = ?
              AND Tipo = 'M'
              AND GeneroH IN ('MASCULINO', 'FEMENINO')
              AND Banda <> ''
            GROUP BY Banda, nombreempr
            ORDER BY Banda, nombreempr
        `, [fecha]);
        res.json(rows);
    } catch (err) {
        console.error('Error reporte 1:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── REPORTE 2: Total por Género ─────────────────────────────────────────────
// Solo registros ocupados (Tipo='M') con género válido
app.get('/api/reports/total-genero', async (req, res) => {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Falta el parámetro fecha' });
    try {
        const rows = await query(`
            SELECT
                GeneroH AS genero,
                COUNT(*) AS cantidad,
                CAST(ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 0) AS INT) AS porcentaje
            FROM [dbo].[HistoryOcu]
            WHERE CAST(FechaPer AS DATE) = ?
              AND Tipo = 'M'
              AND GeneroH IN ('MASCULINO', 'FEMENINO')
            GROUP BY GeneroH
            ORDER BY GeneroH
        `, [fecha]);
        res.json(rows);
    } catch (err) {
        console.error('Error reporte 2:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── REPORTE 3: Por Módulo y Nivel ───────────────────────────────────────────
// Módulos reales: Manager, Worker01, Worker02
// Niveles reales ocupados: WK, STAF TECK, STAFF
// Disponible = Tipo='L', Ocupado = Tipo='M'
app.get('/api/reports/modulo-nivel', async (req, res) => {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Falta el parámetro fecha' });
    try {
        const rows = await query(`
            SELECT
                nombreedif AS modulo,
                CASE
                    WHEN NivelHuesped IN ('WK','STAF TECK','STAFF') THEN NivelHuesped
                    ELSE 'Sin nivel'
                END AS nivel,
                SUM(CASE WHEN Tipo = 'L' THEN 1 ELSE 0 END) AS disponible,
                SUM(CASE WHEN Tipo = 'M' THEN 1 ELSE 0 END) AS ocupado,
                COUNT(*) AS total
            FROM [dbo].[HistoryOcu]
            WHERE CAST(FechaPer AS DATE) = ?
            GROUP BY nombreedif,
                     CASE
                         WHEN NivelHuesped IN ('WK','STAF TECK','STAFF') THEN NivelHuesped
                         ELSE 'Sin nivel'
                     END
            ORDER BY nombreedif, nivel
        `, [fecha]);
        res.json(rows);
    } catch (err) {
        console.error('Error reporte 3:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── REPORTE 4: Ocupabilidad Histórica ──────────────────────────────────────
// Cuenta ocupantes reales (Tipo='M') por día en el rango
app.get('/api/reports/ocupabilidad', async (req, res) => {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) return res.status(400).json({ error: 'Faltan parámetros desde/hasta' });
    try {
        const rows = await query(`
            SELECT
                CAST(FechaPer AS DATE) AS fecha,
                COUNT(*) AS ocupantes
            FROM [dbo].[HistoryOcu]
            WHERE CAST(FechaPer AS DATE) BETWEEN ? AND ?
              AND Tipo = 'M'
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