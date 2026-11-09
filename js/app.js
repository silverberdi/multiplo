/**
 * Múltiplo — Base web estática, navegación y guía de la estrella
 * Alcance: MVP-01 y MVP-02 (Shell navegable + Estrella guía con voz nativa en español y efectos)
 * Sin backend, sin cuentas, sin analítica ni persistencia de progreso ficticia.
 */

import {
  StarGuideCoordinator,
  MASCOT_ASSETS,
  AUDIO_ASSETS,
  GUIDE_STATES,
  GUIDE_SCRIPT,
  STATE_DESCRIPTIONS
} from './star-guide.js';

(function () {
  'use strict';

  // Identificadores de las cuatro vistas aprobadas en el MVP
  const VALID_VIEWS = ['inicio', 'aprende', 'juego', 'fin'];
  let currentView = 'inicio';

  // Inicializar el coordinador de la guía
  const guide = new StarGuideCoordinator({
    onStateChange: (state, info) => {
      updateMascotVisuals(currentView, state, info);
    },
    onInstructionChange: (text) => {
      updateInstructionDisplay(currentView, text);
    }
  });

  /**
   * Actualiza los elementos visuales de la mascota (imagen, texto alternativo y etiqueta accesible)
   */
  function updateMascotVisuals(viewId, state, info = STATE_DESCRIPTIONS[state]) {
    const mascotImg = document.getElementById(`mascot-img-${viewId}`);
    if (mascotImg) {
      const assetPath = MASCOT_ASSETS[state] || MASCOT_ASSETS.normal;
      mascotImg.src = assetPath;
      mascotImg.alt = `Mascota estrella Múltiplo: ${info ? info.label : state}`;
    }

    const statusBadge = document.getElementById(`mascot-status-${viewId}`);
    if (statusBadge && info) {
      statusBadge.setAttribute('data-state', state);
      const iconSpan = statusBadge.querySelector('.status-icon');
      if (iconSpan) iconSpan.textContent = info.icon;
      const textSpan = statusBadge.querySelector('.status-text');
      if (textSpan) textSpan.textContent = info.text;
    }
  }

  /**
   * Actualiza el texto de instrucción si la vista lo requiere
   */
  function updateInstructionDisplay(viewId, text) {
    if (viewId === 'juego') {
      const heading = document.getElementById('heading-juego');
      if (heading && text.startsWith('¿')) {
        heading.textContent = text;
      }
    }
  }

  /**
   * Cambia de forma accesible la vista visible en la aplicación.
   * Cancela la voz previa al cambiar de actividad para no solapar discursos.
   * @param {string} viewId - Identificador de la vista ('inicio', 'aprende', 'juego', 'fin')
   * @param {Object} [options] - Opciones de transición (ej. speak)
   */
  function navigateTo(viewId, options = {}) {
    if (!VALID_VIEWS.includes(viewId)) {
      console.warn(`[Múltiplo] Vista desconocida: ${viewId}`);
      return;
    }

    // Cancelar voz anterior de forma inmediata antes de cambiar de actividad
    guide.cancelSpeech();

    VALID_VIEWS.forEach((id) => {
      const section = document.getElementById(`view-${id}`);
      if (!section) return;

      if (id === viewId) {
        section.hidden = false;
        section.classList.add('view-active');

        // Enfocar el encabezado principal de la vista por accesibilidad
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

    // Configurar estado inicial de la mascota según la vista
    if (viewId === 'fin') {
      guide.setState(GUIDE_STATES.CELEBRANDO);
      if (options.speak) {
        guide.playEffect('celebracion');
        guide.speakInstruction(GUIDE_SCRIPT.cierre, { returnState: GUIDE_STATES.CELEBRANDO });
      }
    } else if (viewId === 'aprende') {
      guide.setState(GUIDE_STATES.NORMAL);
      if (options.speak) {
        guide.speakInstruction(GUIDE_SCRIPT.demostracion, { returnState: GUIDE_STATES.NORMAL });
      }
    } else if (viewId === 'juego') {
      guide.setState(GUIDE_STATES.NORMAL);
      resetJuegoState();
      if (options.speak) {
        guide.speakInstruction(GUIDE_SCRIPT.pregunta, { returnState: GUIDE_STATES.NORMAL });
      }
    } else {
      guide.setState(GUIDE_STATES.NORMAL);
    }
  }

  /**
   * Restablece el estado de opciones y feedback en la vista de juego
   */
  function resetJuegoState() {
    const feedbackBox = document.getElementById('juego-feedback-box');
    if (feedbackBox) {
      feedbackBox.hidden = true;
      feedbackBox.textContent = '';
      feedbackBox.className = 'feedback-box';
    }

    const optionButtons = document.querySelectorAll('.btn-option');
    optionButtons.forEach((btn) => {
      btn.classList.remove('selected', 'option-correct', 'option-retry');
    });
  }

  /**
   * Conmuta el estado de sonido y actualiza el botón de la cabecera
   */
  function toggleSound() {
    const isEnabled = guide.toggleSound();
    syncSoundToggleButton(isEnabled);
  }

  /**
   * Sincroniza los atributos visuales y de accesibilidad del botón de sonido
   */
  function syncSoundToggleButton(isEnabled) {
    const btn = document.getElementById('btn-sound-toggle');
    if (!btn) return;

    btn.setAttribute('aria-pressed', String(isEnabled));
    const label = isEnabled ? 'Silenciar sonido' : 'Activar sonido';
    const title = isEnabled ? 'Sonido activado' : 'Sonido silenciado';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', title);

    const iconSpan = btn.querySelector('.sound-icon');
    if (iconSpan) {
      iconSpan.textContent = isEnabled ? '🔊' : '🔇';
    }
  }

  /**
   * Maneja la interacción con las opciones de respuesta del juego
   */
  function handleOptionClick(btn) {
    guide.notifyUserGesture();
    const optionVal = btn.getAttribute('data-option');
    const feedbackBox = document.getElementById('juego-feedback-box');
    const optionButtons = document.querySelectorAll('.btn-option');

    optionButtons.forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');

    if (optionVal === '6') {
      // Acierto (3 grupos de 2 = 6)
      guide.playEffect('acierto');
      guide.setState(GUIDE_STATES.CELEBRANDO);
      guide.speakInstruction(GUIDE_SCRIPT.acierto, { returnState: GUIDE_STATES.CELEBRANDO });

      if (feedbackBox) {
        feedbackBox.hidden = false;
        feedbackBox.className = 'feedback-box feedback-success';
        feedbackBox.textContent = '¡Muy bien! Tres grupos de dos manzanas son seis.';
      }
    } else {
      // Reintento no punitivo (conserva la actividad, invita a reintentar)
      guide.playEffect('intento');
      guide.setState(GUIDE_STATES.PENSANDO);
      guide.speakInstruction(GUIDE_SCRIPT.reintento, { returnState: GUIDE_STATES.PENSANDO });

      if (feedbackBox) {
        feedbackBox.hidden = false;
        feedbackBox.className = 'feedback-box feedback-retry';
        feedbackBox.textContent = 'Cuenta otra vez. Mira cada grupo con calma.';
      }
    }
  }

  /**
   * Maneja el clic en el botón de pista
   */
  function handleHintClick() {
    guide.notifyUserGesture();
    guide.playEffect('clic');
    guide.setState(GUIDE_STATES.PENSANDO);
    guide.speakInstruction(GUIDE_SCRIPT.pista, { returnState: GUIDE_STATES.PENSANDO });

    const feedbackBox = document.getElementById('juego-feedback-box');
    if (feedbackBox) {
      feedbackBox.hidden = false;
      feedbackBox.className = 'feedback-box feedback-hint';
      feedbackBox.textContent = '💡 Pista: Cada grupo tiene 2 manzanas. Cuenta: 2, 4, 6.';
    }
  }

  /**
   * Inicializa los escuchadores de eventos del shell y las cuatro vistas
   */
  function initApp() {
    // Sincronizar estado inicial del botón de sonido según preferencia persistida
    syncSoundToggleButton(guide.isSoundEnabled());

    // 1. Navegación desde Inicio
    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        navigateTo('aprende', { speak: true });
      });
    }

    const btnLevel1 = document.getElementById('btn-level-1');
    if (btnLevel1) {
      btnLevel1.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        navigateTo('aprende', { speak: true });
      });
    }

    // 2. Navegación desde Aprende
    const btnAprendeContinue = document.getElementById('btn-aprende-continue');
    if (btnAprendeContinue) {
      btnAprendeContinue.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        navigateTo('juego', { speak: true });
      });
    }

    const btnAprendeBack = document.getElementById('btn-aprende-back');
    if (btnAprendeBack) {
      btnAprendeBack.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        navigateTo('inicio');
      });
    }

    const btnAprendeSound = document.getElementById('btn-aprende-sound');
    if (btnAprendeSound) {
      btnAprendeSound.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        guide.repeatLastInstruction();
      });
    }

    // 3. Navegación desde Juego
    const btnJuegoNext = document.getElementById('btn-juego-next');
    if (btnJuegoNext) {
      btnJuegoNext.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        navigateTo('fin', { speak: true });
      });
    }

    const btnJuegoBack = document.getElementById('btn-juego-back');
    if (btnJuegoBack) {
      btnJuegoBack.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        navigateTo('inicio');
      });
    }

    const btnJuegoSound = document.getElementById('btn-juego-sound');
    if (btnJuegoSound) {
      btnJuegoSound.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        guide.repeatLastInstruction();
      });
    }

    const btnJuegoHint = document.getElementById('btn-juego-hint');
    if (btnJuegoHint) {
      btnJuegoHint.addEventListener('click', handleHintClick);
    }

    // Opciones del juego
    const optionButtons = document.querySelectorAll('.btn-option');
    optionButtons.forEach((btn) => {
      btn.addEventListener('click', () => handleOptionClick(btn));
    });

    // 4. Navegación desde Fin de ronda
    const btnFinRepeat = document.getElementById('btn-fin-repeat');
    if (btnFinRepeat) {
      btnFinRepeat.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        navigateTo('aprende', { speak: true });
      });
    }

    const btnFinHome = document.getElementById('btn-fin-home');
    if (btnFinHome) {
      btnFinHome.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        navigateTo('inicio');
      });
    }

    // 5. Logo de cabecera
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) {
      headerLogo.addEventListener('click', (e) => {
        e.preventDefault();
        guide.notifyUserGesture();
        guide.playEffect('clic');
        navigateTo('inicio');
      });
    }

    // 6. Conmutador de sonido
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        guide.notifyUserGesture();
        toggleSound();
      });
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

  // Exponer API para pruebas automatizadas y extensiones si window está disponible
  if (typeof window !== 'undefined') {
    window.__multiploApp = {
      navigateTo,
      getCurrentView: () => currentView,
      toggleSound,
      isSoundEnabled: () => guide.isSoundEnabled(),
      guide,
      VALID_VIEWS,
      GUIDE_SCRIPT,
      GUIDE_STATES,
      MASCOT_ASSETS,
      AUDIO_ASSETS
    };
  }
})();
