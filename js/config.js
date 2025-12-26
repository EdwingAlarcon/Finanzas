/**
 * ==================== CONFIGURACIÓN Y CONSTANTES ====================
 * Categorías predefinidas, constantes y configuración inicial de la aplicación
 */

// ==================== VARIABLES GLOBALES ====================

// Array para almacenar todos los movimientos
let movimientos = [];

// Objetivo de ahorro mensual
let objetivoAhorro = 0;

// Configuración de ordenamiento actual
let ordenActual = { campo: 'fecha', direccion: 'desc' };

// Tema actual de la aplicación
let temaActual = 'claro';

// Categorías personalizadas del usuario
let categoriasPersonalizadas = {
    Ingreso: [],
    Gasto: [],
    Ahorro: []
};

// Presupuestos por categoría
let presupuestos = {};

// Movimientos recurrentes
let movimientosRecurrentes = [];

// Instancias de gráficos Chart.js
let graficos = {};

// PIN de seguridad
let pinSeguridad = null;
let pinConfigurado = false;

// Calendario
let calendarioMes = new Date().getMonth();
let calendarioAnio = new Date().getFullYear();
let calendarioDiaSeleccionado = null;

// Sincronización
let ultimaSincronizacion = null;

// Paginación
let paginaActual = 1;
const itemsPorPagina = 15;

// Debounce timer
let debounceTimer = null;

// File System API
let archivoHandle = null;
let autoGuardadoActivo = false;

// ==================== CATEGORÍAS PREDEFINIDAS ====================

const categoriasPredefinidas = {
    Ingreso: [
        { nombre: 'Salario', icono: '💼' },
        { nombre: 'Freelance', icono: '💻' },
        { nombre: 'Inversiones', icono: '📈' },
        { nombre: 'Bonificaciones', icono: '🎁' },
        { nombre: 'Ventas', icono: '🛒' },
        { nombre: 'Alquiler', icono: '🏠' },
        { nombre: 'Reembolsos', icono: '↩️' },
        { nombre: 'Préstamos recibidos', icono: '🤝' },
        { nombre: 'Otros ingresos', icono: '💰' }
    ],
    Ahorro: [
        { nombre: 'Fondo de emergencia', icono: '🛡️' },
        { nombre: 'Meta específica', icono: '🎯' },
        { nombre: 'Inversión', icono: '📈' },
        { nombre: 'Retiro/Pensión', icono: '👴' },
        { nombre: 'Educación', icono: '🎓' },
        { nombre: 'Viaje', icono: '✈️' },
        { nombre: 'Vivienda', icono: '🏠' },
        { nombre: 'Vehículo', icono: '🚗' },
        { nombre: 'Tecnología', icono: '💻' },
        { nombre: 'Otro ahorro', icono: '🐷' }
    ],
    Gasto: [
        { nombre: 'Comida', icono: '🍔' },
        { nombre: 'Supermercado', icono: '🛒' },
        { nombre: 'Transporte', icono: '🚗' },
        { nombre: 'Combustible', icono: '⛽' },
        { nombre: 'Servicios', icono: '💡' },
        { nombre: 'Internet/Teléfono', icono: '📱' },
        { nombre: 'Alquiler/Hipoteca', icono: '🏠' },
        { nombre: 'Ocio', icono: '🎮' },
        { nombre: 'Restaurantes', icono: '🍽️' },
        { nombre: 'Salud', icono: '🏥' },
        { nombre: 'Farmacia', icono: '💊' },
        { nombre: 'Educación', icono: '📚' },
        { nombre: 'Ropa', icono: '👕' },
        { nombre: 'Hogar', icono: '🪑' },
        { nombre: 'Mascotas', icono: '🐾' },
        { nombre: 'Suscripciones', icono: '📺' },
        { nombre: 'Gimnasio', icono: '🏋️' },
        { nombre: 'Deudas', icono: '💳' },
        { nombre: 'Regalos', icono: '🎁' },
        { nombre: 'Viajes', icono: '✈️' },
        { nombre: 'Impuestos', icono: '📋' },
        { nombre: 'Seguros', icono: '🛡️' },
        { nombre: 'Otros gastos', icono: '📦' }
    ]
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Formatea un número como moneda con separadores de miles.
 * @param {number} monto - Monto a formatear
 * @returns {string} - Monto formateado como moneda
 */
function formatearMoneda(monto) {
    return '$' + monto.toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

/**
 * Formatea una fecha en formato legible (día/mes/año).
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
function formatearFecha(fecha) {
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
}
