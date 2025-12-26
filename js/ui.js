/**
 * ==================== INTERFAZ DE USUARIO ====================
 * Temas, tabs, modales, toasts, calendario, PIN, resumen visual
 */

// ==================== TEMA ====================

/**
 * Cambia el tema de la aplicación.
 * @param {string} tema - Nombre del tema ('claro', 'oscuro', 'naturaleza', 'oceano')
 */
function cambiarTema(tema) {
    temaActual = tema;
    
    // Aplicar tema al documento
    if (tema === 'claro') {
        document.documentElement.removeAttribute('data-tema');
    } else {
        document.documentElement.setAttribute('data-tema', tema);
    }
    
    // Actualizar botones activos
    document.querySelectorAll('.tema-btn').forEach(btn => {
        btn.classList.toggle('activo', btn.dataset.temaValor === tema);
    });
    
    // Guardar preferencia
    localStorage.setItem('finanzas_tema', tema);
}

/**
 * Carga el tema guardado desde localStorage.
 */
function cargarTema() {
    const temaGuardado = localStorage.getItem('finanzas_tema');
    if (temaGuardado) {
        cambiarTema(temaGuardado);
    }
}

// ==================== SISTEMA DE TABS ====================

/**
 * Cambia entre las pestañas de navegación
 * @param {string} tabId - ID del tab a mostrar ('movimientos', 'estadisticas', 'configuracion')
 */
function cambiarTab(tabId) {
    // Ocultar todos los contenidos de tabs
    document.querySelectorAll('.tab-contenido').forEach(tab => {
        tab.classList.remove('activo');
    });
    
    // Desactivar todos los botones de tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('activo');
        btn.setAttribute('aria-selected', 'false');
    });
    
    // Mostrar el contenido del tab seleccionado
    const tabContenido = document.getElementById(`tab-${tabId}`);
    if (tabContenido) {
        tabContenido.classList.add('activo');
    }
    
    // Activar el botón del tab seleccionado
    const tabBtn = document.getElementById(`tab-btn-${tabId}`);
    if (tabBtn) {
        tabBtn.classList.add('activo');
        tabBtn.setAttribute('aria-selected', 'true');
    }
    
    // Si es el tab de estadísticas, actualizar los gráficos
    if (tabId === 'estadisticas') {
        setTimeout(() => {
            actualizarGraficos();
        }, 100);
    }
    
    // Guardar el tab activo en localStorage
    localStorage.setItem('finanzas_tab_activo', tabId);
}

/**
 * Restaura el tab activo guardado al cargar la página
 */
function restaurarTabActivo() {
    const tabGuardado = localStorage.getItem('finanzas_tab_activo');
    if (tabGuardado) {
        cambiarTab(tabGuardado);
    }
}

// ==================== MODAL DE ACCIÓN RÁPIDA ====================

/**
 * Muestra/oculta el modal de acción rápida
 */
function toggleModalAccionRapida() {
    const modal = document.getElementById('modal-accion-rapida');
    modal.classList.toggle('visible');
    
    // Si se abre el modal, cargar categorías y enfocar el primer campo
    if (modal.classList.contains('visible')) {
        actualizarCategoriasRapido();
        document.getElementById('rapido-monto').focus();
    }
}

// ==================== MODAL DE EDICIÓN ====================

/**
 * Cierra el modal de edición.
 */
function cerrarModalEditar() {
    document.getElementById('modal-editar').classList.remove('activo');
}

// ==================== MENSAJES Y NOTIFICACIONES ====================

/**
 * Muestra un mensaje temporal al usuario.
 * @param {string} texto - Texto del mensaje
 * @param {string} tipo - Tipo de mensaje ('exito' o 'error')
 */
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        mensaje.className = 'mensaje';
    }, 3000);
}

/**
 * Muestra una notificación toast
 */
function mostrarToast(titulo, mensaje, tipo = 'advertencia') {
    const toast = document.getElementById('notificacion-toast');
    const iconos = {
        advertencia: '⚠️',
        exito: '✅',
        error: '❌'
    };
    
    document.querySelector('.toast-icono').textContent = iconos[tipo] || '📢';
    document.getElementById('toast-titulo').textContent = titulo;
    document.getElementById('toast-mensaje').textContent = mensaje;
    
    toast.className = `notificacion-toast visible ${tipo}`;
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => cerrarToast(), 5000);
}

/**
 * Cierra la notificación toast
 */
function cerrarToast() {
    document.getElementById('notificacion-toast').classList.remove('visible');
}

// ==================== RESUMEN Y DASHBOARD ====================

/**
 * Recalcula y actualiza los totales de ingresos, gastos y balance.
 * Filtra los movimientos del mes actual para los cálculos.
 */
function actualizarResumen() {
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();
    
    // Filtrar movimientos del mes actual
    const movimientosMes = movimientos.filter(m => {
        const fechaMov = new Date(m.fecha);
        return fechaMov.getMonth() === mesActual && fechaMov.getFullYear() === anioActual;
    });
    
    // Calcular totales
    const movIngreso = movimientosMes.filter(m => m.tipo === 'Ingreso');
    const movGasto = movimientosMes.filter(m => m.tipo === 'Gasto');
    const movAhorro = movimientosMes.filter(m => m.tipo === 'Ahorro');
    
    const ingresos = movIngreso.reduce((sum, m) => sum + m.monto, 0);
    const gastos = movGasto.reduce((sum, m) => sum + m.monto, 0);
    const ahorros = movAhorro.reduce((sum, m) => sum + m.monto, 0);
    
    // Balance = Ingresos - Gastos - Ahorros (el ahorro es dinero apartado, no disponible)
    const balance = ingresos - gastos - ahorros;
    
    // Actualizar elementos del DOM
    document.getElementById('total-ingresos').textContent = formatearMoneda(ingresos);
    document.getElementById('total-gastos').textContent = formatearMoneda(gastos);
    document.getElementById('count-ingresos').textContent = `${movIngreso.length} transaccion${movIngreso.length !== 1 ? 'es' : ''}`;
    document.getElementById('count-gastos').textContent = `${movGasto.length} transaccion${movGasto.length !== 1 ? 'es' : ''}`;
    
    const elementoBalance = document.getElementById('balance');
    elementoBalance.textContent = formatearMoneda(balance);
    elementoBalance.classList.toggle('negativo', balance < 0);

    // Estado del balance
    const estadoBalance = document.getElementById('balance-estado');
    if (balance > 0) {
        estadoBalance.textContent = '💵 Disponible para gastar';
    } else if (balance < 0) {
        estadoBalance.textContent = '⚠️ Estás en números rojos';
    } else {
        estadoBalance.textContent = 'Sin saldo disponible';
    }

    // Total histórico de transacciones
    document.getElementById('total-transacciones').textContent = movimientos.length;
}

/**
 * Renderiza los movimientos en la tabla aplicando filtros, ordenamiento y paginación.
 * Muestra un mensaje si no hay movimientos que mostrar.
 */
function actualizarTabla() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    const sinDatos = document.getElementById('sin-datos');
    
    // Obtener movimientos filtrados
    let movimientosFiltrados = obtenerMovimientosFiltrados();
    
    // Aplicar ordenamiento
    movimientosFiltrados = ordenarMovimientos(movimientosFiltrados);
    
    // Limpiar tabla
    cuerpoTabla.innerHTML = '';
    
    // Mostrar mensaje si no hay datos
    if (movimientosFiltrados.length === 0) {
        sinDatos.style.display = 'block';
        ocultarPaginacion();
        return;
    }
    
    sinDatos.style.display = 'none';
    
    // Calcular paginación
    const totalPaginas = Math.ceil(movimientosFiltrados.length / itemsPorPagina);
    
    // Ajustar página actual si es necesario
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;
    
    // Obtener movimientos de la página actual
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const movimientosPagina = movimientosFiltrados.slice(inicio, fin);
    
    // Renderizar cada movimiento como fila de la tabla
    movimientosPagina.forEach(mov => {
        const fila = document.createElement('tr');
        fila.className = 'fade-in';
        fila.setAttribute('role', 'row');
        
        // Determinar clases según el tipo
        let clasesTipo, clasesMonto, signo;
        if (mov.tipo === 'Ingreso') {
            clasesTipo = 'tipo-ingreso';
            clasesMonto = 'monto-positivo';
            signo = '+';
        } else if (mov.tipo === 'Ahorro') {
            clasesTipo = 'tipo-ahorro';
            clasesMonto = 'monto-ahorro';
            signo = '🐷 ';
        } else {
            clasesTipo = 'tipo-gasto';
            clasesMonto = 'monto-negativo';
            signo = '-';
        }
        const icono = obtenerIconoCategoria(mov.categoria);
        
        fila.innerHTML = `
            <td>${formatearFecha(mov.fecha)}</td>
            <td class="${clasesTipo}">${mov.tipo}</td>
            <td>${icono} ${mov.categoria}</td>
            <td>${mov.descripcion}</td>
            <td class="${clasesMonto}">${signo}${formatearMoneda(mov.monto)}</td>
            <td class="acciones-celda">
                <button class="btn btn-editar" onclick="abrirModalEditar(${mov.id})" aria-label="Editar movimiento">
                    Editar
                </button>
                <button class="btn btn-eliminar" onclick="eliminarMovimiento(${mov.id})" aria-label="Eliminar movimiento">
                    Eliminar
                </button>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    // Renderizar paginación
    renderizarPaginacion(movimientosFiltrados.length, totalPaginas);
}

/**
 * Renderiza los controles de paginación
 */
function renderizarPaginacion(totalItems, totalPaginas) {
    let paginacionContainer = document.getElementById('paginacion-container');
    
    if (!paginacionContainer) {
        paginacionContainer = document.createElement('div');
        paginacionContainer.id = 'paginacion-container';
        paginacionContainer.className = 'paginacion';
        paginacionContainer.setAttribute('role', 'navigation');
        paginacionContainer.setAttribute('aria-label', 'Paginación de movimientos');
        document.querySelector('.tabla-container').appendChild(paginacionContainer);
    }
    
    if (totalPaginas <= 1) {
        paginacionContainer.style.display = 'none';
        return;
    }
    
    paginacionContainer.style.display = 'flex';
    
    const inicioItem = (paginaActual - 1) * itemsPorPagina + 1;
    const finItem = Math.min(paginaActual * itemsPorPagina, totalItems);
    
    let botonesHTML = '';
    botonesHTML += `<button class="paginacion-btn" onclick="cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''} aria-label="Página anterior">◀</button>`;
    
    const maxBotones = 5;
    let inicioBtn = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let finBtn = Math.min(totalPaginas, inicioBtn + maxBotones - 1);
    
    if (finBtn - inicioBtn < maxBotones - 1) {
        inicioBtn = Math.max(1, finBtn - maxBotones + 1);
    }
    
    if (inicioBtn > 1) {
        botonesHTML += `<button class="paginacion-btn" onclick="cambiarPagina(1)">1</button>`;
        if (inicioBtn > 2) botonesHTML += `<span style="padding: 0 5px;">...</span>`;
    }
    
    for (let i = inicioBtn; i <= finBtn; i++) {
        botonesHTML += `<button class="paginacion-btn ${i === paginaActual ? 'activo' : ''}" onclick="cambiarPagina(${i})" ${i === paginaActual ? 'aria-current="page"' : ''}>${i}</button>`;
    }
    
    if (finBtn < totalPaginas) {
        if (finBtn < totalPaginas - 1) botonesHTML += `<span style="padding: 0 5px;">...</span>`;
        botonesHTML += `<button class="paginacion-btn" onclick="cambiarPagina(${totalPaginas})">${totalPaginas}</button>`;
    }
    
    botonesHTML += `<button class="paginacion-btn" onclick="cambiarPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''} aria-label="Página siguiente">▶</button>`;
    
    paginacionContainer.innerHTML = `
        <span class="paginacion-info">Mostrando ${inicioItem}-${finItem} de ${totalItems} movimientos</span>
        <div class="paginacion-botones">${botonesHTML}</div>
    `;
}

/**
 * Cambia a una página específica
 */
function cambiarPagina(pagina) {
    paginaActual = pagina;
    actualizarTabla();
    document.getElementById('tabla-movimientos').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Oculta la paginación cuando no hay datos
 */
function ocultarPaginacion() {
    const paginacionContainer = document.getElementById('paginacion-container');
    if (paginacionContainer) {
        paginacionContainer.style.display = 'none';
    }
}

// ==================== OBJETIVO DE AHORRO ====================

/**
 * Recalcula el porcentaje de cumplimiento del objetivo de ahorro.
 * Actualiza la barra de progreso y los indicadores visuales.
 * Ahora cuenta los movimientos de tipo "Ahorro" directamente.
 */
function actualizarObjetivoAhorro() {
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();
    
    // Filtrar movimientos del mes actual
    const movimientosMes = movimientos.filter(m => {
        const fechaMov = new Date(m.fecha);
        return fechaMov.getMonth() === mesActual && fechaMov.getFullYear() === anioActual;
    });
    
    // Calcular ahorro del mes (movimientos tipo "Ahorro")
    const ahorrosRegistrados = movimientosMes
        .filter(m => m.tipo === 'Ahorro')
        .reduce((sum, m) => sum + m.monto, 0);
    
    // También calcular el ahorro implícito (ingresos - gastos) para referencia
    const ingresos = movimientosMes
        .filter(m => m.tipo === 'Ingreso')
        .reduce((sum, m) => sum + m.monto, 0);
    
    const gastos = movimientosMes
        .filter(m => m.tipo === 'Gasto')
        .reduce((sum, m) => sum + m.monto, 0);
    
    // El ahorro total es lo que registraste explícitamente como ahorro
    const ahorrado = ahorrosRegistrados;
    
    // Calcular porcentaje
    let porcentaje = 0;
    if (objetivoAhorro > 0) {
        porcentaje = Math.min(100, (ahorrado / objetivoAhorro) * 100);
    }
    
    // Actualizar elementos del DOM
    document.getElementById('monto-ahorrado').textContent = formatearMoneda(ahorrado);
    document.getElementById('meta-ahorro').textContent = formatearMoneda(objetivoAhorro);
    document.getElementById('progreso-relleno').style.width = `${porcentaje}%`;
    document.getElementById('progreso-porcentaje').textContent = `${porcentaje.toFixed(1)}%`;
    document.getElementById('ahorro-porcentaje').textContent = `${porcentaje.toFixed(1)}%`;

    // Estado del ahorro
    const estadoAhorro = document.getElementById('ahorro-estado');
    if (objetivoAhorro === 0) {
        estadoAhorro.textContent = 'Sin objetivo definido';
    } else if (porcentaje >= 100) {
        estadoAhorro.textContent = '¡Meta alcanzada! 🎉';
    } else if (porcentaje >= 50) {
        estadoAhorro.textContent = '¡Vas por buen camino!';
    } else {
        estadoAhorro.textContent = `Faltan ${formatearMoneda(objetivoAhorro - ahorrado)}`;
    }
}

/**
 * Guarda el objetivo de ahorro ingresado por el usuario.
 */
function guardarObjetivo() {
    const montoObjetivo = parseFloat(document.getElementById('objetivo-monto').value);
    
    if (isNaN(montoObjetivo) || montoObjetivo < 0) {
        mostrarMensaje('Por favor, ingresa un monto válido para el objetivo.', 'error');
        return;
    }
    
    objetivoAhorro = montoObjetivo;
    guardarDatosLocalStorage();
    actualizarObjetivoAhorro();
    mostrarMensaje('¡Objetivo de ahorro establecido correctamente!', 'exito');
}

// ==================== CALENDARIO ====================

/**
 * Inicializa el calendario
 */
function inicializarCalendario() {
    renderizarCalendario();
}

/**
 * Navega entre meses del calendario
 */
function navegarCalendario(direccion) {
    if (direccion === 0) {
        calendarioMes = new Date().getMonth();
        calendarioAnio = new Date().getFullYear();
    } else {
        calendarioMes += direccion;
        if (calendarioMes > 11) {
            calendarioMes = 0;
            calendarioAnio++;
        } else if (calendarioMes < 0) {
            calendarioMes = 11;
            calendarioAnio--;
        }
    }
    renderizarCalendario();
}

/**
 * Renderiza el calendario completo
 */
function renderizarCalendario() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    document.getElementById('calendario-titulo').textContent = 
        `${meses[calendarioMes]} ${calendarioAnio}`;

    const grid = document.getElementById('calendario-grid');
    grid.innerHTML = '';

    // Encabezados de días
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    diasSemana.forEach(dia => {
        const header = document.createElement('div');
        header.className = 'calendario-dia-header';
        header.textContent = dia;
        grid.appendChild(header);
    });

    // Primer día del mes
    const primerDia = new Date(calendarioAnio, calendarioMes, 1);
    const ultimoDia = new Date(calendarioAnio, calendarioMes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();

    // Días del mes anterior
    const mesAnterior = new Date(calendarioAnio, calendarioMes, 0);
    const diasMesAnterior = mesAnterior.getDate();
    
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
        const dia = document.createElement('div');
        dia.className = 'calendario-dia otro-mes';
        dia.innerHTML = `<span class="numero">${diasMesAnterior - i}</span>`;
        grid.appendChild(dia);
    }

    // Días del mes actual
    const hoy = new Date();
    for (let i = 1; i <= diasEnMes; i++) {
        const dia = document.createElement('div');
        dia.className = 'calendario-dia';
        
        const fechaStr = `${calendarioAnio}-${String(calendarioMes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        // Verificar si es hoy
        if (i === hoy.getDate() && calendarioMes === hoy.getMonth() && calendarioAnio === hoy.getFullYear()) {
            dia.classList.add('hoy');
        }

        // Buscar movimientos de este día
        const movsDia = movimientos.filter(m => m.fecha === fechaStr);
        const tieneIngresos = movsDia.some(m => m.tipo === 'Ingreso');
        const tieneGastos = movsDia.some(m => m.tipo === 'Gasto');

        let indicadoresHTML = '';
        if (tieneIngresos || tieneGastos) {
            indicadoresHTML = '<div class="indicadores">';
            if (tieneIngresos) indicadoresHTML += '<span class="indicador ingreso"></span>';
            if (tieneGastos) indicadoresHTML += '<span class="indicador gasto"></span>';
            indicadoresHTML += '</div>';
        }

        dia.innerHTML = `<span class="numero">${i}</span>${indicadoresHTML}`;
        dia.onclick = () => seleccionarDiaCalendario(fechaStr, i);
        
        grid.appendChild(dia);
    }

    // Días del mes siguiente
    const diasRestantes = 42 - (diaSemanaInicio + diasEnMes);
    for (let i = 1; i <= diasRestantes; i++) {
        const dia = document.createElement('div');
        dia.className = 'calendario-dia otro-mes';
        dia.innerHTML = `<span class="numero">${i}</span>`;
        grid.appendChild(dia);
    }
}

/**
 * Selecciona un día del calendario y muestra sus movimientos
 */
function seleccionarDiaCalendario(fechaStr, dia) {
    calendarioDiaSeleccionado = fechaStr;
    
    // Quitar selección anterior
    document.querySelectorAll('.calendario-dia.seleccionado').forEach(d => {
        d.classList.remove('seleccionado');
    });

    const movsDia = movimientos.filter(m => m.fecha === fechaStr);
    const detalle = document.getElementById('calendario-detalle');
    const lista = document.getElementById('calendario-detalle-lista');
    
    document.getElementById('calendario-detalle-fecha').textContent = 
        `Movimientos del ${formatearFecha(fechaStr)}`;

    if (movsDia.length === 0) {
        lista.innerHTML = '<p style="color: var(--color-texto-terciario);">No hay movimientos este día.</p>';
    } else {
        lista.innerHTML = movsDia.map(m => `
            <div class="calendario-detalle-item">
                <span>${obtenerIconoCategoria(m.categoria)} ${m.categoria}</span>
                <span class="${m.tipo === 'Ingreso' ? 'monto-positivo' : 'monto-negativo'}">
                    ${m.tipo === 'Ingreso' ? '+' : '-'}${formatearMoneda(m.monto)}
                </span>
            </div>
        `).join('');
    }

    detalle.classList.add('visible');
}

// ==================== PIN DE SEGURIDAD ====================

/**
 * Verifica si hay PIN configurado y muestra el overlay si es necesario
 */
function verificarPinSeguridad() {
    pinSeguridad = localStorage.getItem('finanzas_pin');
    pinConfigurado = pinSeguridad !== null;
    
    if (pinConfigurado) {
        document.getElementById('pin-overlay').classList.remove('oculto');
        document.getElementById('pin-1').focus();
    } else {
        document.getElementById('pin-overlay').classList.add('oculto');
    }
}

/**
 * Mueve el foco al siguiente input de PIN
 */
function moverPinInput(numero) {
    const input = document.getElementById(`pin-${numero}`);
    if (input.value.length === 1 && numero < 4) {
        document.getElementById(`pin-${numero + 1}`).focus();
    }
    if (numero === 4 && input.value.length === 1) {
        verificarPin();
    }
}

/**
 * Maneja la tecla backspace en inputs de PIN
 */
function manejarBackspacePin(event, numero) {
    if (event.key === 'Backspace' && numero > 1) {
        const input = document.getElementById(`pin-${numero}`);
        if (input.value === '') {
            document.getElementById(`pin-${numero - 1}`).focus();
        }
    }
}

/**
 * Verifica el PIN ingresado
 */
function verificarPin() {
    const pinIngresado = `${document.getElementById('pin-1').value}${document.getElementById('pin-2').value}${document.getElementById('pin-3').value}${document.getElementById('pin-4').value}`;
    
    if (pinIngresado === pinSeguridad) {
        document.getElementById('pin-overlay').classList.add('oculto');
        document.getElementById('pin-error').classList.remove('visible');
        // Limpiar inputs
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`pin-${i}`).value = '';
        }
    } else {
        document.getElementById('pin-error').classList.add('visible');
        // Limpiar inputs y enfocar primero
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`pin-${i}`).value = '';
        }
        document.getElementById('pin-1').focus();
    }
}

/**
 * Muestra el formulario para configurar/cambiar PIN
 */
function mostrarConfigPin() {
    const nuevoPin = prompt('Ingresa un nuevo PIN de 4 dígitos (o deja vacío para eliminar):');
    
    if (nuevoPin === null) return;
    
    if (nuevoPin === '') {
        localStorage.removeItem('finanzas_pin');
        pinSeguridad = null;
        pinConfigurado = false;
        document.getElementById('pin-overlay').classList.add('oculto');
        mostrarToast('PIN eliminado', 'La protección por PIN ha sido desactivada', 'exito');
    } else if (/^\d{4}$/.test(nuevoPin)) {
        localStorage.setItem('finanzas_pin', nuevoPin);
        pinSeguridad = nuevoPin;
        pinConfigurado = true;
        document.getElementById('pin-overlay').classList.add('oculto');
        mostrarToast('PIN configurado', 'Tu nuevo PIN ha sido guardado', 'exito');
    } else {
        alert('El PIN debe ser exactamente 4 dígitos numéricos.');
    }
}

// ==================== ATAJOS DE TECLADO ====================

/**
 * Configura los atajos de teclado globales
 */
function configurarAtajosTeclado() {
    document.addEventListener('keydown', (e) => {
        // No activar atajos si estamos en un input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            // Solo Escape para cerrar modales
            if (e.key === 'Escape') {
                cerrarModalEditar();
                cerrarAyudaAtajos();
            }
            return;
        }

        // Ctrl/Cmd + tecla
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'n': // Nuevo movimiento
                    e.preventDefault();
                    document.getElementById('tipo').focus();
                    document.getElementById('tipo').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
                case 's': // Guardar/Sincronizar
                    e.preventDefault();
                    if (typeof sincronizarGitHub === 'function') {
                        sincronizarGitHub();
                    }
                    break;
                case 'e': // Exportar CSV
                    e.preventDefault();
                    exportarCSV();
                    break;
                case 'p': // Generar PDF
                    e.preventDefault();
                    generarReportePDF();
                    break;
                case 'f': // Enfocar búsqueda
                    e.preventDefault();
                    document.getElementById('filtro-busqueda').focus();
                    document.getElementById('filtro-busqueda').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
            }
        }

        // Teclas sin modificador
        switch (e.key) {
            case '?': // Mostrar ayuda de atajos
                e.preventDefault();
                toggleAyudaAtajos();
                break;
            case 'Escape': // Cerrar modales/ayuda
                cerrarModalEditar();
                cerrarAyudaAtajos();
                break;
            case '1': // Ir a resumen
                if (!e.ctrlKey && !e.metaKey) {
                    document.querySelector('.resumen').scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case '2': // Ir a formulario
                if (!e.ctrlKey && !e.metaKey) {
                    document.getElementById('formulario-movimiento').scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case '3': // Ir a tabla
                if (!e.ctrlKey && !e.metaKey) {
                    document.getElementById('tabla-movimientos').scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case '4': // Ir a gráficos
                if (!e.ctrlKey && !e.metaKey) {
                    document.getElementById('grafico-gastos').scrollIntoView({ behavior: 'smooth' });
                }
                break;
        }
    });
}

/**
 * Muestra/oculta el panel de ayuda de atajos
 */
function toggleAyudaAtajos() {
    let ayuda = document.getElementById('shortcuts-help');
    if (!ayuda) {
        ayuda = crearPanelAyudaAtajos();
    }
    ayuda.classList.toggle('visible');
}

/**
 * Cierra el panel de ayuda de atajos
 */
function cerrarAyudaAtajos() {
    const ayuda = document.getElementById('shortcuts-help');
    if (ayuda) {
        ayuda.classList.remove('visible');
    }
}

/**
 * Crea el panel de ayuda de atajos de teclado
 */
function crearPanelAyudaAtajos() {
    const ayuda = document.createElement('div');
    ayuda.id = 'shortcuts-help';
    ayuda.className = 'shortcuts-help';
    ayuda.innerHTML = `
        <h4>⌨️ Atajos de Teclado</h4>
        <ul>
            <li><span>Nuevo movimiento</span><kbd>Ctrl+N</kbd></li>
            <li><span>Buscar</span><kbd>Ctrl+F</kbd></li>
            <li><span>Exportar CSV</span><kbd>Ctrl+E</kbd></li>
            <li><span>Generar PDF</span><kbd>Ctrl+P</kbd></li>
            <li><span>Sincronizar</span><kbd>Ctrl+S</kbd></li>
            <li><span>Ir al resumen</span><kbd>1</kbd></li>
            <li><span>Ir al formulario</span><kbd>2</kbd></li>
            <li><span>Ir a movimientos</span><kbd>3</kbd></li>
            <li><span>Ir a gráficos</span><kbd>4</kbd></li>
            <li><span>Cerrar modal</span><kbd>Esc</kbd></li>
            <li><span>Esta ayuda</span><kbd>?</kbd></li>
        </ul>
        <button class="btn btn-secundario btn-pequeno" onclick="cerrarAyudaAtajos()" style="width: 100%; margin-top: 10px;">Cerrar</button>
    `;
    document.body.appendChild(ayuda);
    
    // También crear botón flotante de ayuda
    const btnAyuda = document.createElement('button');
    btnAyuda.className = 'btn-ayuda-flotante';
    btnAyuda.innerHTML = '?';
    btnAyuda.setAttribute('aria-label', 'Ver atajos de teclado');
    btnAyuda.onclick = toggleAyudaAtajos;
    document.body.appendChild(btnAyuda);
    
    return ayuda;
}
