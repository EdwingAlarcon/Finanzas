/**
 * ==================== MOVIMIENTOS ====================
 * CRUD de movimientos financieros, filtros, ordenamiento y paginación
 */

// ==================== CRUD DE MOVIMIENTOS ====================

/**
 * Agrega un nuevo movimiento al listado.
 * Valida los campos, crea el objeto del movimiento y actualiza la interfaz.
 * @param {Event} evento - Evento del formulario
 */
function agregarMovimiento(evento) {
    evento.preventDefault();
    
    // Obtener valores del formulario
    const tipo = document.getElementById('tipo').value;
    const categoria = document.getElementById('categoria').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const fecha = document.getElementById('fecha').value;
    const descripcion = document.getElementById('descripcion').value.trim();
    
    // Validar campos requeridos
    if (!validarCampos(tipo, categoria, monto, fecha)) {
        return;
    }
    
    // Crear objeto del nuevo movimiento
    const nuevoMovimiento = {
        id: Date.now(), // ID único basado en timestamp
        tipo: tipo,
        categoria: categoria,
        monto: monto,
        fecha: fecha,
        descripcion: descripcion || '-'
    };
    
    // Agregar al array de movimientos
    movimientos.push(nuevoMovimiento);
    
    // Guardar en localStorage
    guardarDatosLocalStorage();
    
    // Actualizar toda la interfaz
    actualizarResumen();
    actualizarTabla();
    actualizarObjetivoAhorro();
    actualizarFiltroCategorias();
    actualizarResumenCategorias();
    actualizarGraficos();
    actualizarPresupuestos();
    
    // Limpiar formulario
    document.getElementById('formulario-movimiento').reset();
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = hoy;
    actualizarCategoriasFormulario();
    
    // Mostrar mensaje de éxito
    mostrarMensaje('¡Movimiento agregado correctamente!', 'exito');
}

/**
 * Agrega un movimiento desde el modal de acción rápida
 */
function agregarMovimientoRapido() {
    const tipo = document.getElementById('rapido-tipo').value;
    const categoria = document.getElementById('rapido-categoria').value;
    const monto = parseFloat(document.getElementById('rapido-monto').value);
    const descripcion = document.getElementById('rapido-descripcion').value.trim();
    
    // Validar
    if (!categoria || isNaN(monto) || monto <= 0) {
        mostrarToast('Error', 'Por favor, completa los campos correctamente', 'error');
        return;
    }
    
    // Crear movimiento
    const nuevoMovimiento = {
        id: Date.now(),
        tipo: tipo,
        categoria: categoria,
        monto: monto,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: descripcion || '-'
    };
    
    // Agregar al array
    movimientos.push(nuevoMovimiento);
    
    // Guardar
    guardarDatosLocalStorage();
    
    // Actualizar UI
    actualizarResumen();
    actualizarTabla();
    actualizarObjetivoAhorro();
    actualizarFiltroCategorias();
    actualizarResumenCategorias();
    actualizarGraficos();
    actualizarPresupuestos();
    renderizarCalendario();
    
    // Cerrar modal y limpiar
    document.getElementById('rapido-monto').value = '';
    document.getElementById('rapido-descripcion').value = '';
    toggleModalAccionRapida();
    
    // Mostrar confirmación
    const signo = tipo === 'Ingreso' ? '+' : tipo === 'Gasto' ? '-' : '🐷';
    mostrarToast('¡Agregado!', `${signo} ${formatearMoneda(monto)} en ${categoria}`, 'exito');
}

/**
 * Valida los campos del formulario antes de agregar un movimiento.
 * @param {string} tipo - Tipo de transacción
 * @param {string} categoria - Categoría seleccionada
 * @param {number} monto - Monto de la transacción
 * @param {string} fecha - Fecha de la transacción
 * @returns {boolean} - True si todos los campos son válidos
 */
function validarCampos(tipo, categoria, monto, fecha) {
    // Validar tipo
    if (!tipo) {
        mostrarMensaje('Por favor, selecciona un tipo de transacción.', 'error');
        return false;
    }
    
    // Validar categoría
    if (!categoria) {
        mostrarMensaje('Por favor, selecciona una categoría.', 'error');
        return false;
    }
    
    // Validar monto
    if (isNaN(monto) || monto <= 0) {
        mostrarMensaje('El monto debe ser un número positivo.', 'error');
        return false;
    }
    
    // Validar fecha
    if (!fecha) {
        mostrarMensaje('Por favor, selecciona una fecha.', 'error');
        return false;
    }
    
    return true;
}

/**
 * Elimina un movimiento del listado por su ID.
 * @param {number} id - ID del movimiento a eliminar
 */
function eliminarMovimiento(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
        movimientos = movimientos.filter(m => m.id !== id);
        guardarDatosLocalStorage();
        actualizarResumen();
        actualizarTabla();
        actualizarObjetivoAhorro();
        actualizarResumenCategorias();
        mostrarMensaje('Movimiento eliminado correctamente.', 'exito');
    }
}

/**
 * Abre el modal para editar un movimiento.
 * @param {number} id - ID del movimiento a editar
 */
function abrirModalEditar(id) {
    const mov = movimientos.find(m => m.id === id);
    if (!mov) return;

    document.getElementById('editar-id').value = id;
    document.getElementById('editar-tipo').value = mov.tipo;
    actualizarCategoriasEditar();
    document.getElementById('editar-categoria').value = mov.categoria;
    document.getElementById('editar-monto').value = mov.monto;
    document.getElementById('editar-fecha').value = mov.fecha;
    document.getElementById('editar-descripcion').value = mov.descripcion === '-' ? '' : mov.descripcion;

    document.getElementById('modal-editar').classList.add('activo');
}

/**
 * Guarda los cambios de edición de un movimiento.
 */
function guardarEdicion() {
    const id = parseInt(document.getElementById('editar-id').value);
    const tipo = document.getElementById('editar-tipo').value;
    const categoria = document.getElementById('editar-categoria').value;
    const monto = parseFloat(document.getElementById('editar-monto').value);
    const fecha = document.getElementById('editar-fecha').value;
    const descripcion = document.getElementById('editar-descripcion').value.trim();

    if (!validarCampos(tipo, categoria, monto, fecha)) {
        return;
    }

    const index = movimientos.findIndex(m => m.id === id);
    if (index !== -1) {
        movimientos[index] = {
            ...movimientos[index],
            tipo,
            categoria,
            monto,
            fecha,
            descripcion: descripcion || '-'
        };

        guardarDatosLocalStorage();
        actualizarResumen();
        actualizarTabla();
        actualizarObjetivoAhorro();
        actualizarResumenCategorias();
        cerrarModalEditar();
        mostrarMensaje('Movimiento actualizado correctamente.', 'exito');
    }
}

// ==================== FILTROS Y ORDENAMIENTO ====================

/**
 * Obtiene los movimientos filtrados según los criterios seleccionados.
 * @returns {Array} - Array de movimientos filtrados
 */
function obtenerMovimientosFiltrados() {
    const filtroTipo = document.getElementById('filtro-tipo').value;
    const filtroCategoria = document.getElementById('filtro-categoria').value;
    const filtroFechaDesde = document.getElementById('filtro-fecha-desde').value;
    const filtroFechaHasta = document.getElementById('filtro-fecha-hasta').value;
    const filtroBusqueda = document.getElementById('filtro-busqueda').value.toLowerCase();
    
    return movimientos.filter(m => {
        const cumpleTipo = !filtroTipo || m.tipo === filtroTipo;
        const cumpleCategoria = !filtroCategoria || m.categoria === filtroCategoria;
        const cumpleFechaDesde = !filtroFechaDesde || m.fecha >= filtroFechaDesde;
        const cumpleFechaHasta = !filtroFechaHasta || m.fecha <= filtroFechaHasta;
        const cumpleBusqueda = !filtroBusqueda || 
            m.descripcion.toLowerCase().includes(filtroBusqueda) ||
            m.categoria.toLowerCase().includes(filtroBusqueda);
        return cumpleTipo && cumpleCategoria && cumpleFechaDesde && cumpleFechaHasta && cumpleBusqueda;
    });
}

/**
 * Aplica los filtros seleccionados y actualiza la tabla.
 */
function aplicarFiltros() {
    paginaActual = 1; // Resetear a primera página al filtrar
    actualizarTabla();
}

/**
 * Aplica filtros con debounce para la búsqueda de texto
 */
function aplicarFiltrosConDebounce() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        paginaActual = 1;
        actualizarTabla();
    }, 300);
}

/**
 * Limpia todos los filtros y muestra todos los movimientos.
 */
function limpiarFiltros() {
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('filtro-fecha-desde').value = '';
    document.getElementById('filtro-fecha-hasta').value = '';
    document.getElementById('filtro-busqueda').value = '';
    paginaActual = 1;
    actualizarTabla();
}

/**
 * Ordena los movimientos según el campo y dirección especificados.
 * @param {Array} movimientos - Array de movimientos a ordenar
 * @returns {Array} - Array de movimientos ordenados
 */
function ordenarMovimientos(movimientos) {
    const { campo, direccion } = ordenActual;
    
    return [...movimientos].sort((a, b) => {
        let valorA = a[campo];
        let valorB = b[campo];
        
        // Convertir a números para comparación de montos
        if (campo === 'monto') {
            valorA = parseFloat(valorA);
            valorB = parseFloat(valorB);
        }
        
        // Comparación
        if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Cambia el ordenamiento de la tabla al hacer clic en un encabezado.
 * @param {string} campo - Campo por el cual ordenar
 */
function ordenarTabla(campo) {
    // Limpiar indicadores anteriores
    document.querySelectorAll('th').forEach(th => th.classList.remove('ordenado'));
    document.querySelectorAll('.flecha').forEach(f => f.textContent = '');
    
    // Alternar dirección si es el mismo campo
    if (ordenActual.campo === campo) {
        ordenActual.direccion = ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
        ordenActual.campo = campo;
        ordenActual.direccion = 'desc';
    }
    
    // Actualizar indicador visual
    const flecha = document.getElementById(`flecha-${campo}`);
    if (flecha) {
        flecha.textContent = ordenActual.direccion === 'asc' ? '▲' : '▼';
        flecha.parentElement.classList.add('ordenado');
    }
    
    actualizarTabla();
}

// ==================== MOVIMIENTOS RECURRENTES ====================

/**
 * Agrega un nuevo movimiento recurrente
 */
function agregarRecurrente() {
    const tipo = document.getElementById('recurrente-tipo').value;
    const categoria = document.getElementById('recurrente-categoria').value;
    const descripcion = document.getElementById('recurrente-descripcion').value.trim();
    const monto = parseFloat(document.getElementById('recurrente-monto').value);
    const frecuencia = document.getElementById('recurrente-frecuencia').value;
    const dia = parseInt(document.getElementById('recurrente-dia').value);

    if (!descripcion || isNaN(monto) || monto <= 0) {
        mostrarMensaje('Por favor, completa todos los campos correctamente.', 'error');
        return;
    }

    const recurrente = {
        id: Date.now(),
        tipo,
        categoria,
        descripcion,
        monto,
        frecuencia,
        dia,
        ultimaEjecucion: null,
        activo: true
    };

    movimientosRecurrentes.push(recurrente);
    guardarDatosLocalStorage();
    actualizarRecurrentes();
    
    // Limpiar formulario
    document.getElementById('recurrente-descripcion').value = '';
    document.getElementById('recurrente-monto').value = '';
    mostrarMensaje('Movimiento recurrente agregado.', 'exito');
}

/**
 * Elimina un movimiento recurrente
 */
function eliminarRecurrente(id) {
    if (confirm('¿Eliminar este movimiento recurrente?')) {
        movimientosRecurrentes = movimientosRecurrentes.filter(r => r.id !== id);
        guardarDatosLocalStorage();
        actualizarRecurrentes();
    }
}

/**
 * Ejecuta manualmente un movimiento recurrente
 */
function ejecutarRecurrente(id) {
    const recurrente = movimientosRecurrentes.find(r => r.id === id);
    if (!recurrente) return;

    const nuevoMovimiento = {
        id: Date.now(),
        tipo: recurrente.tipo,
        categoria: recurrente.categoria,
        monto: recurrente.monto,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: `${recurrente.descripcion} (Recurrente)`
    };

    movimientos.push(nuevoMovimiento);
    recurrente.ultimaEjecucion = new Date().toISOString();
    guardarDatosLocalStorage();
    
    actualizarResumen();
    actualizarTabla();
    actualizarRecurrentes();
    actualizarGraficos();
    actualizarPresupuestos();
    mostrarMensaje('Movimiento recurrente ejecutado.', 'exito');
}

/**
 * Actualiza la visualización de movimientos recurrentes
 */
function actualizarRecurrentes() {
    const contenedor = document.getElementById('recurrentes-lista');
    const sinRecurrentes = document.getElementById('sin-recurrentes');

    if (movimientosRecurrentes.length === 0) {
        contenedor.innerHTML = '';
        sinRecurrentes.style.display = 'block';
        return;
    }

    sinRecurrentes.style.display = 'none';
    const frecuenciasTexto = {
        semanal: 'Semanal',
        quincenal: 'Quincenal',
        mensual: 'Mensual',
        anual: 'Anual'
    };

    contenedor.innerHTML = movimientosRecurrentes.map(r => {
        const icono = obtenerIconoCategoria(r.categoria);
        return `
            <div class="recurrente-item">
                <div class="recurrente-info">
                    <span class="recurrente-icono">${icono}</span>
                    <div class="recurrente-detalles">
                        <h4>${r.descripcion}</h4>
                        <span>${r.categoria} • Día ${r.dia}</span>
                    </div>
                </div>
                <span class="frecuencia-badge">${frecuenciasTexto[r.frecuencia]}</span>
                <span class="recurrente-monto ${r.tipo.toLowerCase()}">${r.tipo === 'Ingreso' ? '+' : '-'}${formatearMoneda(r.monto)}</span>
                <div class="acciones-celda">
                    <button class="btn btn-editar" onclick="ejecutarRecurrente(${r.id})">▶ Ejecutar</button>
                    <button class="btn btn-eliminar" onclick="eliminarRecurrente(${r.id})">×</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Verifica si hay movimientos recurrentes pendientes de ejecutar
 */
function verificarRecurrentesPendientes() {
    const hoy = new Date();
    const diaHoy = hoy.getDate();
    
    movimientosRecurrentes.forEach(r => {
        if (!r.activo) return;
        
        const debeEjecutar = r.dia === diaHoy;
        const yaEjecutadoHoy = r.ultimaEjecucion && 
            new Date(r.ultimaEjecucion).toDateString() === hoy.toDateString();
        
        if (debeEjecutar && !yaEjecutadoHoy) {
            // Notificar al usuario que hay movimientos pendientes
            console.log(`Movimiento recurrente pendiente: ${r.descripcion}`);
        }
    });
}

/**
 * Verifica y ejecuta movimientos recurrentes pendientes
 */
function verificarYEjecutarRecurrentes() {
    const hoy = new Date();
    const diaHoy = hoy.getDate();
    const mesHoy = hoy.getMonth();
    const anioHoy = hoy.getFullYear();
    let ejecutados = 0;

    movimientosRecurrentes.forEach(r => {
        if (!r.activo) return;

        const ultimaEjecucion = r.ultimaEjecucion ? new Date(r.ultimaEjecucion) : null;
        let debeEjecutar = false;

        switch (r.frecuencia) {
            case 'mensual':
                if (diaHoy >= r.dia) {
                    if (!ultimaEjecucion || 
                        ultimaEjecucion.getMonth() !== mesHoy || 
                        ultimaEjecucion.getFullYear() !== anioHoy) {
                        debeEjecutar = true;
                    }
                }
                break;
            case 'quincenal':
                const diasQuincenales = [r.dia, r.dia + 15 > 28 ? 28 : r.dia + 15];
                if (diasQuincenales.includes(diaHoy)) {
                    if (!ultimaEjecucion || ultimaEjecucion.toDateString() !== hoy.toDateString()) {
                        debeEjecutar = true;
                    }
                }
                break;
            case 'semanal':
                if (hoy.getDay() === (r.dia % 7)) {
                    if (!ultimaEjecucion || ultimaEjecucion.toDateString() !== hoy.toDateString()) {
                        debeEjecutar = true;
                    }
                }
                break;
            case 'anual':
                if (diaHoy === r.dia && mesHoy === (r.mesAnual || 0)) {
                    if (!ultimaEjecucion || ultimaEjecucion.getFullYear() !== anioHoy) {
                        debeEjecutar = true;
                    }
                }
                break;
        }

        if (debeEjecutar) {
            // Ejecutar automáticamente
            const nuevoMovimiento = {
                id: Date.now() + Math.random(),
                tipo: r.tipo,
                categoria: r.categoria,
                monto: r.monto,
                fecha: hoy.toISOString().split('T')[0],
                descripcion: `${r.descripcion} (Auto-recurrente)`,
                etiquetas: ['recurrente', 'automatico']
            };

            movimientos.push(nuevoMovimiento);
            r.ultimaEjecucion = hoy.toISOString();
            ejecutados++;
        }
    });

    if (ejecutados > 0) {
        guardarDatosLocalStorage();
        actualizarTodo();
        mostrarToast(
            'Movimientos recurrentes',
            `Se ejecutaron ${ejecutados} movimiento(s) recurrente(s) automáticamente`,
            'exito'
        );
    }
}
