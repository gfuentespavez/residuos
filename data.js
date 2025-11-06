//import { routes } from './routes.js';

export const garbageData = [
    // Cemarc
    { comuna: "Concepción", relleno: "Relleno Cemarc Penco", toneladas: 50721.1, route: "concepcionToCemarc" },
    { comuna: "Penco", relleno: "Relleno Cemarc Penco", toneladas: 19696.85, route: "pencoToCemarc" },
    { comuna: "Tomé", relleno: "Relleno Cemarc Penco", toneladas: 23894.51, route: "tomeToCemarc" },
    { comuna: "San Pedro de la Paz", relleno: "Relleno Cemarc Penco", toneladas: 54910.38, route: "sanpedroToCemarc" },
    { comuna: "Coronel", relleno: "Relleno Cemarc Penco", toneladas: 51438.31, route: "coronelToCemarc" },
    { comuna: "Lota", relleno: "Relleno Cemarc Penco", toneladas: 26991.00658, route: "lotaToCemarc" },
    { comuna: "Chiguayante", relleno: "Relleno Cemarc Penco", toneladas: 33866.13, route: "chiguayanteToCemarc" },
    { comuna: "Hualqui", relleno: "Relleno Cemarc Penco", toneladas: 9074.6, route: "hualquiToCemarc" },
    { comuna: "Lebu", relleno: "Relleno Cemarc Penco", toneladas: 9172.43, route: "lebuToCemarc" },
    { comuna: "Santa Juana", relleno: "Relleno Cemarc Penco", toneladas: 4775, route: "santajuanaToCemarc" },
    { comuna: "Los Álamos", relleno: "Relleno Cemarc Penco", toneladas: 5421.3, route: "losalamosToCemarc" },

    // Los Ángeles
    { comuna: "Los Ángeles", relleno: "Relleno Los Ángeles", toneladas: 84295.74, route: "losangelesToLosAngeles" },
    { comuna: "Santa Bárbara", relleno: "Relleno Los Ángeles", toneladas: 6522.80, route: "santabarbaraToLosAngeles" },
    { comuna: "Alto Biobío", relleno: "Relleno Los Ángeles", toneladas: 100, route: "altobiobioToLosAngeles" },
    { comuna: "Nacimiento", relleno: "Relleno Los Ángeles", toneladas: 14161.659, route: "nacimientoToLosAngeles" },
    { comuna: "Tirúa", relleno: "Relleno Los Ángeles", toneladas: 6578.95, route: "tiruaToLosAngeles" },
    { comuna: "Contulmo", relleno: "Relleno Los Ángeles", toneladas: 3768.30, route: "contulmoToLosAngeles" },
    { comuna: "Cañete", relleno: "Relleno Los Ángeles", toneladas: 9148.57, route: "caneteToLosAngeles" },
    { comuna: "Quilleco", relleno: "Relleno Los Ángeles", toneladas: 5933.39, route: "quillecoToLosAngeles" },
    { comuna: "Tucapel", relleno: "Relleno Los Ángeles", toneladas: 5096.33, route: "tucapelToLosAngeles" },
    { comuna: "Laja", relleno: "Relleno Los Ángeles", toneladas: 7581.64, route: "lajaToLosAngeles" },
    { comuna: "Yumbel", relleno: "Relleno Los Ángeles", toneladas: 7560.22, route: "yumbelToLosAngeles" },
    { comuna: "Cabrero", relleno: "Relleno Los Ángeles", toneladas: 11066.57, reciclaje: 300, route: "cabreroToLosAngeles" },

    // Las Cruces
    { comuna: "Talcahuano", relleno: "Relleno Fundo Las Cruces", toneladas: 65853.167, route: "talcahuanoToLasCruces" },
    { comuna: "Antuco", relleno: "Relleno Fundo Las Cruces", toneladas: 1360.418, route: "antucoToLasCruces" },
    { comuna: "Hualpén", relleno: "Relleno Fundo Las Cruces", toneladas: 36953.05, route: "hualpenToLasCruces" },
    { comuna: "Florida", relleno: "Relleno Fundo Las Cruces", toneladas: 3139.89, route: "floridaToLasCruces" },

    // Licura
    { comuna: "San Rosendo", relleno: "Vertedero Licura", toneladas: 1463.18, route: "sanrosendoToLicura" },
    { comuna: "Quilaco", relleno: "Vertedero Licura", toneladas: 2484.31, route: "quilacoToLicura" },
    { comuna: "Negrete", relleno: "Vertedero Licura", toneladas: 6253.20, route: "negreteToLicura" },
    { comuna: "Mulchén", relleno: "Vertedero Licura", toneladas: 7765.79, route: "mulchenToLicura" },

    // Arauco - Chue
    { comuna: "Arauco", relleno: "Relleno Sanitario Arauco Curanilahue", toneladas: 12842.59, route: "araucoToAraucoChue" },
    { comuna: "Curanilahue", relleno: "Relleno Sanitario Arauco Curanilahue", toneladas: 9754.62, route: "curanilahueToAraucoChue" }
];

export const comunaCoords = {
    "Alto Biobío": [-71.3331, -37.9815],
    "Antuco": [-71.6628, -37.3353],
    "Arauco": [-73.31955, -37.24602],
    "Cabrero": [-72.4036, -37.0294],
    "Cañete": [-73.3957, -37.8003],
    "Chiguayante": [-73.0161, -36.9158],
    "Concepción": [-73.0503, -36.8270],
    "Contulmo": [-73.2384, -38.0163],
    "Coronel": [-73.1374, -37.0177],
    "Curanilahue": [-73.3411, -37.4764],
    "Florida": [-72.6642, -36.8219],
    "Hualpén": [-73.1192, -36.8094],
    "Hualqui": [-72.9378, -36.9782],
    "Laja": [-72.7128, -37.2842],
    "Lebu": [-73.6558, -37.6096],
    "Los Álamos": [-73.4542, -37.6226],
    "Los Ángeles": [-72.3537, -37.4693],
    "Lota": [-73.1593, -37.0911],
    "Mulchén": [-72.2415, -37.7183],
    "Nacimiento": [-72.6738, -37.5058],
    "Negrete": [-72.5401, -37.6015],
    "Penco": [-72.9926, -36.7410],
    "Quilaco": [-72.018394, -37.6865092],
    "Quilleco": [-71.9702, -37.4709],
    "San Pedro de la Paz": [-73.134180, -36.860862],
    "San Rosendo": [-72.7184, -37.2662],
    "Santa Bárbara": [-72.0293062, -37.6651548],
    "Santa Juana": [-72.9463, -37.1751],
    "Talcahuano": [-73.1154, -36.7249],
    "Tirúa": [-73.4913, -38.3377],
    "Tomé": [-72.9555, -36.6190],
    "Tucapel": [-72.1678, -37.2858],
    "Yumbel": [-72.5762, -37.0984]
};

export const rellenoCoords = {
    "Relleno Cemarc Penco": [-72.9833261, -36.7634115],
    "Relleno Sanitario Arauco Curanilahue": [-73.364, -37.409],
    "Relleno Los Ángeles": [-72.3395474, -37.2998048],
    "Vertedero Licura": [-72.2754906, -37.654802],
    "Relleno Fundo Las Cruces": [-72.1686415, -36.6967439],
};

export const rellenoColors = {
    "Relleno Cemarc Penco": "#00ffff",
    "Relleno Los Ángeles": "#00ff99",
    "Relleno Fundo Las Cruces": "#ffcc00",
    "Vertedero Licura": "#ff6666",
    "Relleno Sanitario Arauco Curanilahue": "#ff00ff"
};
