import { garbageData } from './data.js';
import { rellenoColors } from './main.js';

let activeComunaTags = new Set();

// 📦 DOM Elements
const rellenoToggles = document.querySelectorAll('.form-check-input');
const comunaListEl = document.getElementById('comunaList');
const toneladasEl = document.getElementById('toneladasCounter');
const summaryTextEl = document.getElementById('comunaSummaryText');
const rellenoNameEl = document.getElementById('rellenoNameText');
const clearButtonEl = document.getElementById('clearComunaTags');

// 🔎 Aggregate comuna & toneladas
function getComunaData(selectedRellenos) {
    const filtered = garbageData.filter(d => selectedRellenos.includes(d.relleno));
    const comunaTotals = {};

    filtered.forEach(({ comuna, toneladas }) => {
        comunaTotals[comuna] = (comunaTotals[comuna] || 0) + toneladas;
    });

    return comunaTotals;
}

// 🧩 Comuna Tags
function updateComunaList(comunas) {
    comunaListEl.innerHTML = '';

    comunas.forEach(comuna => {
        const dataEntry = garbageData.find(d => d.comuna === comuna);
        const relleno = dataEntry?.relleno;
        const bgColor = rellenoColors[relleno] || '#444';

        const tag = document.createElement('div');
        tag.className = 'comuna-tag';
        tag.textContent = comuna;
        tag.style.borderColor = bgColor;
        tag.style.setProperty('--comuna-color', bgColor);

        // Restore selection state
        if (activeComunaTags.has(comuna)) {
            tag.classList.add('selected-comuna');
        }

        tag.addEventListener('click', () => {
            if (activeComunaTags.has(comuna)) {
                activeComunaTags.delete(comuna);
                tag.classList.remove('selected-comuna');
            } else {
                activeComunaTags.add(comuna);
                tag.classList.add('selected-comuna');
            }

            const selected = [...activeComunaTags];
            window.filterByComuna?.(selected.length > 0 ? selected : null);
        });

        comunaListEl.appendChild(tag);
    });
}

// 🔢 Animate counter
function animateToneladas(target) {
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    toneladasEl.textContent = '0';

    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            toneladasEl.textContent = Math.round(target).toLocaleString();
            clearInterval(interval);
        } else {
            toneladasEl.textContent = Math.round(current).toLocaleString();
        }
    }, 30);
}

// 🚀 Panel updater
function updatePanel() {
    const selectedRellenos = Array.from(rellenoToggles)
        .filter(el => el.checked)
        .map(el => el.value);

    if (selectedRellenos.length === 0) {
        comunaListEl.innerHTML = '<li class="list-group-item bg-dark text-muted">Selecciona al menos un relleno</li>';
        toneladasEl.textContent = '0';
        summaryTextEl.textContent = 'Selecciona rellenos para ver comunas en el mapa.';
        return;
    }

    const comunaData = getComunaData(selectedRellenos);
    const comunas = Object.keys(comunaData);
    const total = Object.values(comunaData).reduce((a, b) => a + b, 0);

    updateComunaList(comunas);
    animateToneladas(total);

    rellenoNameEl.textContent = selectedRellenos.join(', ');
    summaryTextEl.textContent = `Visualizando comunas que envían residuos a ${selectedRellenos.join(', ')}.`;

    window.updateFlowsForPanel?.(selectedRellenos);
}

// 🧹 Clear comuna selection
clearButtonEl?.addEventListener('click', () => {
    activeComunaTags.clear();
    document.querySelectorAll('.comuna-tag').forEach(t => t.classList.remove('selected-comuna'));
    window.filterByComuna?.(null);
});

// 🔩 Bind listeners
rellenoToggles.forEach(toggle => {
    toggle.addEventListener('change', updatePanel);
});

// 🟢 Init
updatePanel();
