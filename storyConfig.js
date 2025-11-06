// 📖 Configuración de capítulos del storytelling
// Cada capítulo define: ubicación de cámara, filtros, duración y contenido

export const storyChapters = [
    {
        id: 'intro',
        title: 'El Viaje de los Residuos en Biobío',
        description: 'Cada día, miles de toneladas de residuos viajan desde las comunas del Biobío hacia los rellenos sanitarios de la región. Esta es la historia invisible de nuestros desechos.',
        location: {
            center: [-72.97963, -37.57494],
            zoom: 8.06,
            pitch: 0,
            bearing: 0
        },
        mapAnimation: 'easeTo',
        duration: 2500,
        visualization: {
            rellenos: [], // todos
            comunas: null,
            pauseAnimation: false
        }
    },

    {
        id: 'cemarc-overview',
        title: 'Cemarc Penco: El Gigante del Biobío',
        description: 'El relleno Cemarc en Penco es el más importante de la región. Once comunas convergen aquí con casi 290 mil toneladas anuales de residuos.',
        location: {
            center: [-72.9833, -36.7634],
            zoom: 10.2,
            pitch: 45,
            bearing: -15
        },
        mapAnimation: 'flyTo',
        duration: 3000,
        visualization: {
            rellenos: ['Relleno Cemarc Penco'],
            comunas: null,
            pauseAnimation: false
        },
        stats: {
            totalToneladas: 289960,
            numComunas: 11,
            highlight: 'El 48% de los residuos de la región'
        }
    },

    {
        id: 'concepcion-detail',
        title: 'Concepción: La Capital Regional',
        description: 'Solo Concepción aporta más de 50 mil toneladas al año, el flujo más grande de una sola comuna hacia Cemarc.',
        location: {
            center: [-72.95, -36.81],
            zoom: 11.5,
            pitch: 50,
            bearing: 90
        },
        mapAnimation: 'flyTo',
        duration: 2500,
        visualization: {
            rellenos: ['Relleno Cemarc Penco'],
            comunas: ['Concepción'],
            pauseAnimation: false
        },
        stats: {
            totalToneladas: 50721,
            distancia: '~18 km',
            highlight: 'Mayor generador individual'
        }
    },

    {
        id: 'san-pedro',
        title: 'San Pedro de la Paz',
        description: 'La comuna más poblada después de Concepción, con casi 55 mil toneladas anuales, superando incluso a la capital regional.',
        location: {
            center: [-73.10, -36.85],
            zoom: 11.0,
            pitch: 40,
            bearing: -45
        },
        mapAnimation: 'flyTo',
        duration: 2500,
        visualization: {
            rellenos: ['Relleno Cemarc Penco'],
            comunas: ['San Pedro de la Paz'],
            pauseAnimation: false
        },
        stats: {
            totalToneladas: 54910,
            distancia: '~22 km',
            highlight: 'Segundo mayor generador'
        }
    },

    {
        id: 'losangeles-hub',
        title: 'Los Ángeles: Centro del Interior',
        description: 'El relleno Los Ángeles sirve a las comunas del interior de la región, procesando más de 161 mil toneladas de 12 comunas diferentes.',
        location: {
            center: [-72.3537, -37.4693],
            zoom: 9.5,
            pitch: 35,
            bearing: 0
        },
        mapAnimation: 'flyTo',
        duration: 3000,
        visualization: {
            rellenos: ['Relleno Los Ángeles'],
            comunas: null,
            pauseAnimation: false
        },
        stats: {
            totalToneladas: 161813,
            numComunas: 12,
            highlight: 'Hub del interior provincial'
        }
    },

    {
        id: 'cabrero-recycling',
        title: 'Cabrero: La Excepción del Reciclaje',
        description: 'Cabrero es la única comuna con datos de reciclaje en este análisis: 300 toneladas anuales que retornan desde el relleno. Un flujo inverso que representa el futuro.',
        location: {
            center: [-72.4036, -37.0294],
            zoom: 11.5,
            pitch: 45,
            bearing: 120
        },
        mapAnimation: 'flyTo',
        duration: 2500,
        visualization: {
            rellenos: ['Relleno Los Ángeles'],
            comunas: ['Cabrero'],
            pauseAnimation: false
        },
        stats: {
            totalToneladas: 11067,
            reciclaje: 300,
            highlight: 'Única con flujo de reciclaje visible'
        }
    },

    {
        id: 'las-cruces',
        title: 'Las Cruces: El Relleno del Norte',
        description: 'Talcahuano, Hualpén y otras comunas del norte del Gran Concepción envían sus residuos al Fundo Las Cruces, con más de 107 mil toneladas anuales.',
        location: {
            center: [-72.60, -36.75],
            zoom: 10.0,
            pitch: 40,
            bearing: -90
        },
        mapAnimation: 'flyTo',
        duration: 2500,
        visualization: {
            rellenos: ['Relleno Fundo Las Cruces'],
            comunas: null,
            pauseAnimation: false
        },
        stats: {
            totalToneladas: 107306,
            numComunas: 4,
            highlight: 'Puerto y zona industrial'
        }
    },

    {
        id: 'arauco-costa',
        title: 'La Costa: Arauco y Curanilahue',
        description: 'Las comunas costeras de Arauco y Curanilahue comparten su propio relleno sanitario, procesando más de 22 mil toneladas combinadas.',
        location: {
            center: [-73.33, -37.36],
            zoom: 10.5,
            pitch: 30,
            bearing: 45
        },
        mapAnimation: 'flyTo',
        duration: 2500,
        visualization: {
            rellenos: ['Relleno Sanitario Arauco Curanilahue'],
            comunas: null,
            pauseAnimation: false
        },
        stats: {
            totalToneladas: 22597,
            numComunas: 2,
            highlight: 'Solución local costera'
        }
    },

    {
        id: 'licura-small',
        title: 'Licura: Los Pequeños Generadores',
        description: 'El vertedero Licura recibe residuos de cuatro comunas más pequeñas del interior: Mulchén, Negrete, Quilaco y San Rosendo.',
        location: {
            center: [-72.42, -37.55],
            zoom: 10.0,
            pitch: 35,
            bearing: 0
        },
        mapAnimation: 'flyTo',
        duration: 2500,
        visualization: {
            rellenos: ['Vertedero Licura'],
            comunas: null,
            pauseAnimation: false
        },
        stats: {
            totalToneladas: 17966,
            numComunas: 4,
            highlight: 'Comunas rurales del interior'
        }
    },

    {
        id: 'final-overview',
        title: 'El Sistema Completo',
        description: 'Cinco rellenos sanitarios, 33 comunas, casi 600 mil toneladas al año. Un sistema complejo que sostiene la vida moderna en el Biobío, y que enfrenta el desafío de la sostenibilidad.',
        location: {
            center: [-72.70, -37.35],
            zoom: 8.5,
            pitch: 30,
            bearing: 0
        },
        mapAnimation: 'flyTo',
        duration: 3500,
        visualization: {
            rellenos: [], // todos
            comunas: null,
            pauseAnimation: false
        },
        stats: {
            totalToneladas: 599642,
            numRellenos: 5,
            numComunas: 33,
            highlight: 'Una región, un desafío común'
        }
    }
];

// ⚙️ Configuración general del storytelling
export const storySettings = {
    autoPlayDelay: 6000, // ms que permanece en cada capítulo en auto-play
    transitionBuffer: 500, // ms de espera después de transición de cámara
    scrollThreshold: 0.5, // % de scroll para cambiar capítulo
    enableKeyboardNav: true, // flechas arriba/abajo
    enableSwipeNav: true // swipe en móviles
};