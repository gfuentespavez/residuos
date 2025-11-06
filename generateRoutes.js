import { garbageData, comunaCoords, rellenoCoords } from './data.js';

const token = 'pk.eyJ1IjoiZ2VybWFuZnVlbnRlcyIsImEiOiJjbWN4eG5vbzAwam90Mmpva2lqeWZteXUxIn0._4skowp2WM5yDc_sywRDkA'; // 🔐 Replace with your real token

async function getMapboxRoute(origin, destination) {
    const baseUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
    const coords = `${origin.join(',')};${destination.join(',')}`;
    const params = new URLSearchParams({
        geometries: 'geojson',
        overview: 'full',
        access_token: token
    });

    const url = `${baseUrl}/${coords}?${params.toString()}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Mapbox error: ${res.status}`);
        const data = await res.json();
        return data.routes[0]?.geometry?.coordinates || null;
    } catch (err) {
        console.error(`❌ Failed route ${coords}: ${err.message}`);
        return null;
    }
}

async function generateAllRoutes() {
    const routeMap = {};
    const seenKeys = new Set();

    for (const item of garbageData) {
        const { comuna, relleno } = item;
        const key = `${comuna.replace(/\s+/g, '')}_${relleno.replace(/\s+/g, '')}`;

        if (seenKeys.has(key)) continue; // Skip duplicates
        seenKeys.add(key);

        const origin = comunaCoords[comuna];
        const destination = rellenoCoords[relleno];

        if (!origin || !destination) {
            console.warn(`⚠️ Missing coords for ${comuna} or ${relleno}`);
            continue;
        }

        const coords = await getMapboxRoute(origin, destination);
        if (coords) {
            routeMap[key] = coords;
            console.log(`✅ ${key} generated with ${coords.length} points`);
        } else {
            console.log(`🚫 Failed to generate route for ${key}`);
        }
    }

    // ✅ Final output for data.js
    console.log('\n📦 Exportable routes:\n');
    console.log('export const routes = ' + JSON.stringify(routeMap, null, 2) + ';');
}

generateAllRoutes();