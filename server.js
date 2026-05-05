// ============================================
// PROYECTO 19 - SERVIDOR NODE.JS
// ============================================

const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (SIN express.static aquí)
app.use(cors());
app.use(express.json());

// ========== CONFIGURACIÓN SQL SERVER ==========
const dbConfig = {
    user: 'proyecto19',
    password: 'Proyecto123',
    server: 'localhost',
    database: 'hospestar',
    options: {
        encrypt: false,
        enableArithAbort: true
    }
};

// Pool de conexión
let pool;

async function initializePool() {
    try {
        pool = await sql.connect(dbConfig);
        console.log('✅ Conectado a SQL Server');
    } catch (error) {
        console.error('❌ Error al conectar SQL Server:', error.message);
        console.error('💡 Verifica: usuario, contraseña, servidor en dbConfig');
        process.exit(1);
    }
}

// ========== RUTAS DE API (PRIMERO) ==========

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        database: 'hospestar',
        message: 'Servidor funcionando correctamente'
    });
});

// ========== REPORTE 1: BANDA Y GÉNERO ==========
app.get('/api/reports/banda-genero', async (req, res) => {
    try {
        const { fecha } = req.query;

        if (!fecha) {
            return res.status(400).json({ error: 'Parámetro fecha requerido' });
        }

        const query = `
            SELECT 
                ISNULL(Banda, 'Sin Banda') as banda,
                SUM(CASE WHEN GeneroH = 'MASCULINO' THEN 1 ELSE 0 END) as masculino,
                SUM(CASE WHEN GeneroH = 'FEMENINO' THEN 1 ELSE 0 END) as femenino,
                COUNT(*) as total
            FROM HistoryOcu
            WHERE CAST(FechaPer as DATE) = @fecha
            GROUP BY Banda
            ORDER BY Banda
        `;

        const request = pool.request();
        request.input('fecha', sql.Date, fecha);
        const result = await request.query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error en reporte 1:', error);
        res.status(500).json({ error: 'Error al procesar reporte' });
    }
});

// ========== REPORTE 2: TOTAL POR GÉNERO ==========
app.get('/api/reports/total-genero', async (req, res) => {
    try {
        const { fecha } = req.query;

        if (!fecha) {
            return res.status(400).json({ error: 'Parámetro fecha requerido' });
        }

        const query = `
            WITH Totales AS (
                SELECT 
                    GeneroH as genero,
                    COUNT(*) as cantidad
                FROM HistoryOcu
                WHERE CAST(FechaPer as DATE) = @fecha
                GROUP BY GeneroH
            )
            SELECT 
                genero,
                cantidad,
                CAST(ROUND(100.0 * cantidad / (SELECT SUM(cantidad) FROM Totales), 0) AS INT) as porcentaje
            FROM Totales
            ORDER BY cantidad DESC
        `;

        const request = pool.request();
        request.input('fecha', sql.Date, fecha);
        const result = await request.query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error en reporte 2:', error);
        res.status(500).json({ error: 'Error al procesar reporte' });
    }
});

// ========== REPORTE 3: MÓDULO Y NIVEL ==========
app.get('/api/reports/modulo-nivel', async (req, res) => {
    try {
        const { fecha } = req.query;

        if (!fecha) {
            return res.status(400).json({ error: 'Parámetro fecha requerido' });
        }

        const query = `
            SELECT 
                CONCAT(ISNULL(Tipo, 'Sin módulo'), ' - ', ISNULL(Codigo, 'Sin nivel')) as modulo,
                SUM(CASE WHEN Fechasalida > @fecha THEN 1 ELSE 0 END) as disponible,
                SUM(CASE WHEN Fechasalida <= @fecha THEN 1 ELSE 0 END) as ocupado,
                COUNT(*) as total
            FROM HistoryOcu
            WHERE CAST(FechaPer as DATE) = @fecha
            GROUP BY Tipo, Codigo
            ORDER BY Tipo, Codigo
        `;

        const request = pool.request();
        request.input('fecha', sql.Date, fecha);
        const result = await request.query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error en reporte 3:', error);
        res.status(500).json({ error: 'Error al procesar reporte' });
    }
});

// ========== REPORTE 4: OCUPABILIDAD HISTÓRICA ==========
app.get('/api/reports/ocupabilidad', async (req, res) => {
    try {
        const { desde, hasta } = req.query;

        if (!desde || !hasta) {
            return res.status(400).json({ 
                error: 'Parámetros desde y hasta requeridos' 
            });
        }

        const query = `
            SELECT 
                CONVERT(varchar, CAST(FechaPer as DATE), 23) as fecha,
                COUNT(DISTINCT dni) as ocupantes
            FROM HistoryOcu
            WHERE CAST(FechaPer as DATE) BETWEEN @desde AND @hasta
            GROUP BY CAST(FechaPer as DATE)
            ORDER BY CAST(FechaPer as DATE)
        `;

        const request = pool.request();
        request.input('desde', sql.Date, desde);
        request.input('hasta', sql.Date, hasta);
        const result = await request.query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error en reporte 4:', error);
        res.status(500).json({ error: 'Error al procesar reporte' });
    }
});

// ========== ESTADÍSTICAS GENERALES ==========
app.get('/api/stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as totalRegistros,
                COUNT(DISTINCT dni) as dnisUnicos,
                COUNT(DISTINCT nombreempr) as empresas,
                COUNT(DISTINCT Banda) as bandas,
                CONVERT(varchar, MIN(FechaPer), 23) as fechaMinima,
                CONVERT(varchar, MAX(FechaPer), 23) as fechaMaxima
            FROM HistoryOcu
        `;

        const result = await pool.request().query(query);
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error en estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// ========== ARCHIVOS ESTÁTICOS (AL FINAL) ==========
app.use(express.static(__dirname));  // ← MOVIDO AQUÍ

// Página principal (catch-all, debe ir al final)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== MANEJO DE ERRORES ==========
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// ========== INICIALIZAR SERVIDOR ==========
async function start() {
    try {
        await initializePool();
        
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║   🚀 Proyecto 19 - Servidor Activo    ║
╠════════════════════════════════════════╣
║   📍 URL: http://localhost:${PORT}       ║
║   📊 Base de Datos: hospestar          ║
║   ✅ Estado: Funcionando               ║
╚════════════════════════════════════════╝

📌 Abre tu navegador en: http://localhost:${PORT}
            `);
        });
    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
}

// Iniciar
start();

// Manejo de cierre
process.on('SIGTERM', async () => {
    console.log('\n🛑 Cerrando servidor...');
    if (pool) {
        await pool.close();
    }
    process.exit(0);
});