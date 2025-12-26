/**
 * ==================== ALMACENAMIENTO ====================
 * Funciones para localStorage, File System API y GitHub Gist
 */

// ==================== LOCALSTORAGE ====================

/**
 * Guarda los movimientos, categorías y el objetivo de ahorro en localStorage.
 * Permite persistir los datos entre sesiones del navegador.
 */
function guardarDatosLocalStorage() {
    localStorage.setItem('finanzas_movimientos', JSON.stringify(movimientos));
    localStorage.setItem('finanzas_objetivo', objetivoAhorro.toString());
    localStorage.setItem('finanzas_categorias', JSON.stringify(categoriasPersonalizadas));
    localStorage.setItem('finanzas_presupuestos', JSON.stringify(presupuestos));
    localStorage.setItem('finanzas_recurrentes', JSON.stringify(movimientosRecurrentes));
    
    // Auto-guardar en archivo local si está activo
    if (typeof autoGuardarSiActivo === 'function') {
        autoGuardarSiActivo();
    }
}

/**
 * Carga los datos guardados desde localStorage.
 * Si no hay datos guardados, mantiene los valores por defecto.
 */
function cargarDatosLocalStorage() {
    const movimientosGuardados = localStorage.getItem('finanzas_movimientos');
    const objetivoGuardado = localStorage.getItem('finanzas_objetivo');
    const categoriasGuardadas = localStorage.getItem('finanzas_categorias');
    const presupuestosGuardados = localStorage.getItem('finanzas_presupuestos');
    const recurrentesGuardados = localStorage.getItem('finanzas_recurrentes');
    
    if (movimientosGuardados) {
        movimientos = JSON.parse(movimientosGuardados);
    }
    
    if (objetivoGuardado) {
        objetivoAhorro = parseFloat(objetivoGuardado);
        document.getElementById('objetivo-monto').value = objetivoAhorro > 0 ? objetivoAhorro : '';
    }

    if (categoriasGuardadas) {
        categoriasPersonalizadas = JSON.parse(categoriasGuardadas);
    }

    if (presupuestosGuardados) {
        presupuestos = JSON.parse(presupuestosGuardados);
    }

    if (recurrentesGuardados) {
        movimientosRecurrentes = JSON.parse(recurrentesGuardados);
    }
}

// ==================== FILE SYSTEM API ====================

/**
 * Guarda los datos en un archivo local usando File System Access API
 */
async function guardarArchivoLocal() {
    // Verificar soporte
    if (!('showSaveFilePicker' in window)) {
        mostrarToast('No soportado', 'Tu navegador no soporta esta función. Usa Chrome o Edge.', 'error');
        return;
    }

    try {
        // Si no hay handle o queremos elegir nuevo archivo
        if (!archivoHandle) {
            archivoHandle = await window.showSaveFilePicker({
                suggestedName: 'finanzas_datos.json',
                types: [{
                    description: 'Archivo JSON',
                    accept: { 'application/json': ['.json'] }
                }]
            });
        }

        // Preparar datos
        const datos = {
            movimientos,
            objetivoAhorro,
            categoriasPersonalizadas,
            presupuestos,
            movimientosRecurrentes,
            fechaGuardado: new Date().toISOString(),
            version: '2.0'
        };

        // Escribir en archivo
        const writable = await archivoHandle.createWritable();
        await writable.write(JSON.stringify(datos, null, 2));
        await writable.close();

        // Actualizar estado
        const nombreArchivo = archivoHandle.name;
        document.getElementById('archivo-texto').textContent = `Guardado: ${nombreArchivo}`;
        document.getElementById('archivo-status').className = 'sync-status sincronizado';
        
        mostrarToast('¡Guardado!', `Datos guardados en ${nombreArchivo}`, 'exito');

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error guardando archivo:', error);
            mostrarToast('Error', 'No se pudo guardar el archivo', 'error');
        }
    }
}

/**
 * Carga datos desde un archivo local usando File System Access API
 */
async function cargarArchivoLocal() {
    // Verificar soporte
    if (!('showOpenFilePicker' in window)) {
        mostrarToast('No soportado', 'Tu navegador no soporta esta función. Usa Chrome o Edge.', 'error');
        return;
    }

    try {
        const [handle] = await window.showOpenFilePicker({
            types: [{
                description: 'Archivo JSON',
                accept: { 'application/json': ['.json'] }
            }]
        });

        archivoHandle = handle;
        const file = await handle.getFile();
        const contenido = await file.text();
        const datos = JSON.parse(contenido);

        // Confirmar antes de reemplazar
        if (confirm(`¿Cargar datos desde "${file.name}"? Esto reemplazará tus datos actuales.`)) {
            movimientos = datos.movimientos || [];
            objetivoAhorro = datos.objetivoAhorro || 0;
            categoriasPersonalizadas = datos.categoriasPersonalizadas || { Ingreso: [], Gasto: [], Ahorro: [] };
            presupuestos = datos.presupuestos || {};
            movimientosRecurrentes = datos.movimientosRecurrentes || [];

            guardarDatosLocalStorage();
            actualizarTodo();

            document.getElementById('archivo-texto').textContent = `Vinculado: ${file.name}`;
            document.getElementById('archivo-status').className = 'sync-status sincronizado';

            mostrarToast('¡Cargado!', `Datos restaurados desde ${file.name}`, 'exito');
        }

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error cargando archivo:', error);
            mostrarToast('Error', 'No se pudo cargar el archivo', 'error');
        }
    }
}

/**
 * Activa/desactiva el auto-guardado en archivo local
 */
function toggleAutoGuardadoArchivo() {
    autoGuardadoActivo = document.getElementById('auto-guardar-archivo').checked;
    
    if (autoGuardadoActivo && !archivoHandle) {
        mostrarToast('Sin archivo', 'Primero guarda en un archivo para activar auto-guardado', 'advertencia');
        document.getElementById('auto-guardar-archivo').checked = false;
        autoGuardadoActivo = false;
        return;
    }

    if (autoGuardadoActivo) {
        mostrarToast('Auto-guardado', 'Se guardará automáticamente en cada cambio', 'exito');
    }
}

/**
 * Guarda automáticamente si está activo
 */
function autoGuardarSiActivo() {
    if (autoGuardadoActivo && archivoHandle) {
        guardarArchivoLocal();
    }
}

// ==================== GITHUB GIST API ====================

/**
 * Muestra/oculta el token de GitHub
 */
function toggleVerToken() {
    const input = document.getElementById('github-token');
    input.type = input.type === 'password' ? 'text' : 'password';
}

/**
 * Muestra ayuda sobre cómo obtener token de GitHub
 */
function mostrarAyudaGitHub() {
    const ayuda = `
🔑 CÓMO OBTENER UN TOKEN DE GITHUB:

1. Ve a github.com e inicia sesión
2. Haz clic en tu foto de perfil → Settings
3. En el menú izquierdo, baja hasta "Developer settings"
4. Haz clic en "Personal access tokens" → "Tokens (classic)"
5. Clic en "Generate new token" → "Generate new token (classic)"
6. Dale un nombre descriptivo como "Finanzas App"
7. Selecciona solo el permiso "gist"
8. Clic en "Generate token"
9. ¡COPIA EL TOKEN INMEDIATAMENTE! Solo se muestra una vez

El token se verá así: ghp_xxxxxxxxxxxxxxxxxxxx

⚠️ IMPORTANTE: Guarda el token en un lugar seguro
    `;
    alert(ayuda);
}

/**
 * Guarda la configuración de GitHub en localStorage
 */
function guardarConfigGitHub() {
    const token = document.getElementById('github-token').value.trim();
    const gistId = document.getElementById('gist-id').value.trim();

    if (!token) {
        mostrarToast('Token requerido', 'Ingresa un token de GitHub', 'error');
        return;
    }

    localStorage.setItem('finanzas_github_token', token);
    if (gistId) {
        localStorage.setItem('finanzas_gist_id', gistId);
    }

    document.getElementById('github-texto').textContent = 'Configurado ✓';
    document.getElementById('github-status').className = 'sync-status sincronizado';
    
    mostrarToast('¡Guardado!', 'Configuración de GitHub guardada', 'exito');
}

/**
 * Carga la configuración de GitHub desde localStorage
 */
function cargarConfigGitHub() {
    const token = localStorage.getItem('finanzas_github_token');
    const gistId = localStorage.getItem('finanzas_gist_id');

    if (token) {
        document.getElementById('github-token').value = token;
        document.getElementById('github-texto').textContent = 'Configurado ✓';
        document.getElementById('github-status').className = 'sync-status sincronizado';
    }
    if (gistId) {
        document.getElementById('gist-id').value = gistId;
    }
}

/**
 * Sincroniza los datos con GitHub Gist
 */
async function sincronizarGitHub() {
    const token = localStorage.getItem('finanzas_github_token');
    let gistId = localStorage.getItem('finanzas_gist_id');

    if (!token) {
        mostrarToast('Sin configurar', 'Primero configura tu token de GitHub', 'error');
        return;
    }

    // Mostrar estado
    document.getElementById('github-texto').textContent = 'Sincronizando...';
    document.getElementById('github-status').className = 'sync-status sincronizando';

    // Preparar datos
    const datos = {
        movimientos,
        objetivoAhorro,
        categoriasPersonalizadas,
        presupuestos,
        movimientosRecurrentes,
        fechaSincronizacion: new Date().toISOString(),
        version: '2.0'
    };

    const contenidoArchivo = JSON.stringify(datos, null, 2);

    try {
        let response;

        if (gistId) {
            // Actualizar Gist existente
            response = await fetch(`https://api.github.com/gists/${gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: {
                        'finanzas_backup.json': {
                            content: contenidoArchivo
                        }
                    }
                })
            });
        } else {
            // Crear nuevo Gist
            response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: 'Backup de Finanzas Personales',
                    public: false,
                    files: {
                        'finanzas_backup.json': {
                            content: contenidoArchivo
                        }
                    }
                })
            });
        }

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const resultado = await response.json();

        // Guardar el ID del Gist para futuras sincronizaciones
        if (!gistId) {
            localStorage.setItem('finanzas_gist_id', resultado.id);
            document.getElementById('gist-id').value = resultado.id;
        }

        // Actualizar estado
        const fecha = new Date().toLocaleString('es-CO');
        document.getElementById('github-texto').textContent = `Sincronizado: ${fecha}`;
        document.getElementById('github-status').className = 'sync-status sincronizado';

        mostrarToast('¡Sincronizado!', 'Datos guardados en GitHub Gist', 'exito');

    } catch (error) {
        console.error('Error sincronizando con GitHub:', error);
        document.getElementById('github-texto').textContent = 'Error de sincronización';
        document.getElementById('github-status').className = 'sync-status error';
        mostrarToast('Error', 'No se pudo sincronizar con GitHub. Verifica tu token.', 'error');
    }
}

/**
 * Carga datos desde GitHub Gist
 */
async function cargarDesdeGitHub() {
    const token = localStorage.getItem('finanzas_github_token');
    const gistId = localStorage.getItem('finanzas_gist_id');

    if (!token || !gistId) {
        mostrarToast('Sin configurar', 'Configura tu token y sincroniza primero', 'error');
        return;
    }

    document.getElementById('github-texto').textContent = 'Descargando...';

    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const gist = await response.json();
        const contenido = gist.files['finanzas_backup.json']?.content;

        if (!contenido) {
            throw new Error('Archivo no encontrado en el Gist');
        }

        const datos = JSON.parse(contenido);

        if (confirm('¿Descargar datos desde GitHub? Esto reemplazará tus datos actuales.')) {
            movimientos = datos.movimientos || [];
            objetivoAhorro = datos.objetivoAhorro || 0;
            categoriasPersonalizadas = datos.categoriasPersonalizadas || { Ingreso: [], Gasto: [], Ahorro: [] };
            presupuestos = datos.presupuestos || {};
            movimientosRecurrentes = datos.movimientosRecurrentes || [];

            guardarDatosLocalStorage();
            actualizarTodo();

            const fecha = new Date().toLocaleString('es-CO');
            document.getElementById('github-texto').textContent = `Descargado: ${fecha}`;

            mostrarToast('¡Descargado!', 'Datos restaurados desde GitHub', 'exito');
        } else {
            document.getElementById('github-texto').textContent = 'Configurado ✓';
        }

    } catch (error) {
        console.error('Error cargando desde GitHub:', error);
        document.getElementById('github-texto').textContent = 'Error al descargar';
        document.getElementById('github-status').className = 'sync-status error';
        mostrarToast('Error', 'No se pudo descargar desde GitHub', 'error');
    }
}

// ==================== EXPORTACIÓN E IMPORTACIÓN ====================

/**
 * Exporta los movimientos a un archivo CSV.
 */
function exportarCSV() {
    if (movimientos.length === 0) {
        mostrarMensaje('No hay movimientos para exportar.', 'error');
        return;
    }

    const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
    const filas = movimientos.map(m => [
        m.fecha,
        m.tipo,
        m.categoria,
        `"${m.descripcion.replace(/"/g, '""')}"`,
        m.monto
    ]);

    const csv = [headers.join(','), ...filas.map(f => f.join(','))].join('\n');
    descargarArchivo(csv, 'finanzas_movimientos.csv', 'text/csv');
    mostrarMensaje('Archivo CSV exportado correctamente.', 'exito');
}

/**
 * Exporta todos los datos a JSON (versión completa)
 */
function exportarJSON() {
    const datos = {
        movimientos,
        objetivoAhorro,
        categoriasPersonalizadas,
        presupuestos,
        movimientosRecurrentes,
        fechaExportacion: new Date().toISOString(),
        version: '2.0'
    };

    const json = JSON.stringify(datos, null, 2);
    descargarArchivo(json, 'finanzas_backup_completo.json', 'application/json');
    mostrarMensaje('Backup completo exportado.', 'exito');
}

/**
 * Descarga un archivo con el contenido especificado.
 * @param {string} contenido - Contenido del archivo
 * @param {string} nombreArchivo - Nombre del archivo
 * @param {string} tipo - Tipo MIME del archivo
 */
function descargarArchivo(contenido, nombreArchivo, tipo) {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Configura los eventos de arrastrar y soltar para importación
 */
function configurarImportacion() {
    const zona = document.getElementById('zona-importar');
    
    zona.addEventListener('dragover', (e) => {
        e.preventDefault();
        zona.classList.add('arrastrando');
    });
    
    zona.addEventListener('dragleave', () => {
        zona.classList.remove('arrastrando');
    });
    
    zona.addEventListener('drop', (e) => {
        e.preventDefault();
        zona.classList.remove('arrastrando');
        
        const archivo = e.dataTransfer.files[0];
        if (archivo) {
            procesarArchivoImportado(archivo);
        }
    });
}

/**
 * Maneja el evento de selección de archivo
 */
function importarArchivo(event) {
    const archivo = event.target.files[0];
    if (archivo) {
        procesarArchivoImportado(archivo);
    }
}

/**
 * Procesa el archivo importado (JSON o CSV)
 */
function procesarArchivoImportado(archivo) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const contenido = e.target.result;
        const extension = archivo.name.split('.').pop().toLowerCase();
        
        try {
            if (extension === 'json') {
                importarJSONContenido(contenido);
            } else if (extension === 'csv') {
                importarCSVContenido(contenido);
            } else {
                mostrarMensaje('Formato de archivo no soportado.', 'error');
            }
        } catch (error) {
            mostrarMensaje('Error al procesar el archivo: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(archivo);
}

/**
 * Importa datos desde un archivo JSON
 */
function importarJSONContenido(contenido) {
    const datos = JSON.parse(contenido);
    
    if (datos.movimientos) {
        const confirmar = confirm(`Se importarán ${datos.movimientos.length} movimientos. ¿Deseas reemplazar los datos actuales o agregar a los existentes?\n\nAceptar = Reemplazar\nCancelar = Agregar`);
        
        if (confirmar) {
            movimientos = datos.movimientos;
        } else {
            // Agregar evitando duplicados por ID
            const idsExistentes = new Set(movimientos.map(m => m.id));
            datos.movimientos.forEach(m => {
                if (!idsExistentes.has(m.id)) {
                    movimientos.push(m);
                }
            });
        }
    }
    
    if (datos.objetivoAhorro !== undefined) {
        objetivoAhorro = datos.objetivoAhorro;
        document.getElementById('objetivo-monto').value = objetivoAhorro;
    }
    
    if (datos.categoriasPersonalizadas) {
        categoriasPersonalizadas = datos.categoriasPersonalizadas;
    }

    if (datos.presupuestos) {
        presupuestos = datos.presupuestos;
    }

    if (datos.movimientosRecurrentes) {
        movimientosRecurrentes = datos.movimientosRecurrentes;
    }
    
    guardarDatosLocalStorage();
    actualizarTodo();
    mostrarMensaje('Datos importados correctamente.', 'exito');
}

/**
 * Importa movimientos desde un archivo CSV
 */
function importarCSVContenido(contenido) {
    const lineas = contenido.split('\n').filter(l => l.trim());
    const cabecera = lineas[0].toLowerCase();
    
    // Detectar si tiene cabecera
    const tieneCabecera = cabecera.includes('fecha') || cabecera.includes('tipo');
    const inicio = tieneCabecera ? 1 : 0;
    
    const nuevosMovimientos = [];
    
    for (let i = inicio; i < lineas.length; i++) {
        const valores = lineas[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (valores.length >= 5) {
            nuevosMovimientos.push({
                id: Date.now() + i,
                fecha: valores[0],
                tipo: valores[1],
                categoria: valores[2],
                descripcion: valores[3] || '-',
                monto: parseFloat(valores[4]) || 0
            });
        }
    }
    
    if (nuevosMovimientos.length === 0) {
        mostrarMensaje('No se encontraron movimientos válidos en el CSV.', 'error');
        return;
    }
    
    const confirmar = confirm(`Se importarán ${nuevosMovimientos.length} movimientos. ¿Agregar a los existentes?`);
    if (confirmar) {
        movimientos = [...movimientos, ...nuevosMovimientos];
        guardarDatosLocalStorage();
        actualizarTodo();
        mostrarMensaje(`${nuevosMovimientos.length} movimientos importados.`, 'exito');
    }
}

/**
 * Limpia todos los datos de la aplicación.
 */
function limpiarTodosDatos() {
    if (confirm('⚠️ ¿Estás seguro de que deseas eliminar TODOS los datos?\n\nEsta acción eliminará:\n- Todos los movimientos\n- El objetivo de ahorro\n- Las categorías personalizadas\n\nEsta acción no se puede deshacer.')) {
        if (confirm('Esta es tu última oportunidad. ¿Realmente deseas eliminar todo?')) {
            movimientos = [];
            objetivoAhorro = 0;
            categoriasPersonalizadas = { Ingreso: [], Gasto: [] };
            
            localStorage.removeItem('finanzas_movimientos');
            localStorage.removeItem('finanzas_objetivo');
            localStorage.removeItem('finanzas_categorias');

            document.getElementById('objetivo-monto').value = '';
            
            actualizarResumen();
            actualizarTabla();
            actualizarObjetivoAhorro();
            actualizarFiltroCategorias();
            actualizarResumenCategorias();
            renderizarCategoriasPersonalizadas();
            actualizarCategoriasFormulario();

            mostrarMensaje('Todos los datos han sido eliminados.', 'exito');
        }
    }
}
