// ============================================
// PROYECTO 19 - JAVASCRIPT FRONTEND
// ============================================

// Variables globales
let currentReport = 1;
const API_URL = 'http://localhost:4000/api';

// Configuración de reportes
const reports = {
    1: {
        title: 'Resumen por Banda y Género',
        description: 'Tabla cruzada mostrando ocupación por banda vs género',
        dateType: 'single',
        dateLabel: 'Seleccione una fecha'
    },
    2: {
        title: 'Resumen Total por Género',
        description: 'Distribución de género con porcentajes totales',
        dateType: 'single',
        dateLabel: 'Seleccione una fecha'
    },
    3: {
        title: 'Resumen por Módulo y Nivel',
        description: 'Disponibilidad vs ocupación por módulo y nivel',
        dateType: 'single',
        dateLabel: 'Seleccione una fecha'
    },
    4: {
        title: 'Ocupabilidad Histórica',
        description: 'Gráfico de línea mostrando tendencia de ocupación',
        dateType: 'range',
        dateLabel: 'Seleccione rango de fechas'
    }
};

// ========== SELECCIONAR REPORTE ==========
function selectReport(reportNumber) {
    currentReport = reportNumber;

    // Actualizar botones activos
    document.querySelectorAll('.btn-report').forEach((btn, index) => {
        btn.classList.toggle('active', index + 1 === reportNumber);
    });

    // Actualizar título
    const report = reports[reportNumber];
    document.getElementById('report-title').textContent = `Reporte ${reportNumber}: ${report.title}`;

    // Actualizar selectores de fecha
    updateDateFilters(reportNumber);

    // Limpiar reporte anterior
    document.getElementById('report-container').innerHTML = `
        <div class="placeholder">
            <h3>👆 Haz clic en "Ver Reporte"</h3>
            <p>Selecciona la fecha y genera el reporte</p>
        </div>
    `;
    document.getElementById('info-section').style.display = 'none';
}

// ========== ACTUALIZAR FILTROS DE FECHA ==========
function updateDateFilters(reportNumber) {
    const filtersContainer = document.getElementById('date-filters');
    const report = reports[reportNumber];

    if (report.dateType === 'single') {
        filtersContainer.innerHTML = `
            <div class="date-group">
                <label for="single-date">📅 ${report.dateLabel}</label>
                <input type="date" id="single-date" value="2026-04-01">
            </div>
        `;
    } else if (report.dateType === 'range') {
        filtersContainer.innerHTML = `
            <div class="date-group">
                <label for="from-date">📅 Desde:</label>
                <input type="date" id="from-date" value="2026-04-01">
            </div>
            <div class="date-group">
                <label for="to-date">📅 Hasta:</label>
                <input type="date" id="to-date" value="2026-04-30">
            </div>
        `;
    }
}

// ========== CARGAR REPORTE ==========
async function loadReport() {
    showLoading(true);

    try {
        let data;
        
        switch(currentReport) {
            case 1:
                data = await fetchReport1();
                renderTable1(data);
                break;
            case 2:
                data = await fetchReport2();
                renderTable2(data);
                break;
            case 3:
                data = await fetchReport3();
                renderTable3(data);
                break;
            case 4:
                data = await fetchReport4();
                renderChart4(data);
                break;
        }

        showInfo(currentReport);
    } catch (error) {
        showError('Error al cargar el reporte: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ========== FETCH REPORTS ==========
async function fetchReport1() {
    const fecha = document.getElementById('single-date').value;
    const response = await fetch(`${API_URL}/reports/banda-genero?fecha=${fecha}`);
    if (!response.ok) throw new Error('Error en la solicitud');
    return await response.json();
}

async function fetchReport2() {
    const fecha = document.getElementById('single-date').value;
    const response = await fetch(`${API_URL}/reports/total-genero?fecha=${fecha}`);
    if (!response.ok) throw new Error('Error en la solicitud');
    return await response.json();
}

async function fetchReport3() {
    const fecha = document.getElementById('single-date').value;
    const response = await fetch(`${API_URL}/reports/modulo-nivel?fecha=${fecha}`);
    if (!response.ok) throw new Error('Error en la solicitud');
    return await response.json();
}

async function fetchReport4() {
    const desde = document.getElementById('from-date').value;
    const hasta = document.getElementById('to-date').value;
    const response = await fetch(`${API_URL}/reports/ocupabilidad?desde=${desde}&hasta=${hasta}`);
    if (!response.ok) throw new Error('Error en la solicitud');
    return await response.json();
}

// ========== RENDERIZAR TABLAS ==========
function renderTable1(data) {
    const container = document.getElementById('report-container');
    
    let html = '<table class="report-table"><thead><tr>';
    html += '<th>Etiquetas de fila</th>';
    html += '<th class="text-right">MASCULINO</th>';
    html += '<th class="text-right">FEMENINO</th>';
    html += '<th class="text-right">Total general</th>';
    html += '</tr></thead><tbody>';

    data.forEach(row => {
        html += '<tr>';
        html += `<td><strong>${row.banda}</strong></td>`;
        html += `<td class="text-right">${row.masculino || 0}</td>`;
        html += `<td class="text-right">${row.femenino || 0}</td>`;
        html += `<td class="text-right"><strong>${row.total || 0}</strong></td>`;
        html += '</tr>';
    });

    const totalM = data.reduce((sum, row) => sum + (row.masculino || 0), 0);
    const totalF = data.reduce((sum, row) => sum + (row.femenino || 0), 0);
    const totalGeneral = data.reduce((sum, row) => sum + (row.total || 0), 0);

    html += '</tbody><tfoot><tr>';
    html += '<td><strong>Total general</strong></td>';
    html += `<td class="text-right"><strong>${totalM}</strong></td>`;
    html += `<td class="text-right"><strong>${totalF}</strong></td>`;
    html += `<td class="text-right"><strong>${totalGeneral}</strong></td>`;
    html += '</tr></tfoot></table>';

    container.innerHTML = html;
}

function renderTable2(data) {
    const container = document.getElementById('report-container');
    
    let html = '<table class="report-table"><thead><tr>';
    html += '<th>Género</th>';
    html += '<th class="text-right">Cuenta de DNI</th>';
    html += '<th class="text-right">Porcentaje</th>';
    html += '</tr></thead><tbody>';

    data.forEach(row => {
        html += '<tr>';
        html += `<td><strong>${row.genero}</strong></td>`;
        html += `<td class="text-right">${row.cantidad}</td>`;
        html += `<td class="text-right">${row.porcentaje}%</td>`;
        html += '</tr>';
    });

    const total = data.reduce((sum, row) => sum + (row.cantidad || 0), 0);

    html += '</tbody><tfoot><tr>';
    html += '<td><strong>Total general</strong></td>';
    html += `<td class="text-right"><strong>${total}</strong></td>`;
    html += '<td class="text-right"><strong>100%</strong></td>';
    html += '</tr></tfoot></table>';

    container.innerHTML = html;

    // Agregar gráfico de donas
    if (data.length > 0) {
        setTimeout(() => renderDonutChart(data), 100);
    }
}

function renderTable3(data) {
    const container = document.getElementById('report-container');
    
    let html = '<table class="report-table"><thead><tr>';
    html += '<th>Módulo / Nivel</th>';
    html += '<th class="text-right">Disponible</th>';
    html += '<th class="text-right">Ocupado</th>';
    html += '<th class="text-right">Total</th>';
    html += '</tr></thead><tbody>';

    data.forEach(row => {
        html += '<tr>';
        html += `<td><strong>${row.modulo}</strong></td>`;
        html += `<td class="text-right">${row.disponible || 0}</td>`;
        html += `<td class="text-right">${row.ocupado || 0}</td>`;
        html += `<td class="text-right"><strong>${row.total || 0}</strong></td>`;
        html += '</tr>';
    });

    const totalDisp = data.reduce((sum, row) => sum + (row.disponible || 0), 0);
    const totalOcup = data.reduce((sum, row) => sum + (row.ocupado || 0), 0);
    const totalGeneral = data.reduce((sum, row) => sum + (row.total || 0), 0);

    html += '</tbody><tfoot><tr>';
    html += '<td><strong>Total general</strong></td>';
    html += `<td class="text-right"><strong>${totalDisp}</strong></td>`;
    html += `<td class="text-right"><strong>${totalOcup}</strong></td>`;
    html += `<td class="text-right"><strong>${totalGeneral}</strong></td>`;
    html += '</tr></tfoot></table>';

    container.innerHTML = html;
}

function renderChart4(data) {
    const container = document.getElementById('report-container');
    container.innerHTML = '<div class="chart-container"><canvas id="ocupabilidadChart"></canvas></div>';

    const labels = data.map(row => row.fecha);
    const values = data.map(row => row.ocupantes);

    const ctx = document.getElementById('ocupabilidadChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ocupantes por Día',
                data: values,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3498db',
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBorderWidth: 2,
                pointBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Ocupabilidad Histórica',
                    font: { size: 18 }
                },
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Ocupantes'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                }
            }
        }
    });
}

function renderDonutChart(data) {
    const container = document.getElementById('report-container');
    container.innerHTML += '<div class="chart-container"><canvas id="generoChart"></canvas></div>';

    const labels = data.map(row => row.genero);
    const values = data.map(row => row.cantidad);
    const colors = ['#3498db', '#e74c3c', '#27ae60', '#f39c12'];

    const ctx = document.getElementById('generoChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución por Género',
                    font: { size: 18 }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ========== UTILIDADES ==========
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
    if (show) {
        document.getElementById('report-container').innerHTML = '';
    }
}

function showError(message) {
    const container = document.getElementById('report-container');
    container.innerHTML = `
        <div class="error-message">
            <strong>❌ Error</strong>
            <p>${message}</p>
            <p><small>Verifica que el servidor esté corriendo en http://localhost:3000</small></p>
        </div>
    `;
}

function showInfo(reportNumber) {
    const report = reports[reportNumber];
    const infoSection = document.getElementById('info-section');
    const infoContent = document.getElementById('report-info');
    
    infoContent.innerHTML = `
        <p><strong>Descripción:</strong> ${report.description}</p>
        <p><strong>Tipo de filtro:</strong> ${report.dateType === 'single' ? 'Fecha única' : 'Rango de fechas'}</p>
        <p><strong>Fuente:</strong> Base de datos hospestar - Tabla HistoryOcu</p>
    `;
    
    infoSection.style.display = 'block';
}

function exportToExcel() {
    alert('Función de exportación a Excel en desarrollo.\n\nPróximamente podrás descargar los reportes en formato Excel.');
}

// ========== INICIALIZACIÓN ==========
window.addEventListener('DOMContentLoaded', () => {
    selectReport(1);
    console.log('✅ Proyecto 19 - Sistema cargado');
    console.log('📊 API URL:', API_URL);
});