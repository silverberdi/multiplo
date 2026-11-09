/**
 * Múltiplo — Base web estática y navegación entre vistas
 * Alcance: MVP-01 (Shell de navegación accesible para 4 vistas aprobadas)
 * Sin backend, sin cuentas, sin analítica ni persistencia de progreso ficticia.
 */

(function () {
  'use strict';

  // Identificadores de las cuatro vistas aprobadas en el MVP
  const VALID_VIEWS = ['inicio', 'aprende', 'juego', 'fin'];
  let currentView = 'inicio';
  let soundEnabled = true;

  /**
   * Cambia de forma accesible la vista visible en la aplicación.
   * @param {string} viewId - Identificador de la vista ('inicio', 'aprende', 'juego', 'fin')
   */
  function navigateTo(viewId) {
    if (!VALID_VIEWS.includes(viewId)) {
      console.warn(`[Múltiplo] Vista desconocida: ${viewId}`);
      return;
    }

    VALID_VIEWS.forEach((id) => {
      const section = document.getElementById(`view-${id}`);
      if (!section) return;

      if (id === viewId) {
        section.hidden = false;
        section.classList.add('view-active');
        // Accesibilidad: Enfocar el encabezado principal de la vista
        const heading = section.querySelector('h1, h2');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      } else {
        section.hidden = true;
        section.classList.remove('view-active');
      }
    });

    currentView = viewId;
  }

  /**
   * Conmuta el estado accesible del botón de sonido.
   */
  function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('btn-sound-toggle');
    if (!btn) return;

    btn.setAttribute('aria-pressed', String(soundEnabled));
    const label = soundEnabled ? 'Silenciar sonido' : 'Activar sonido';
    const title = soundEnabled ? 'Sonido activado' : 'Sonido silenciado';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', title);

    const iconSpan = btn.querySelector('.sound-icon');
    if (iconSpan) {
      iconSpan.textContent = soundEnabled ? '🔊' : '🔇';
    }
  }

  /**
   * Inicializa los escuchadores de eventos del shell y las cuatro vistas.
   */
  function initApp() {
    // 1. Navegación desde Inicio
    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', () => navigateTo('aprende'));
    }

    const btnLevel1 = document.getElementById('btn-level-1');
    if (btnLevel1) {
      btnLevel1.addEventListener('click', () => navigateTo('aprende'));
    }

    // 2. Navegación desde Aprende
    const btnAprendeContinue = document.getElementById('btn-aprende-continue');
    if (btnAprendeContinue) {
      btnAprendeContinue.addEventListener('click', () => navigateTo('juego'));
    }

    const btnAprendeBack = document.getElementById('btn-aprende-back');
    if (btnAprendeBack) {
      btnAprendeBack.addEventListener('click', () => navigateTo('inicio'));
    }

    // 3. Navegación desde Juego
    const btnJuegoNext = document.getElementById('btn-juego-next');
    if (btnJuegoNext) {
      btnJuegoNext.addEventListener('click', () => navigateTo('fin'));
    }

    const btnJuegoBack = document.getElementById('btn-juego-back');
    if (btnJuegoBack) {
      btnJuegoBack.addEventListener('click', () => navigateTo('inicio'));
    }

    // Opciones del juego (interacción visual en esqueleto)
    const optionButtons = document.querySelectorAll('.btn-option');
    optionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        optionButtons.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // 4. Navegación desde Fin de ronda
    const btnFinRepeat = document.getElementById('btn-fin-repeat');
    if (btnFinRepeat) {
      btnFinRepeat.addEventListener('click', () => navigateTo('aprende'));
    }

    const btnFinHome = document.getElementById('btn-fin-home');
    if (btnFinHome) {
      btnFinHome.addEventListener('click', () => navigateTo('inicio'));
    }

    // 5. Logo de cabecera
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) {
      headerLogo.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('inicio');
      });
    }

    // 6. Conmutador de sonido
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', toggleSound);
    }

    // Iniciar en la vista inicio
    navigateTo('inicio');
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // Exponer API mínima para pruebas automatizadas si window está disponible
  if (typeof window !== 'undefined') {
    window.__multiploApp = {
      navigateTo,
      getCurrentView: () => currentView,
      toggleSound,
      isSoundEnabled: () => soundEnabled,
      VALID_VIEWS
    };
  }
})();
