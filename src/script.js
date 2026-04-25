/* ==========================================
   script.js — Lógica de Animación y Datos
   Misión Artemis — Curso DevOps IA
   ========================================== */

// ── 1. CARGA DE DATOS ──────────────────────────────────────────────────────
// Intenta obtener las fases desde la API (Docker Compose context).
// Si falla (GitHub Pages), lee el archivo estático db.json.
async function loadFases() {
    try {
        const res = await fetch('/api/fases');
        if (!res.ok) throw new Error('API no disponible');
        return await res.json();
    } catch {
        const res = await fetch('./db.json');
        const data = await res.json();
        return data.fases;
    }
}

// Intenta cargar el catálogo desde la API (solo funciona en Docker Compose).
async function loadCatalog() {
    try {
        const [prodRes, catRes] = await Promise.all([
            fetch('/api/productos'),
            fetch('/api/categorias')
        ]);
        if (!prodRes.ok || !catRes.ok) return null;
        return {
            productos: await prodRes.json(),
            categorias: await catRes.json()
        };
    } catch {
        return null;
    }
}

// ── 2. GENERADOR DE ESTRELLAS ──────────────────────────────────────────────
function createStars() {
    const container = document.getElementById('star-container');
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}%`;
        star.style.top  = `${Math.random() * 100}%`;
        const size = Math.random() * 2.5;
        star.style.width  = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay    = `${Math.random() * 3}s`;
        star.style.animationDuration = `${2 + Math.random() * 4}s`;
        container.appendChild(star);
    }
}

// ── 3. RENDERIZADO DEL CATÁLOGO ────────────────────────────────────────────
function renderCatalog(catalog) {
    if (!catalog) return;

    const panel   = document.getElementById('catalog-panel');
    const content = document.getElementById('catalog-content');

    // Agrupa productos por categoría
    const grouped = {};
    catalog.categorias.forEach(cat => { grouped[cat.nombre] = []; });
    catalog.productos.forEach(prod => {
        if (grouped[prod.categoria]) {
            grouped[prod.categoria].push(prod);
        }
    });

    let html = '';
    Object.entries(grouped).forEach(([catName, items]) => {
        if (items.length === 0) return;
        html += `<div class="catalog-category">${catName}</div>`;
        items.forEach(item => {
            html += `
            <div class="catalog-item">
                <span class="catalog-item-name">${item.nombre}</span>
                <span class="catalog-item-stock">x${item.stock}</span>
            </div>`;
        });
    });

    content.innerHTML = html;
    panel.classList.add('visible');
}

// ── 4. ANIMACIÓN ORBITAL ───────────────────────────────────────────────────
const orbitPath = document.getElementById('orbit-path');
const ship      = document.getElementById('ship');
const pathLength = orbitPath.getTotalLength();

let progress     = 0;
let currentPhase = -1;
let isPaused     = false;
const speed      = 0.3;
let fases        = [];

// Controles
const btnTogglePlay = document.getElementById('btn-toggle-play');
const btnPrev       = document.getElementById('btn-prev');
const btnNext       = document.getElementById('btn-next');
const crewControls  = document.getElementById('crew-controls');

btnTogglePlay.addEventListener('click', () => {
    isPaused = !isPaused;
    crewControls.classList.toggle('is-paused', isPaused);
    if (isPaused) {
        btnTogglePlay.innerText    = '▶';
        btnTogglePlay.title        = 'Continuar Misión';
        btnTogglePlay.style.color  = '#4facfe';
    } else {
        btnTogglePlay.innerText    = '⏸';
        btnTogglePlay.title        = 'Pausar Misión';
        btnTogglePlay.style.color  = '#9ca3af';
    }
});

function jumpToPhase(index) {
    const total = fases.length;
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    progress = (index / total) * pathLength;
    updateShipPosition(progress);
    currentPhase = index;
    updateUI(index);
}

btnPrev.addEventListener('click', () => jumpToPhase(currentPhase - 1));
btnNext.addEventListener('click', () => jumpToPhase(currentPhase + 1));

function updateShipPosition(pos) {
    const point     = orbitPath.getPointAtLength(pos);
    const nextPoint = orbitPath.getPointAtLength((pos + 1) % pathLength);
    const angle     = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
    ship.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle})`);
}

// ── 5. ACTUALIZACIÓN DE UI ─────────────────────────────────────────────────
const uiPanel    = document.getElementById('ui-panel');
const uiTitle    = document.getElementById('ui-title');
const uiLog      = document.getElementById('ui-log');
const uiSummary  = document.getElementById('ui-summary');
const uiIndicators = document.getElementById('ui-indicators');
let dots = [];

function initIndicators() {
    fases.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        uiIndicators.appendChild(dot);
        dots.push(dot);
    });
}

function updateUI(phaseIndex) {
    uiPanel.classList.add('updating');
    setTimeout(() => {
        const data = fases[phaseIndex];
        uiTitle.innerText = data.titulo;

        // Efecto typewriter para el log
        uiLog.innerText = '';
        let i = 0;
        function typeWriter() {
            if (i < data.log.length) {
                uiLog.innerHTML += data.log.charAt(i);
                i++;
                setTimeout(typeWriter, 20);
            }
        }
        typeWriter();

        uiSummary.innerText = data.resumen;

        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === phaseIndex);
        });

        uiPanel.classList.remove('updating');
    }, 300);
}

// ── 6. BUCLE DE ANIMACIÓN ──────────────────────────────────────────────────
function animateOrbit() {
    if (!isPaused) {
        progress += speed;
        if (progress >= pathLength) progress = 0;

        updateShipPosition(progress);

        const total      = fases.length;
        const percentage = progress / pathLength;
        let phaseIndex   = Math.floor(percentage * total);
        if (phaseIndex >= total) phaseIndex = total - 1;

        if (phaseIndex !== currentPhase) {
            currentPhase = phaseIndex;
            updateUI(phaseIndex);
        }
    }
    requestAnimationFrame(animateOrbit);
}

// ── 7. INICIALIZACIÓN ──────────────────────────────────────────────────────
window.addEventListener('load', async () => {
    createStars();

    fases = await loadFases();
    initIndicators();

    // Intentar cargar catálogo de la API (solo funciona en Docker Compose)
    const catalog = await loadCatalog();
    renderCatalog(catalog);

    setTimeout(() => {
        requestAnimationFrame(animateOrbit);
    }, 800);
});
