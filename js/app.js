/**
 * ==================== APLICACIÓN PRINCIPAL ====================
 * Inicialización, Service Worker, actualización global
 */

// ==================== INICIALIZACIÓN ====================

/**
 * Función que se ejecuta al cargar la página.
 * Carga los datos guardados en localStorage y configura la fecha actual.
 */
function inicializar() {
    // Cargar datos desde localStorage si existen
    cargarDatosLocalStorage();
    
    // Cargar tema guardado
    cargarTema();
    
    // Establecer la fecha actual como valor por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = hoy;
    
    // Configurar el evento de cambio de tipo para actualizar categorías
    document.getElementById('tipo').addEventListener('change', actualizarCategoriasFormulario);
    
    // Actualizar todas las secciones de la interfaz
    actualizarCategoriasFormulario();
    renderizarCategoriasPersonalizadas();
    actualizarResumen();
    actualizarTabla();
    actualizarObjetivoAhorro();
    actualizarFiltroCategorias();
    actualizarResumenCategorias();
    
    // Inicializar nuevas funcionalidades
    inicializarGraficos();
    actualizarPresupuestos();
    actualizarRecurrentes();
    actualizarCategoriasRecurrente();
    verificarRecurrentesPendientes();
    configurarImportacion();
    
    // Nuevas funcionalidades v2.0
    verificarPinSeguridad();
    inicializarCalendario();
    verificarYEjecutarRecurrentes();
    verificarPresupuestosExcedidos();
    
    // Sistema de tabs
    restaurarTabActivo();
    actualizarCategoriasRapido();
    
    // Cargar configuración de GitHub si existe
    cargarConfigGitHub();

    // Configurar evento para cerrar modal de edición al hacer clic fuera
    document.getElementById('modal-editar').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalEditar();
        }
    });

    // Cerrar modal de acción rápida al hacer clic fuera
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('modal-accion-rapida');
        const botonFlotante = document.querySelector('.btn-accion-flotante');
        
        if (modal && modal.classList.contains('visible')) {
            if (!modal.contains(e.target) && e.target !== botonFlotante) {
                toggleModalAccionRapida();
            }
        }
    });
}

/**
 * Actualiza todas las secciones de la interfaz
 */
function actualizarTodo() {
    actualizarResumen();
    actualizarTabla();
    actualizarObjetivoAhorro();
    actualizarFiltroCategorias();
    actualizarResumenCategorias();
    actualizarCategoriasFormulario();
    renderizarCategoriasPersonalizadas();
    actualizarGraficos();
    actualizarPresupuestos();
    actualizarRecurrentes();
    renderizarCalendario();
}

// ==================== PWA - SERVICE WORKER ====================

/**
 * Registra el Service Worker para funcionalidad offline
 */
function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((registration) => {
                    console.log('Service Worker registrado:', registration.scope);
                    
                    // Verificar actualizaciones
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Hay una nueva versión disponible
                                if (confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
                                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                                    window.location.reload();
                                }
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.log('Error al registrar Service Worker:', error);
                });
        });
    }
}

/**
 * Solicita permiso para notificaciones (opcional)
 */
function solicitarPermisoNotificaciones() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ==================== FUNCIÓN PLACEHOLDER PARA COMPATIBILIDAD ====================

/**
 * Ya no se necesita - el sistema es automático
 */
function cargarCategoriasPresupuesto() {
    // Función vacía para compatibilidad
}

// ==================== INICIAR APLICACIÓN ====================

// Ejecutar inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    inicializar();
    registrarServiceWorker();
    configurarAtajosTeclado();
});
