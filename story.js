import { storyChapters, storySettings } from './storyConfig.js';

/**
 * 📖 StorytellingController
 * Maneja la narrativa guiada del mapa de residuos
 */
export class StorytellingController {
    constructor(map, visualizationAPI) {
        this.map = map;
        this.viz = visualizationAPI;
        this.chapters = storyChapters;
        this.settings = storySettings;
        this.currentChapterIndex = 0;
        this.isAutoPlaying = false;
        this.autoPlayTimer = null;
        this.isTransitioning = false;

        // Referencias DOM
        this.container = null;
        this.progressBar = null;
        this.chapterContent = null;
        this.statsOverlay = null;
    }

    /**
     * 🚀 Inicializa el storytelling
     */
    init() {
        this.createStoryUI();
        this.bindEvents();
        this.goToChapter(0, false);
    }

    /**
     * 🎨 Crea la interfaz del storytelling
     */
    createStoryUI() {
        // Contenedor principal del story
        this.container = document.createElement('div');
        this.container.id = 'story-container';
        this.container.className = 'story-container';
        document.body.appendChild(this.container);

        // Barra de progreso
        const progressWrapper = document.createElement('div');
        progressWrapper.className = 'story-progress-wrapper';
        progressWrapper.innerHTML = `
      <div class="story-progress-bar">
        <div class="story-progress-fill"></div>
      </div>
      <div class="story-progress-text">
        <span id="currentChapter">1</span> / <span id="totalChapters">${this.chapters.length}</span>
      </div>
    `;
        this.container.appendChild(progressWrapper);
        this.progressBar = progressWrapper.querySelector('.story-progress-fill');

        // Contenido del capítulo actual
        this.chapterContent = document.createElement('div');
        this.chapterContent.className = 'story-chapter-content';
        this.container.appendChild(this.chapterContent);

        // Overlay de estadísticas
        this.statsOverlay = document.createElement('div');
        this.statsOverlay.className = 'story-stats-overlay';
        this.container.appendChild(this.statsOverlay);

        // Controles de navegación
        const controls = document.createElement('div');
        controls.className = 'story-controls';
        controls.innerHTML = `
      <button id="story-prev" class="story-btn" title="Anterior (←)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button id="story-play" class="story-btn story-btn-play" title="Reproducir automático">
        <svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>
      <button id="story-next" class="story-btn" title="Siguiente (→)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    `;
        this.container.appendChild(controls);

        // Indicador de capítulos (scroll móvil)
        const chaptersIndicator = document.createElement('div');
        chaptersIndicator.className = 'story-chapters-indicator';
        this.chapters.forEach((chapter, index) => {
            const dot = document.createElement('button');
            dot.className = 'chapter-dot';
            dot.setAttribute('data-chapter', index);
            dot.setAttribute('aria-label', chapter.title);
            if (index === 0) dot.classList.add('active');
            chaptersIndicator.appendChild(dot);
        });
        this.container.appendChild(chaptersIndicator);
    }

    /**
     * 🔗 Vincula eventos de interacción
     */
    bindEvents() {
        // Botones de navegación
        document.getElementById('story-prev')?.addEventListener('click', () => this.previousChapter());
        document.getElementById('story-next')?.addEventListener('click', () => this.nextChapter());
        document.getElementById('story-play')?.addEventListener('click', () => this.toggleAutoPlay());

        // Dots de capítulos
        document.querySelectorAll('.chapter-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-chapter'));
                this.goToChapter(index);
            });
        });

        // Teclado
        if (this.settings.enableKeyboardNav) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextChapter();
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.previousChapter();
                } else if (e.key === ' ') {
                    e.preventDefault();
                    this.toggleAutoPlay();
                }
            });
        }

        // Touch/Swipe para móviles
        if (this.settings.enableSwipeNav) {
            let touchStartY = 0;
            let touchEndY = 0;

            document.addEventListener('touchstart', (e) => {
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                touchEndY = e.changedTouches[0].screenY;
                this.handleSwipe(touchStartY, touchEndY);
            }, { passive: true });
        }

        // Scroll wheel (desktop)
        let scrollTimeout;
        document.addEventListener('wheel', (e) => {
            if (this.isTransitioning) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (e.deltaY > 0) {
                    this.nextChapter();
                } else if (e.deltaY < 0) {
                    this.previousChapter();
                }
            }, 150);
        }, { passive: true });
    }

    /**
     * 👆 Maneja gestos de swipe
     */
    handleSwipe(startY, endY) {
        const swipeThreshold = 50;
        const diff = startY - endY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - siguiente
                this.nextChapter();
            } else {
                // Swipe down - anterior
                this.previousChapter();
            }
        }
    }

    /**
     * 📍 Va a un capítulo específico
     */
    async goToChapter(index, animate = true) {
        if (index < 0 || index >= this.chapters.length) return;
        if (this.isTransitioning) return;

        this.isTransitioning = true;
        this.currentChapterIndex = index;
        const chapter = this.chapters[index];

        // Actualizar UI
        this.updateProgress();
        this.updateChapterContent(chapter);
        this.updateChapterDots();

        // Transición de cámara
        if (animate) {
            const animMethod = chapter.mapAnimation || 'flyTo';
            this.map[animMethod]({
                ...chapter.location,
                duration: chapter.duration,
                essential: true
            });

            // Esperar a que termine la transición
            await this.sleep(chapter.duration + this.settings.transitionBuffer);
        } else {
            this.map.jumpTo(chapter.location);
        }

        // Actualizar visualización
        this.viz.updateFlows(chapter.visualization.rellenos);
        this.viz.filterComunas(chapter.visualization.comunas);

        if (chapter.visualization.pauseAnimation) {
            this.viz.pauseAnimation();
        } else {
            this.viz.resumeAnimation();
        }

        // Mostrar stats si existen
        if (chapter.stats) {
            this.showStats(chapter.stats);
        } else {
            this.hideStats();
        }

        this.isTransitioning = false;

        // Auto-play siguiente capítulo
        if (this.isAutoPlaying) {
            this.scheduleNextChapter();
        }
    }

    /**
     * ⏭️ Siguiente capítulo
     */
    nextChapter() {
        if (this.currentChapterIndex < this.chapters.length - 1) {
            this.goToChapter(this.currentChapterIndex + 1);
        } else if (this.isAutoPlaying) {
            // Al final, volver al inicio en auto-play
            this.goToChapter(0);
        }
    }

    /**
     * ⏮️ Capítulo anterior
     */
    previousChapter() {
        if (this.currentChapterIndex > 0) {
            this.goToChapter(this.currentChapterIndex - 1);
        }
    }

    /**
     * ⏯️ Toggle auto-play
     */
    toggleAutoPlay() {
        this.isAutoPlaying = !this.isAutoPlaying;

        const playBtn = document.getElementById('story-play');
        const playIcon = playBtn?.querySelector('.play-icon');
        const pauseIcon = playBtn?.querySelector('.pause-icon');

        if (this.isAutoPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            this.scheduleNextChapter();
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            clearTimeout(this.autoPlayTimer);
        }
    }

    /**
     * ⏰ Programa el siguiente capítulo
     */
    scheduleNextChapter() {
        clearTimeout(this.autoPlayTimer);
        this.autoPlayTimer = setTimeout(() => {
            this.nextChapter();
        }, this.settings.autoPlayDelay);
    }

    /**
     * 📊 Actualiza barra de progreso
     */
    updateProgress() {
        const progress = ((this.currentChapterIndex + 1) / this.chapters.length) * 100;
        this.progressBar.style.width = `${progress}%`;

        document.getElementById('currentChapter').textContent = this.currentChapterIndex + 1;
    }

    /**
     * 📝 Actualiza contenido del capítulo
     */
    updateChapterContent(chapter) {
        this.chapterContent.innerHTML = `
      <h2 class="story-title">${chapter.title}</h2>
      <p class="story-description">${chapter.description}</p>
    `;

        // Animación de entrada
        this.chapterContent.classList.remove('visible');
        setTimeout(() => {
            this.chapterContent.classList.add('visible');
        }, 100);
    }

    /**
     * 🔵 Actualiza dots de capítulos
     */
    updateChapterDots() {
        document.querySelectorAll('.chapter-dot').forEach((dot, index) => {
            if (index === this.currentChapterIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    /**
     * 📈 Muestra overlay de estadísticas
     */
    showStats(stats) {
        let html = '<div class="stats-grid">';

        if (stats.totalToneladas) {
            html += `
        <div class="stat-item">
          <div class="stat-value">${stats.totalToneladas.toLocaleString()}</div>
          <div class="stat-label">Toneladas/año</div>
        </div>
      `;
        }

        if (stats.numComunas) {
            html += `
        <div class="stat-item">
          <div class="stat-value">${stats.numComunas}</div>
          <div class="stat-label">Comunas</div>
        </div>
      `;
        }

        if (stats.numRellenos) {
            html += `
        <div class="stat-item">
          <div class="stat-value">${stats.numRellenos}</div>
          <div class="stat-label">Rellenos</div>
        </div>
      `;
        }

        if (stats.distancia) {
            html += `
        <div class="stat-item">
          <div class="stat-value">${stats.distancia}</div>
          <div class="stat-label">Distancia</div>
        </div>
      `;
        }

        if (stats.reciclaje) {
            html += `
        <div class="stat-item stat-item-recycle">
          <div class="stat-value">${stats.reciclaje.toLocaleString()}</div>
          <div class="stat-label">Ton. Reciclaje</div>
        </div>
      `;
        }

        html += '</div>';

        if (stats.highlight) {
            html += `<div class="stat-highlight">${stats.highlight}</div>`;
        }

        this.statsOverlay.innerHTML = html;
        this.statsOverlay.classList.add('visible');
    }

    /**
     * 🚫 Oculta overlay de estadísticas
     */
    hideStats() {
        this.statsOverlay.classList.remove('visible');
    }

    /**
     * ⏱️ Utilidad: sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 🧹 Limpieza
     */
    destroy() {
        clearTimeout(this.autoPlayTimer);
        this.container?.remove();
    }
}

/**
 * 🎬 Función de inicialización para modo story
 */
export function initStory() {
    console.log('📖 Iniciando modo storytelling...');

    // Esperar a que la visualización esté lista
    window.addEventListener('visualizationReady', (event) => {
        const { map, api } = event.detail;

        // Crear e inicializar controller
        const story = new StorytellingController(map, api);
        story.init();

        // Exponer globalmente por si se necesita
        window.storyController = story;

        console.log('✅ Storytelling listo');
    });
}