/**
 * ==================== GRÁFICOS Y ESTADÍSTICAS ====================
 * Funciones para Chart.js, presupuestos y análisis de gastos
 */

// ==================== INICIALIZACIÓN DE GRÁFICOS ====================

/**
 * Inicializa los selectores de período y crea los gráficos
 */
function inicializarGraficos() {
    // Llenar selector de meses
    const selectMes = document.getElementById('grafico-mes');
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const mesActual = new Date().getMonth();
    meses.forEach((mes, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = mes;
        if (index === mesActual) option.selected = true;
        selectMes.appendChild(option);
    });

    // Llenar selector de años
    const selectAnio = document.getElementById('grafico-anio');
    const anioActual = new Date().getFullYear();
    for (let anio = anioActual - 5; anio <= anioActual + 1; anio++) {
        const option = document.createElement('option');
        option.value = anio;
        option.textContent = anio;
        if (anio === anioActual) option.selected = true;
        selectAnio.appendChild(option);
    }

    actualizarGraficos();
}

/**
 * Actualiza todos los gráficos con los datos del período seleccionado
 */
function actualizarGraficos() {
    const mes = parseInt(document.getElementById('grafico-mes').value);
    const anio = parseInt(document.getElementById('grafico-anio').value);

    // Filtrar movimientos del período
    const movimientosPeriodo = movimientos.filter(m => {
        const fecha = new Date(m.fecha);
        return fecha.getMonth() === mes && fecha.getFullYear() === anio;
    });

    // Destruir gráficos anteriores si existen
    Object.values(graficos).forEach(g => g.destroy());
    graficos = {};

    // Gráfico de distribución de gastos
    crearGraficoGastos(movimientosPeriodo);
    
    // Gráfico de ingresos vs gastos
    crearGraficoBalance(movimientosPeriodo);
    
    // Gráfico de tendencia mensual
    crearGraficoTendencia();
    
    // Gráfico de distribución de ingresos
    crearGraficoIngresos(movimientosPeriodo);
}

/**
 * Crea el gráfico de distribución de gastos por categoría
 */
function crearGraficoGastos(movimientosData) {
    const gastos = movimientosData.filter(m => m.tipo === 'Gasto');
    const porCategoria = {};
    
    gastos.forEach(m => {
        porCategoria[m.categoria] = (porCategoria[m.categoria] || 0) + m.monto;
    });

    const ctx = document.getElementById('grafico-gastos').getContext('2d');
    graficos.gastos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(porCategoria),
            datasets: [{
                data: Object.values(porCategoria),
                backgroundColor: [
                    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
                    '#1abc9c', '#e91e63', '#00bcd4', '#ff9800', '#795548'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12 } }
            }
        }
    });
}

/**
 * Crea el gráfico de distribución de ingresos por categoría
 */
function crearGraficoIngresos(movimientosData) {
    const ingresos = movimientosData.filter(m => m.tipo === 'Ingreso');
    const porCategoria = {};
    
    ingresos.forEach(m => {
        porCategoria[m.categoria] = (porCategoria[m.categoria] || 0) + m.monto;
    });

    const ctx = document.getElementById('grafico-ingresos').getContext('2d');
    graficos.ingresos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(porCategoria),
            datasets: [{
                data: Object.values(porCategoria),
                backgroundColor: [
                    '#2ecc71', '#27ae60', '#1abc9c', '#16a085', '#3498db',
                    '#2980b9', '#9b59b6', '#8e44ad', '#f39c12', '#e67e22'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12 } }
            }
        }
    });
}

/**
 * Crea el gráfico de balance (ingresos vs gastos)
 */
function crearGraficoBalance(movimientosData) {
    const ingresos = movimientosData.filter(m => m.tipo === 'Ingreso')
        .reduce((sum, m) => sum + m.monto, 0);
    const gastos = movimientosData.filter(m => m.tipo === 'Gasto')
        .reduce((sum, m) => sum + m.monto, 0);

    const ctx = document.getElementById('grafico-balance').getContext('2d');
    graficos.balance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ingresos', 'Gastos', 'Balance'],
            datasets: [{
                data: [ingresos, gastos, ingresos - gastos],
                backgroundColor: ['#2ecc71', '#e74c3c', ingresos - gastos >= 0 ? '#3498db' : '#e74c3c']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

/**
 * Crea el gráfico de tendencia mensual (últimos 6 meses)
 */
function crearGraficoTendencia() {
    const ultimos6Meses = [];
    const ingresosMes = [];
    const gastosMes = [];
    
    for (let i = 5; i >= 0; i--) {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() - i);
        const mes = fecha.getMonth();
        const anio = fecha.getFullYear();
        
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        ultimos6Meses.push(meses[mes]);
        
        const movsMes = movimientos.filter(m => {
            const f = new Date(m.fecha);
            return f.getMonth() === mes && f.getFullYear() === anio;
        });
        
        ingresosMes.push(movsMes.filter(m => m.tipo === 'Ingreso')
            .reduce((sum, m) => sum + m.monto, 0));
        gastosMes.push(movsMes.filter(m => m.tipo === 'Gasto')
            .reduce((sum, m) => sum + m.monto, 0));
    }

    const ctx = document.getElementById('grafico-tendencia').getContext('2d');
    graficos.tendencia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ultimos6Meses,
            datasets: [
                {
                    label: 'Ingresos',
                    data: ingresosMes,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Gastos',
                    data: gastosMes,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// ==================== PRESUPUESTOS ====================

/**
 * Calcula el promedio de gastos de los últimos 3 meses por categoría
 */
function calcularPromedioGastos() {
    const promedios = {};
    const hoy = new Date();
    
    // Obtener todas las categorías que han tenido gastos
    const categoriasUsadas = [...new Set(movimientos
        .filter(m => m.tipo === 'Gasto')
        .map(m => m.categoria))];
    
    categoriasUsadas.forEach(categoria => {
        const gastosPorMes = [];
        
        // Revisar los últimos 3 meses (sin contar el actual)
        for (let i = 1; i <= 3; i++) {
            const fecha = new Date(hoy);
            fecha.setMonth(fecha.getMonth() - i);
            const mes = fecha.getMonth();
            const anio = fecha.getFullYear();
            
            const gastoMes = movimientos
                .filter(m => {
                    const f = new Date(m.fecha);
                    return m.tipo === 'Gasto' && 
                           m.categoria === categoria && 
                           f.getMonth() === mes && 
                           f.getFullYear() === anio;
                })
                .reduce((sum, m) => sum + m.monto, 0);
            
            if (gastoMes > 0) {
                gastosPorMes.push(gastoMes);
            }
        }
        
        // Calcular promedio si hay datos históricos
        if (gastosPorMes.length > 0) {
            promedios[categoria] = Math.round(gastosPorMes.reduce((a, b) => a + b, 0) / gastosPorMes.length);
        }
    });
    
    return promedios;
}

/**
 * Actualiza la visualización de presupuestos automáticos
 */
function actualizarPresupuestos() {
    const contenedor = document.getElementById('presupuestos-lista');
    const sinPresupuestos = document.getElementById('sin-presupuestos');
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();

    // Calcular gastos del mes actual por categoría
    const gastosMesActual = {};
    movimientos.filter(m => {
        const fecha = new Date(m.fecha);
        return m.tipo === 'Gasto' && fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    }).forEach(m => {
        gastosMesActual[m.categoria] = (gastosMesActual[m.categoria] || 0) + m.monto;
    });

    // Si no hay gastos este mes, mostrar mensaje
    if (Object.keys(gastosMesActual).length === 0) {
        contenedor.innerHTML = '';
        sinPresupuestos.style.display = 'block';
        return;
    }

    sinPresupuestos.style.display = 'none';

    // Calcular promedios históricos
    const promedios = calcularPromedioGastos();

    // Generar cards para cada categoría con gastos este mes
    contenedor.innerHTML = Object.entries(gastosMesActual)
        .sort((a, b) => b[1] - a[1]) // Ordenar por monto descendente
        .map(([categoria, gastado]) => {
            const icono = obtenerIconoCategoria(categoria);
            const promedio = promedios[categoria] || gastado; // Si no hay histórico, usar el actual
            const porcentaje = Math.min((gastado / promedio) * 100, 150); // Max 150% para visualización
            
            let estado = 'normal';
            let estadoTexto = '';
            let comparacion = '';
            
            if (promedios[categoria]) {
                const diferencia = gastado - promedio;
                if (diferencia > 0) {
                    const porcentajeExceso = ((diferencia / promedio) * 100).toFixed(0);
                    if (porcentaje >= 100) {
                        estado = 'excedido';
                        estadoTexto = `⚠️ +${formatearMoneda(diferencia)} sobre el promedio`;
                    } else if (porcentaje >= 80) {
                        estado = 'advertencia';
                        estadoTexto = `Cerca del promedio habitual`;
                    }
                } else {
                    estado = 'normal';
                    estadoTexto = `✅ ${formatearMoneda(Math.abs(diferencia))} menos que el promedio`;
                }
                comparacion = `Promedio: ${formatearMoneda(promedio)}`;
            } else {
                estadoTexto = '📊 Primera vez en esta categoría';
                comparacion = 'Sin historial previo';
            }

            return `
                <div class="presupuesto-item">
                    <div class="presupuesto-header">
                        <span class="presupuesto-categoria">${icono} ${categoria}</span>
                    </div>
                    <div class="presupuesto-valores">
                        <span>Gastado: ${formatearMoneda(gastado)}</span>
                        <span>${comparacion}</span>
                    </div>
                    <div class="presupuesto-barra">
                        <div class="presupuesto-barra-relleno ${estado}" style="width: ${Math.min(porcentaje, 100)}%"></div>
                    </div>
                    <div class="presupuesto-estado ${estado}">${estadoTexto}</div>
                </div>
            `;
        }).join('');
}

/**
 * Verifica presupuestos excedidos y notifica
 */
function verificarPresupuestosExcedidos() {
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();

    const gastosPorCategoria = {};
    movimientos.filter(m => {
        const fecha = new Date(m.fecha);
        return m.tipo === 'Gasto' && fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    }).forEach(m => {
        gastosPorCategoria[m.categoria] = (gastosPorCategoria[m.categoria] || 0) + m.monto;
    });

    Object.entries(presupuestos).forEach(([categoria, limite]) => {
        const gastado = gastosPorCategoria[categoria] || 0;
        const porcentaje = (gastado / limite) * 100;
        
        if (porcentaje >= 100) {
            mostrarToast(
                `¡Presupuesto excedido!`,
                `Has excedido el límite de ${categoria} por ${formatearMoneda(gastado - limite)}`,
                'error'
            );
        } else if (porcentaje >= 80) {
            mostrarToast(
                `Presupuesto al límite`,
                `Has usado el ${porcentaje.toFixed(0)}% del presupuesto de ${categoria}`,
                'advertencia'
            );
        }
    });
}

// ==================== GENERACIÓN DE REPORTES PDF ====================

/**
 * Genera un reporte PDF del mes actual
 */
function generarReportePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Título
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Reporte de Finanzas Personales', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`${meses[mesActual]} ${anioActual}`, 105, 30, { align: 'center' });

    // Filtrar movimientos del mes
    const movimientosMes = movimientos.filter(m => {
        const fecha = new Date(m.fecha);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    // Calcular totales
    const ingresos = movimientosMes.filter(m => m.tipo === 'Ingreso')
        .reduce((sum, m) => sum + m.monto, 0);
    const gastos = movimientosMes.filter(m => m.tipo === 'Gasto')
        .reduce((sum, m) => sum + m.monto, 0);
    const balance = ingresos - gastos;

    // Resumen
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resumen del Mes', 20, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(39, 174, 96);
    doc.text(`Ingresos: ${formatearMoneda(ingresos)}`, 20, 55);
    doc.setTextColor(231, 76, 60);
    doc.text(`Gastos: ${formatearMoneda(gastos)}`, 20, 62);
    doc.setTextColor(balance >= 0 ? 39 : 231, balance >= 0 ? 174 : 76, balance >= 0 ? 96 : 60);
    doc.text(`Balance: ${formatearMoneda(balance)}`, 20, 69);

    // Tabla de movimientos
    if (movimientosMes.length > 0) {
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.text('Detalle de Movimientos', 20, 85);

        const datosTabla = movimientosMes.map(m => [
            formatearFecha(m.fecha),
            m.tipo,
            m.categoria,
            m.descripcion.substring(0, 30),
            `${m.tipo === 'Ingreso' ? '+' : '-'}${formatearMoneda(m.monto)}`
        ]);

        doc.autoTable({
            startY: 90,
            head: [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto']],
            body: datosTabla,
            theme: 'striped',
            headStyles: { fillColor: [102, 126, 234] },
            styles: { fontSize: 8 }
        });
    }

    // Gastos por categoría
    const gastosPorCategoria = {};
    movimientosMes.filter(m => m.tipo === 'Gasto').forEach(m => {
        gastosPorCategoria[m.categoria] = (gastosPorCategoria[m.categoria] || 0) + m.monto;
    });

    if (Object.keys(gastosPorCategoria).length > 0) {
        const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 100;
        doc.setFontSize(12);
        doc.text('Gastos por Categoría', 20, startY);

        const datosCategoria = Object.entries(gastosPorCategoria)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, monto]) => [cat, formatearMoneda(monto)]);

        doc.autoTable({
            startY: startY + 5,
            head: [['Categoría', 'Total']],
            body: datosCategoria,
            theme: 'grid',
            headStyles: { fillColor: [231, 76, 60] },
            styles: { fontSize: 9 }
        });
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Generado el ${new Date().toLocaleString('es-CO')} - Página ${i} de ${pageCount}`,
            105, 290, { align: 'center' }
        );
    }

    // Descargar
    doc.save(`reporte_finanzas_${meses[mesActual].toLowerCase()}_${anioActual}.pdf`);
    mostrarMensaje('Reporte PDF generado correctamente.', 'exito');
}
