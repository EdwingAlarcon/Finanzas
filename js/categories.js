/**
 * ==================== CATEGORÍAS ====================
 * Gestión de categorías predefinidas y personalizadas
 */

/**
 * Obtiene todas las categorías (predefinidas + personalizadas) de un tipo.
 * @param {string} tipo - 'Ingreso', 'Gasto' o 'Ahorro'
 * @returns {Array} - Array de categorías con nombre e icono
 */
function obtenerCategorias(tipo) {
    const predefinidas = categoriasPredefinidas[tipo] || [];
    const personalizadas = categoriasPersonalizadas[tipo] || [];
    return [...predefinidas, ...personalizadas];
}

/**
 * Obtiene el icono de una categoría por su nombre.
 * @param {string} nombre - Nombre de la categoría
 * @returns {string} - Emoji del icono
 */
function obtenerIconoCategoria(nombre) {
    for (const tipo of ['Ingreso', 'Gasto', 'Ahorro']) {
        const categorias = obtenerCategorias(tipo);
        const cat = categorias.find(c => c.nombre === nombre);
        if (cat) return cat.icono;
    }
    return '📌';
}

/**
 * Actualiza el select de categorías según el tipo seleccionado en el formulario principal.
 */
function actualizarCategoriasFormulario() {
    const tipo = document.getElementById('tipo').value;
    const selectCategoria = document.getElementById('categoria');
    
    selectCategoria.innerHTML = '<option value="">Seleccionar...</option>';
    
    if (tipo) {
        const categorias = obtenerCategorias(tipo);
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nombre;
            option.textContent = `${cat.icono} ${cat.nombre}`;
            selectCategoria.appendChild(option);
        });
    }
}

/**
 * Actualiza el select de categorías en el modal de edición.
 */
function actualizarCategoriasEditar() {
    const tipo = document.getElementById('editar-tipo').value;
    const selectCategoria = document.getElementById('editar-categoria');
    
    selectCategoria.innerHTML = '';
    
    const categorias = obtenerCategorias(tipo);
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.nombre;
        option.textContent = `${cat.icono} ${cat.nombre}`;
        selectCategoria.appendChild(option);
    });
}

/**
 * Actualiza las categorías del modal de acción rápida según el tipo seleccionado
 */
function actualizarCategoriasRapido() {
    const tipo = document.getElementById('rapido-tipo').value;
    const selectCategoria = document.getElementById('rapido-categoria');
    
    selectCategoria.innerHTML = '';
    
    const categorias = obtenerCategorias(tipo);
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.nombre;
        option.textContent = `${cat.icono} ${cat.nombre}`;
        selectCategoria.appendChild(option);
    });
}

/**
 * Actualiza el selector de categorías para movimientos recurrentes
 */
function actualizarCategoriasRecurrente() {
    const tipo = document.getElementById('recurrente-tipo').value;
    const select = document.getElementById('recurrente-categoria');
    select.innerHTML = '';
    
    const categorias = obtenerCategorias(tipo);
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.nombre;
        option.textContent = `${cat.icono} ${cat.nombre}`;
        select.appendChild(option);
    });
}

/**
 * Agrega una nueva categoría personalizada.
 */
function agregarCategoriaPersonalizada() {
    const tipo = document.getElementById('nueva-categoria-tipo').value;
    const nombre = document.getElementById('nueva-categoria-nombre').value.trim();
    const icono = document.getElementById('nueva-categoria-icono').value.trim() || '📌';

    if (!nombre) {
        mostrarMensaje('Por favor, ingresa un nombre para la categoría.', 'error');
        return;
    }

    // Verificar si ya existe
    const todasCategorias = obtenerCategorias(tipo);
    if (todasCategorias.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarMensaje('Esta categoría ya existe.', 'error');
        return;
    }

    categoriasPersonalizadas[tipo].push({ nombre, icono });
    guardarDatosLocalStorage();

    // Limpiar campos
    document.getElementById('nueva-categoria-nombre').value = '';
    document.getElementById('nueva-categoria-icono').value = '';

    // Actualizar UI
    renderizarCategoriasPersonalizadas();
    actualizarCategoriasFormulario();
    actualizarFiltroCategorias();

    mostrarMensaje(`Categoría "${nombre}" agregada correctamente.`, 'exito');
}

/**
 * Elimina una categoría personalizada.
 * @param {string} tipo - 'Ingreso' o 'Gasto'
 * @param {string} nombre - Nombre de la categoría a eliminar
 */
function eliminarCategoriaPersonalizada(tipo, nombre) {
    // Verificar si hay movimientos con esta categoría
    const movimientosConCategoria = movimientos.filter(m => m.categoria === nombre);
    
    if (movimientosConCategoria.length > 0) {
        if (!confirm(`Hay ${movimientosConCategoria.length} movimiento(s) con esta categoría. ¿Deseas eliminarla de todos modos? Los movimientos mantendrán el nombre de la categoría.`)) {
            return;
        }
    }

    categoriasPersonalizadas[tipo] = categoriasPersonalizadas[tipo].filter(c => c.nombre !== nombre);
    guardarDatosLocalStorage();

    renderizarCategoriasPersonalizadas();
    actualizarCategoriasFormulario();
    actualizarFiltroCategorias();

    mostrarMensaje('Categoría eliminada.', 'exito');
}

/**
 * Renderiza las listas de categorías en la sección de gestión.
 */
function renderizarCategoriasPersonalizadas() {
    // Renderizar categorías de ingreso
    const listaIngresos = document.getElementById('lista-categorias-ingreso');
    listaIngresos.innerHTML = '';
    
    obtenerCategorias('Ingreso').forEach(cat => {
        const esPersonalizada = categoriasPersonalizadas.Ingreso.some(c => c.nombre === cat.nombre);
        const tag = document.createElement('span');
        tag.className = 'tag-categoria ingreso';
        tag.innerHTML = `
            ${cat.icono} ${cat.nombre}
            ${esPersonalizada ? `<span class="eliminar-tag" onclick="eliminarCategoriaPersonalizada('Ingreso', '${cat.nombre}')" title="Eliminar">×</span>` : ''}
        `;
        listaIngresos.appendChild(tag);
    });

    // Renderizar categorías de gasto
    const listaGastos = document.getElementById('lista-categorias-gasto');
    listaGastos.innerHTML = '';
    
    obtenerCategorias('Gasto').forEach(cat => {
        const esPersonalizada = categoriasPersonalizadas.Gasto.some(c => c.nombre === cat.nombre);
        const tag = document.createElement('span');
        tag.className = 'tag-categoria gasto';
        tag.innerHTML = `
            ${cat.icono} ${cat.nombre}
            ${esPersonalizada ? `<span class="eliminar-tag" onclick="eliminarCategoriaPersonalizada('Gasto', '${cat.nombre}')" title="Eliminar">×</span>` : ''}
        `;
        listaGastos.appendChild(tag);
    });
}

/**
 * Actualiza las opciones del filtro de categorías basándose en los movimientos existentes.
 */
function actualizarFiltroCategorias() {
    const selectCategoria = document.getElementById('filtro-categoria');
    const categorias = [...new Set(movimientos.map(m => m.categoria))];
    
    // Mantener el valor seleccionado si existe
    const valorActual = selectCategoria.value;
    
    // Reconstruir opciones
    selectCategoria.innerHTML = '<option value="">Todas</option>';
    categorias.sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        const icono = obtenerIconoCategoria(cat);
        option.textContent = `${icono} ${cat}`;
        selectCategoria.appendChild(option);
    });
    
    // Restaurar selección si es válida
    if (categorias.includes(valorActual)) {
        selectCategoria.value = valorActual;
    }
}

/**
 * Actualiza el resumen visual por categorías del mes actual.
 */
function actualizarResumenCategorias() {
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();
    
    const movimientosMes = movimientos.filter(m => {
        const fechaMov = new Date(m.fecha);
        return fechaMov.getMonth() === mesActual && fechaMov.getFullYear() === anioActual;
    });

    // Agrupar por categoría
    const porCategoria = {};
    movimientosMes.forEach(m => {
        if (!porCategoria[m.categoria]) {
            porCategoria[m.categoria] = { total: 0, tipo: m.tipo };
        }
        porCategoria[m.categoria].total += m.monto;
    });

    const contenedor = document.getElementById('resumen-categorias');
    const sinCategorias = document.getElementById('sin-categorias');

    if (Object.keys(porCategoria).length === 0) {
        contenedor.innerHTML = '';
        sinCategorias.style.display = 'block';
        return;
    }

    sinCategorias.style.display = 'none';

    // Calcular máximo para las barras
    const maxMonto = Math.max(...Object.values(porCategoria).map(c => c.total));

    // Ordenar por monto descendente
    const categoriasOrdenadas = Object.entries(porCategoria).sort((a, b) => b[1].total - a[1].total);

    contenedor.innerHTML = categoriasOrdenadas.map(([nombre, data]) => {
        const icono = obtenerIconoCategoria(nombre);
        const porcentajeBarra = (data.total / maxMonto) * 100;
        const esGasto = data.tipo === 'Gasto';
        
        return `
            <div class="categoria-item fade-in">
                <div class="categoria-icono">${icono}</div>
                <div class="categoria-info">
                    <div class="categoria-nombre">${nombre}</div>
                    <div class="categoria-barra">
                        <div class="categoria-barra-relleno ${esGasto ? 'gasto' : 'ingreso'}" style="width: ${porcentajeBarra}%"></div>
                    </div>
                </div>
                <div class="categoria-monto ${esGasto ? 'gasto' : 'ingreso'}">${esGasto ? '-' : '+'}${formatearMoneda(data.total)}</div>
            </div>
        `;
    }).join('');
}

/**
 * Ya no se necesita - el sistema es automático
 */
function cargarCategoriasPresupuesto() {
    // Función vacía para compatibilidad
}
