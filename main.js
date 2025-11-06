import { garbageData, comunaCoords, rellenoCoords } from './data.js';
import { routes } from './routes.js';

mapboxgl.accessToken = 'pk.eyJ1IjoiZ2VybWFuZnVlbnRlcyIsImEiOiJjbWN4eG5vbzAwam90Mmpva2lqeWZteXUxIn0._4skowp2WM5yDc_sywRDkA';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-72.97963, -37.57494],
    zoom: 8.06,
});

const canvas = document.getElementById('flow');
const ctx = canvas.getContext('2d');
const labelContainer = document.getElementById('label-container');

let flows = [];
let activeRellenos = [];
let activeComunaFilter = null;
let animationPaused = false; // ✨ Control de pausa para storytelling

export const rellenoColors = {
    "Relleno Cemarc Penco": "#FFF3A3",
    "Relleno Los Ángeles": "#FA697C",
    "Relleno Fundo Las Cruces": "#F39E60",
    "Vertedero Licura": "#DD356E",
    "Relleno Sanitario Arauco Curanilahue": "#008891"
};

// 🎨 Utilidades visuales
function resizeCanvas() {
    const { clientWidth, clientHeight } = canvas;
    if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
        canvas.width = clientWidth;
        canvas.height = clientHeight;
    }
}

function hexToRGBA(hex, opacity) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${opacity})`;
}

function getTierConfig(tons) {
    if (tons > 30000) return { tier: 3 };
    if (tons > 10000) return { tier: 2 };
    return { tier: 1 };
}


/* 🚚 Construcción de flujos
   - Cada flow tiene: color, path o start/end, y una partícula (t) que recorre 0..1 */
function createFlows(selectedRellenos = []) {
    flows = [];
    const zoomLevel = map.getZoom();
    const simplified = zoomLevel < 8.06;

    garbageData.forEach(data => {
        if (selectedRellenos.length && !selectedRellenos.includes(data.relleno)) return;
        if (activeComunaFilter && !activeComunaFilter.includes(data.comuna)) return;

        const startLngLat = comunaCoords[data.comuna];
        const endLngLat = rellenoCoords[data.relleno];
        const color = rellenoColors[data.relleno] || "#ffffff";
        const { tier } = getTierConfig(data.toneladas);
        const arcCount = simplified ? 1 : tier;
        const path = routes[data.route]; // puede ser undefined, usaremos línea recta

        for (let i = 0; i < arcCount; i++) {
            flows.push({
                startLngLat,
                endLngLat,
                color,
                tier,
                toneladas: data.toneladas,
                path,
                particle: null,
                speed: 0.002 // puedes personalizar por flow
            });
        }

        // Flujos de reciclaje (reversa)
        if (data.reciclaje && data.reciclaje > 0) {
            const recicloTier = getTierConfig(data.reciclaje).tier;
            const recicloColor = "#8EE89E";
            const recicloArcs = simplified ? 1 : recicloTier;

            for (let i = 0; i < recicloArcs; i++) {
                flows.push({
                    startLngLat: endLngLat,
                    endLngLat: startLngLat,
                    color: recicloColor,
                    tier: recicloTier,
                    toneladas: data.reciclaje,
                    path: routes[data.route], // si tienes una ruta dedicada, cámbiala aquí
                    particle: null,
                    speed: 0.0022
                });
            }
        }
    });
}

// 🗺️ Etiquetas de comunas y rellenos

function updateLabels(activeRellenos = []) {
    labelContainer.innerHTML = '';

    // Rellenos
    Object.entries(rellenoCoords).forEach(([name, coord]) => {
        if (activeRellenos.length && !activeRellenos.includes(name)) return;
        const pos = map.project(coord);
        const label = document.createElement('div');
        label.className = 'relleno-label';
        label.textContent = name;
        label.style.left = `${pos.x}px`;
        label.style.top = `${pos.y}px`;
        labelContainer.appendChild(label);
    });

    const zoom = map.getZoom();
    if (zoom < 8.5) return;

    // Comunas
    const displayedComunas = new Set();
    garbageData.forEach(data => {
        if (activeRellenos.length && !activeRellenos.includes(data.relleno)) return;
        if (activeComunaFilter && !activeComunaFilter.includes(data.comuna)) return;
        displayedComunas.add(data.comuna);
    });

    displayedComunas.forEach(comuna => {
        const coord = comunaCoords[comuna];
        const pos = map.project(coord);

        const pinWrapper = document.createElement('div');
        pinWrapper.className = 'comuna-pin-wrapper';
        pinWrapper.style.left = `${pos.x}px`;
        pinWrapper.style.top = `${pos.y}px`;

        const pinDot = document.createElement('div');
        pinDot.className = 'comuna-pin-dot';

        const label = document.createElement('div');
        label.className = 'comuna-pin-label';
        label.textContent = comuna;

        if (activeComunaFilter?.includes(comuna)) {
            label.classList.add('selected-comuna');
        }

        label.addEventListener('click', () => {
            if (!Array.isArray(activeComunaFilter)) activeComunaFilter = [];
            const index = activeComunaFilter.indexOf(comuna);
            if (index >= 0) {
                activeComunaFilter.splice(index, 1);
                label.classList.remove('selected-comuna');
            } else {
                activeComunaFilter.push(comuna);
                label.classList.add('selected-comuna');
            }
            window.filterByComuna?.(activeComunaFilter.length ? activeComunaFilter : null);
        });

        pinWrapper.appendChild(pinDot);
        pinWrapper.appendChild(label);
        labelContainer.appendChild(pinWrapper);
    });
}


/* 🌌 Trayectos persistentes
   - Se dibujan tenues cada frame para sincronizar con pan/zoom/tilt/rotate
   - Si quieres, puedes cachear paths proyectados en flows para menos trabajo */

function drawBaseRoutes() {
    ctx.globalCompositeOperation = "source-over";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Fondo transparente del frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Líneas base tenues
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.18;

    flows.forEach(flow => {
        const projectedPath = flow.path
            ? flow.path.map(([lng, lat]) => map.project({ lng, lat }))
            : [map.project(flow.startLngLat), map.project(flow.endLngLat)];

        if (!projectedPath || projectedPath.length < 2) return;

        ctx.beginPath();
        projectedPath.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });

        ctx.strokeStyle = flow.color;
        ctx.stroke();
    });

    ctx.globalAlpha = 1;
}

// ———————————————————————————————————————————————————————
/* ✨ Animación de partículas
   - Una partícula recorre 0..1 del path
   - Glow brillante con shadowBlur y composite lighter
   - Rápida: solo dibuja partículas, las rutas ya están en base */

function animateWithPause() {
    const MAX_TRAIL = 80;
    const PARTICLE_RADIUS = 3;
    const SHADOW_BLUR = 20;

    function frame() {
        resizeCanvas();

        // 🔹 Primero dibujar rutas base tenues
        drawBaseRoutes();

        // 🎬 Solo animar si no está pausado
        if (!animationPaused) {
            flows.forEach(flow => {
                const projectedPath = flow.path
                    ? flow.path.map(([lng, lat]) => map.project({ lng, lat }))
                    : [map.project(flow.startLngLat), map.project(flow.endLngLat)];
                if (projectedPath.length < 2) return;

                if (!flow.particle) {
                    flow.particle = { t: Math.random() }; // 👈 desfase inicial aleatorio
                }

                const speed = flow.speed ?? 0.002;
                flow.particle.t = (flow.particle.t + speed) % 1;

                const totalSegments = projectedPath.length - 1;
                const progress = flow.particle.t * totalSegments;
                const index = Math.floor(progress);
                const segmentT = progress - index;

                const p1 = projectedPath[index];
                const p2 = projectedPath[index + 1] || projectedPath[projectedPath.length - 1];
                const x = p1.x + (p2.x - p1.x) * segmentT;
                const y = p1.y + (p2.y - p1.y) * segmentT;

                // 🚀 Estela: tramo desde inicio hasta posición actual
                const trail = projectedPath.slice(0, index + 1);
                trail.push({ x, y });
                const visibleTrail = trail.slice(Math.max(0, trail.length - MAX_TRAIL));

                ctx.globalCompositeOperation = "lighter";

                // Estela
                ctx.lineWidth = 6;
                ctx.shadowBlur = SHADOW_BLUR;
                ctx.shadowColor = flow.color;
                ctx.strokeStyle = flow.color;
                ctx.globalAlpha = 0.4;

                ctx.beginPath();
                visibleTrail.forEach((pt, i) => {
                    if (i === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                });
                ctx.stroke();

                // Partícula
                ctx.beginPath();
                ctx.arc(x, y, PARTICLE_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = flow.color;
                ctx.globalAlpha = 1;
                ctx.shadowBlur = SHADOW_BLUR + 10;
                ctx.shadowColor = flow.color;
                ctx.fill();

                // Reset
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = "source-over";
            });
        }

        updateLabels(activeRellenos);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}


// ———————————————————————————————————————————————————————
// ✨ API Pública para storytelling y controles externos

export const visualizationAPI = {
    map: map,

    updateFlows(selectedRellenos) {
        activeRellenos = selectedRellenos || [];
        createFlows(activeRellenos);
    },

    filterComunas(comunaNames) {
        activeComunaFilter = comunaNames || null;
        createFlows(activeRellenos);
    },

    pauseAnimation() {
        animationPaused = true;
    },

    resumeAnimation() {
        animationPaused = false;
    },

    resetParticles() {
        flows.forEach(f => { f.particle = null; });
    },

    getCameraState() {
        return {
            center: map.getCenter(),
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing()
        };
    },

    setCameraState(state) {
        map.jumpTo(state);
    },

    // Exposición de datos para análisis
    getFlows() {
        return flows;
    },

    getActiveFilters() {
        return {
            rellenos: activeRellenos,
            comunas: activeComunaFilter
        };
    }
};


// ———————————————————————————————————————————————————————
// 🔗 API para paneles/controles

window.updateFlowsForPanel = function(selectedRellenos) {
    activeRellenos = selectedRellenos || [];
    createFlows(activeRellenos, map.getZoom());
};

// Filtro por comunas
window.filterByComuna = function(comunaNames) {
    activeComunaFilter = comunaNames || null;
    createFlows(activeRellenos, map.getZoom());
};


// 🚀 Inicialización
map.on('load', () => {
    resizeCanvas();
    createFlows(activeRellenos, map.getZoom());
    drawBaseRoutes();
    animateWithPause();

    // 📢 Emitir evento para que story.js o panel.js sepan que estamos listos
    window.dispatchEvent(new CustomEvent('visualizationReady', {
        detail: { map, api: visualizationAPI }
    }));

    console.log('✅ Visualización lista');
});

// 🔄 Sincronización con interacciones del mapa
['zoom', 'move', 'rotate', 'pitch'].forEach(evt => {
    map.on(evt, () => {
        // Reinicia partículas para evitar saltos raros tras reproyección
        flows.forEach(f => { f.particle = null; });
        createFlows(activeRellenos, map.getZoom());
        // La animación redibuja drawBaseRoutes() cada frame, pero lo hacemos
        // acá también para que la base no “parpadee” en el primer frame tras el evento.
        drawBaseRoutes();
        updateLabels(activeRellenos);
    });
});