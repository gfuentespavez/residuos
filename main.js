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
let animationPaused = false;

// 🚀 Performance: Cache de proyecciones
let projectionCache = new Map();
let lastCameraState = null;
let needsReprojection = true;

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

// 🚀 Performance: Verificar si necesitamos re-proyectar
function cameraStateChanged() {
    const current = {
        zoom: map.getZoom(),
        center: map.getCenter(),
        bearing: map.getBearing(),
        pitch: map.getPitch()
    };

    if (!lastCameraState) {
        lastCameraState = current;
        return true;
    }

    // Tolerancia para evitar re-proyecciones innecesarias
    const zoomChanged = Math.abs(current.zoom - lastCameraState.zoom) > 0.01;
    const centerChanged = Math.abs(current.center.lng - lastCameraState.center.lng) > 0.001 ||
        Math.abs(current.center.lat - lastCameraState.center.lat) > 0.001;
    const bearingChanged = Math.abs(current.bearing - lastCameraState.bearing) > 0.5;
    const pitchChanged = Math.abs(current.pitch - lastCameraState.pitch) > 0.5;

    if (zoomChanged || centerChanged || bearingChanged || pitchChanged) {
        lastCameraState = current;
        return true;
    }

    return false;
}

// 🚀 Performance: Pre-proyectar un path completo
function projectPath(path, flowId) {
    const cacheKey = `${flowId}_${lastCameraState?.zoom || 0}`;

    if (projectionCache.has(cacheKey) && !needsReprojection) {
        return projectionCache.get(cacheKey);
    }

    const projected = path.map(([lng, lat]) => map.project({ lng, lat }));
    projectionCache.set(cacheKey, projected);

    return projected;
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

/* 🚚 Construcción de flujos */
function createFlows(selectedRellenos = []) {
    flows = [];
    const zoomLevel = map.getZoom();
    const simplified = zoomLevel < 8.06;

    garbageData.forEach((data, dataIndex) => {
        if (selectedRellenos.length && !selectedRellenos.includes(data.relleno)) return;
        if (activeComunaFilter && !activeComunaFilter.includes(data.comuna)) return;

        const startLngLat = comunaCoords[data.comuna];
        const endLngLat = rellenoCoords[data.relleno];
        const color = rellenoColors[data.relleno] || "#ffffff";
        const { tier } = getTierConfig(data.toneladas);
        const arcCount = simplified ? 1 : tier;
        const path = routes[data.route];

        for (let i = 0; i < arcCount; i++) {
            const flowId = `${data.route}_${dataIndex}_${i}`;
            flows.push({
                id: flowId,
                startLngLat,
                endLngLat,
                color,
                tier,
                toneladas: data.toneladas,
                path,
                particle: null,
                speed: 0.002,
                projectedPath: null
            });
        }

        if (data.reciclaje && data.reciclaje > 0) {
            const recicloTier = getTierConfig(data.reciclaje).tier;
            const recicloColor = "#8EE89E";
            const recicloArcs = simplified ? 1 : recicloTier;

            for (let i = 0; i < recicloArcs; i++) {
                const flowId = `${data.route}_recycle_${dataIndex}_${i}`;
                flows.push({
                    id: flowId,
                    startLngLat: endLngLat,
                    endLngLat: startLngLat,
                    color: recicloColor,
                    tier: recicloTier,
                    toneladas: data.reciclaje,
                    path: routes[data.route],
                    particle: null,
                    speed: 0.0022,
                    projectedPath: null
                });
            }
        }
    });

    needsReprojection = true;
}

// 🗺️ Etiquetas de comunas y rellenos
function updateLabels(activeRellenos = []) {
    labelContainer.innerHTML = '';

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

/* 🌌 Trayectos persistentes - Optimizado con cache */
function drawBaseRoutes() {
    ctx.globalCompositeOperation = "source-over";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cameraChanged = cameraStateChanged();
    if (cameraChanged) {
        needsReprojection = true;
        projectionCache.clear();
    }

    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.18;

    flows.forEach(flow => {
        if (!flow.projectedPath || needsReprojection) {
            if (flow.path) {
                flow.projectedPath = projectPath(flow.path, flow.id);
            } else {
                flow.projectedPath = [
                    map.project(flow.startLngLat),
                    map.project(flow.endLngLat)
                ];
            }
        }

        if (!flow.projectedPath || flow.projectedPath.length < 2) return;

        ctx.beginPath();
        flow.projectedPath.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });

        ctx.strokeStyle = flow.color;
        ctx.stroke();
    });

    needsReprojection = false;
    ctx.globalAlpha = 1;
}

/* ✨ Animación de partículas - Optimizada */
function animateWithPause() {
    const MAX_TRAIL = 80;
    const PARTICLE_RADIUS = 3;
    const SHADOW_BLUR = 20;

    function frame() {
        resizeCanvas();
        drawBaseRoutes();

        if (!animationPaused) {
            flows.forEach(flow => {
                const projectedPath = flow.projectedPath;

                if (!projectedPath || projectedPath.length < 2) return;

                if (!flow.particle) {
                    flow.particle = { t: Math.random() };
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

                const trail = projectedPath.slice(0, index + 1);
                trail.push({ x, y });
                const visibleTrail = trail.slice(Math.max(0, trail.length - MAX_TRAIL));

                ctx.globalCompositeOperation = "lighter";

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

                ctx.beginPath();
                ctx.arc(x, y, PARTICLE_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = flow.color;
                ctx.globalAlpha = 1;
                ctx.shadowBlur = SHADOW_BLUR + 10;
                ctx.shadowColor = flow.color;
                ctx.fill();

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

    invalidateProjectionCache() {
        projectionCache.clear();
        needsReprojection = true;
        flows.forEach(f => { f.projectedPath = null; });
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

    getFlows() {
        return flows;
    },

    getActiveFilters() {
        return {
            rellenos: activeRellenos,
            comunas: activeComunaFilter
        };
    },

    getPerformanceStats() {
        return {
            flowCount: flows.length,
            cacheSize: projectionCache.size,
            cameraState: lastCameraState
        };
    }
};

// 🔗 Mantener compatibilidad con panel.js existente
window.updateFlowsForPanel = function(selectedRellenos) {
    visualizationAPI.updateFlows(selectedRellenos);
};

window.filterByComuna = function(comunaNames) {
    visualizationAPI.filterComunas(comunaNames);
};

// 🚀 Inicialización
map.on('load', () => {
    // 🔧 FIX: Forzar resize del mapa en desktop
    setTimeout(() => {
        map.resize();
    }, 100);

    resizeCanvas();
    createFlows(activeRellenos, map.getZoom());
    drawBaseRoutes();
    animateWithPause();

    window.dispatchEvent(new CustomEvent('visualizationReady', {
        detail: { map, api: visualizationAPI }
    }));

    console.log('✅ Visualización lista');
});

// 🔄 Sincronización con interacciones del mapa
['zoom', 'move', 'rotate', 'pitch'].forEach(evt => {
    map.on(evt, () => {
        flows.forEach(f => { f.particle = null; });
        createFlows(activeRellenos, map.getZoom());
        needsReprojection = true;
        drawBaseRoutes();
        updateLabels(activeRellenos);
    });
});

// 🔧 FIX: Resize cuando la ventana cambia de tamaño
window.addEventListener('resize', () => {
    map.resize();
    resizeCanvas();
    visualizationAPI.invalidateProjectionCache();
});