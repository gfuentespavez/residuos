import fs from 'fs';
import { garbageData, comunaCoords, rellenoCoords } from './data.js';

const token = 'pk.eyJ1IjoiZ2VybWFuZnVlbnRlcyIsImEiOiJjbWN4eG5vbzAwam90Mmpva2lqeWZteXUxIn0._4skowp2WM5yDc_sywRDkA';
async function getMapboxRoute(origin, destination) {
    const baseUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
    const coords = `${origin.join(',')};${destination.join(',')}`;
    const params = new URLSearchParams({
        geometries: 'geojson',
        overview: 'full',
        access_token: token
    });

    const url = `${baseUrl}/${coords}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Mapbox error: ${res.status}`);
    const data = await res.json();
    return data.routes[0]?.geometry?.coordinates || null;
}

async function generateAndExportRoutes() {
    const routeMap = {};
    const seen = new Set();

    for (const item of garbageData) {
        const { comuna, relleno, route } = item;
        if (!route || seen.has(route)) continue;
        seen.add(route);

        const origin = comunaCoords[comuna];
        const destination = rellenoCoords[relleno];

        if (!origin || !destination) {
            console.warn(`⚠️ Missing coords for ${comuna} or ${relleno}`);
            continue;
        }

        try {
            const coords = await getMapboxRoute(origin, destination);
            if (coords) {
                routeMap[route] = coords;
                console.log(`✅ ${route}: ${coords.length} points`);
            } else {
                console.log(`🚫 No route for ${route}`);
            }
        } catch (err) {
            console.error(`❌ Error for ${route}: ${err.message}`);
        }
    }

    // ✨ Write result to file
    const content = 'export const routes = ' + JSON.stringify(routeMap, null, 2) + ';\n';
    fs.writeFileSync('./routes.js', content);
    console.log('\n📦 routes.js written successfully!');
}

generateAndExportRoutes();
