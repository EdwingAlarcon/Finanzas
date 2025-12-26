/**
 * Service Worker para Panel de Finanzas Personales
 * Permite funcionalidad offline y mejora el rendimiento con caché
 */

const CACHE_NAME = 'finanzas-v2';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    // CSS Modules
    '/css/main.css',
    '/css/variables.css',
    '/css/base.css',
    '/css/components.css',
    '/css/responsive.css',
    // JS Modules
    '/js/config.js',
    '/js/storage.js',
    '/js/categories.js',
    '/js/movements.js',
    '/js/charts.js',
    '/js/ui.js',
    '/js/app.js',
    // External CDN
    'https://cdn.jsdelivr.net/npm/chart.js'
];

/**
 * Evento de instalación - Cachea los recursos principales
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cacheando recursos principales');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Error durante la instalación:', error);
            })
    );
});

/**
 * Evento de activación - Limpia cachés antiguos
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Eliminando caché antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activado');
                return self.clients.claim();
            })
    );
});

/**
 * Evento fetch - Estrategia Cache First con fallback a network
 * Para recursos estáticos usa caché primero
 * Para otros recursos intenta network primero
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar solicitudes que no sean GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Ignorar solicitudes de extensiones de Chrome
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Estrategia: Cache First para recursos locales
    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(request));
    } else {
        // Network First para recursos externos (CDN de Chart.js, etc.)
        event.respondWith(networkFirst(request));
    }
});

/**
 * Estrategia Cache First
 * Busca en caché primero, si no existe va a la red
 * @param {Request} request - La solicitud fetch
 * @returns {Promise<Response>} - La respuesta
 */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            // Actualizar caché en background
            updateCache(request);
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Error en cacheFirst:', error);
        return new Response('Sin conexión', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Estrategia Network First
 * Intenta la red primero, si falla usa caché
 * @param {Request} request - La solicitud fetch
 * @returns {Promise<Response>} - La respuesta
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Red no disponible, buscando en caché...');
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Recurso no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Actualiza el caché en background
 * @param {Request} request - La solicitud a actualizar
 */
async function updateCache(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse);
        }
    } catch (error) {
        // Silenciosamente ignorar errores de actualización en background
    }
}

/**
 * Evento message - Permite comunicación con la página
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[SW] Caché limpiado');
        });
    }
});

/**
 * Evento sync - Para sincronización en background cuando hay conexión
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('[SW] Sincronizando datos...');
        // Aquí podrías implementar sincronización con un servidor
    }
});
