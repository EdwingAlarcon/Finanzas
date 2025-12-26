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
        { nombre: 'Alquiler', icono: '🏠' },
        { nombre: 'Bonificaciones', icono: '🎁' },
        { nombre: 'Freelance', icono: '💻' },
        { nombre: 'Inversiones', icono: '📈' },
        { nombre: 'Otros ingresos', icono: '💰' },
        { nombre: 'Préstamos recibidos', icono: '🤝' },
        { nombre: 'Reembolsos', icono: '↩️' },
        { nombre: 'Salario', icono: '💼' },
        { nombre: 'Ventas', icono: '🛒' }
    ],
    Ahorro: [
        { nombre: 'Educación', icono: '🎓' },
        { nombre: 'Fondo de emergencia', icono: '🛡️' },
        { nombre: 'Inversión', icono: '📈' },
        { nombre: 'Meta específica', icono: '🎯' },
        { nombre: 'Otro ahorro', icono: '🐷' },
        { nombre: 'Retiro/Pensión', icono: '👴' },
        { nombre: 'Tecnología', icono: '💻' },
        { nombre: 'Vehículo', icono: '🚗' },
        { nombre: 'Viaje', icono: '✈️' },
        { nombre: 'Vivienda', icono: '🏠' }
    ],
    Gasto: [
        { nombre: 'Alquiler/Hipoteca', icono: '🏠' },
        { nombre: 'Combustible', icono: '⛽' },
        { nombre: 'Comida', icono: '🍔' },
        { nombre: 'Deudas', icono: '💳' },
        { nombre: 'Educación', icono: '📚' },
        { nombre: 'Farmacia', icono: '💊' },
        { nombre: 'Gimnasio', icono: '🏋️' },
        { nombre: 'Hogar', icono: '🪑' },
        { nombre: 'Impuestos', icono: '📋' },
        { nombre: 'Internet/Teléfono', icono: '📱' },
        { nombre: 'Mascotas', icono: '🐾' },
        { nombre: 'Ocio', icono: '🎮' },
        { nombre: 'Otros gastos', icono: '📦' },
        { nombre: 'Regalos', icono: '🎁' },
        { nombre: 'Restaurantes', icono: '🍽️' },
        { nombre: 'Ropa', icono: '👕' },
        { nombre: 'Salud', icono: '🏥' },
        { nombre: 'Seguros', icono: '🛡️' },
        { nombre: 'Servicios', icono: '💡' },
        { nombre: 'Supermercado', icono: '🛒' },
        { nombre: 'Suscripciones', icono: '📺' },
        { nombre: 'Transporte', icono: '🚗' },
        { nombre: 'Viajes', icono: '✈️' }
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
