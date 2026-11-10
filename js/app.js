/**
 * Múltiplo — Base web estática, navegación, guía de la estrella y motor de juego
 * Alcance: MVP-01 a MVP-04 (Shell + Guía + Demostración Aprende + Motor de preguntas evaluables)
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

import {
  createAprendeModel,
  selectAprendeFactors,
  renderAprende,
  MANZANA_ASSET
} from './aprende.js';

import {
  createQuestionRound,
  evaluateAnswer,
  revealHint,
  advanceRound,
  MODALITIES,
  getLevelA
} from './question-engine.js';

import {
  LEVELS_CATALOG,
  MIN_LEVEL,
  MAX_LEVEL,
  getLevelConfig,
  loadProgressionState,
  saveProgressionState,
  isLevelUnlocked,
  getUnlockedLevels,
  closeRoundProgression,
  evaluateProgressionUnlock,
  normalizeHighestUnlockedLevel,
  createInitialProgressionState
} from './progression.js';

(function () {
  'use strict';

  // Identificadores de las cuatro vistas aprobadas en el MVP
  const VALID_VIEWS = ['inicio', 'aprende', 'juego', 'fin'];
  let currentView = 'inicio';

  // Estado persistido y en memoria de la progresión de niveles
  let progressionLoadResult = loadProgressionState();
  let progressionState = progressionLoadResult.state;

  // Estado de la ronda actual (nivel, demo Aprende, ronda de preguntas y resumen)
  let currentRound = null;
  let forcedAprendeFactors = null;
  let forcedRoundOptions = null;

  /**
   * Inicia una nueva ronda para un nivel dado con factores derivados o seleccionados.
   * La demostración es no evaluable y las estrellas permanecen intactas en 0.
   */
  function startNewRound(level = 1, options = {}) {
    const requestedLevel = Number(level) || MIN_LEVEL;
    const validatedLevel = isLevelUnlocked(requestedLevel, progressionState.highestUnlockedLevel)
      ? requestedLevel
      : MIN_LEVEL;

    const previousB = (currentRound && currentRound.level === validatedLevel) ? currentRound.b : null;
    let factors;
    if (forcedAprendeFactors) {
      factors = { ...forcedAprendeFactors };
    } else {
      factors = selectAprendeFactors(validatedLevel, {
        a: options.a,
        b: options.b,
        previousB
      });
    }

    const model = createAprendeModel(factors.a, factors.b);
    const roundOptions = {
      ...(forcedRoundOptions || {}),
      ...options
    };

    const qRound = createQuestionRound(validatedLevel, roundOptions);

    currentRound = {
      level: validatedLevel,
      a: factors.a,
      b: factors.b,
      aprendeModel: model,
      questionRound: qRound,
      demonstrationShown: false,
      demoShown: false,
      stars: 0, // Invariante: las estrellas se obtienen en preguntas evaluables, nunca en Aprende
      get questions() {
        return this.questionRound ? this.questionRound.questions : [];
      },
      get currentIndex() {
        return this.questionRound ? this.questionRound.currentIndex : 0;
      },
      get summary() {
        return this.questionRound ? this.questionRound.summary : null;
      }
    };

    return currentRound;
  }

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
   * Actualiza el texto de instrucción si la vista lo requiere.
   * En la vista Juego, el encabezado conserva la notación matemática exigida ('¿Cuánto es a × b?'
   * y '¿Cuál multiplicación da N?') fijada por renderCurrentQuestion, por lo que no se sobrescribe
   * con la locución fonética hablada en palabras (spokenPrompt).
   */
  function updateInstructionDisplay(viewId, text) {
    // Conservar encabezado con notación matemática en la vista Juego sin sobrescribirlo
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
      if (currentRound && currentRound.questionRound && currentRound.questionRound.summary) {
        const progressionResult = closeRoundProgression(
          progressionState,
          currentRound,
          typeof localStorage !== 'undefined' ? localStorage : null
        );
        updateLevelsView();
        renderFinView(currentRound.questionRound.summary, progressionResult);
      }
      if (options.speak) {
        guide.playEffect('celebracion');
        guide.speakInstruction(GUIDE_SCRIPT.cierre, { returnState: GUIDE_STATES.CELEBRANDO });
      }
    } else if (viewId === 'aprende') {
      if (!currentRound) {
        startNewRound(1);
      }

      const container = document.getElementById('aprende-content');
      if (container && currentRound.aprendeModel) {
        renderAprende(container, currentRound.aprendeModel);
      }

      currentRound.demonstrationShown = true;
      currentRound.demoShown = true;
      guide.setState(GUIDE_STATES.NORMAL);

      if (options.speak && currentRound.aprendeModel) {
        guide.speakInstruction(currentRound.aprendeModel.narrationText, { returnState: GUIDE_STATES.NORMAL });
      }
    } else if (viewId === 'juego') {
      if (!currentRound || !currentRound.questionRound) {
        startNewRound(1);
      }
      guide.setState(GUIDE_STATES.NORMAL);
      renderCurrentQuestion(Boolean(options.speak));
    } else {
      guide.setState(GUIDE_STATES.NORMAL);
    }
  }

  /**
   * Renderiza grupos visuales en el contenedor de grupos de Juego
   */
  function renderJuegoGroups(container, groups, ariaLabel) {
    if (!container) return;
    container.innerHTML = '';
    container.setAttribute('aria-label', ariaLabel || 'Grupos de manzanas');

    groups.forEach((group) => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'item-group';
      groupDiv.setAttribute('aria-label', group.ariaLabel || `Grupo con ${group.itemCount} manzanas`);

      for (let i = 0; i < group.itemCount; i++) {
        const img = document.createElement('img');
        img.src = group.asset || MANZANA_ASSET;
        img.alt = 'Manzana roja';
        img.className = 'object-img';
        img.width = 48;
        img.height = 48;
        groupDiv.appendChild(img);
      }

      container.appendChild(groupDiv);
    });
  }

  /**
   * Renderiza la pregunta actual en la vista de juego
   */
  function renderCurrentQuestion(shouldSpeak = false) {
    if (!currentRound || !currentRound.questionRound) return;
    const qRound = currentRound.questionRound;
    const currentQ = qRound.questions[qRound.currentIndex];
    if (!currentQ) return;

    // 1. Progreso: "Pregunta 1 de 4", etc.
    const progressText = document.getElementById('game-progress-text');
    if (progressText) {
      progressText.textContent = `Pregunta ${currentQ.index + 1} de 4`;
    }

    // 2. Encabezado / Consigna
    const heading = document.getElementById('heading-juego');
    if (heading) {
      heading.textContent = currentQ.prompt;
    }

    const instructionText = document.getElementById('juego-instruction-text');
    if (instructionText) {
      instructionText.textContent = currentQ.instruction;
    }

    // 3. Mascota
    guide.setState(GUIDE_STATES.NORMAL);

    // 4. Limpiar caja de feedback
    const feedbackBox = document.getElementById('juego-feedback-box');
    if (feedbackBox) {
      feedbackBox.hidden = true;
      feedbackBox.textContent = '';
      feedbackBox.className = 'feedback-box';
    }

    // 5. Grupos visuales
    const groupsContainer = document.getElementById('juego-groups-container');
    if (groupsContainer) {
      if (currentQ.hasVisualGroups || currentQ.hintShown) {
        renderJuegoGroups(groupsContainer, currentQ.groups, currentQ.groupsAriaLabel);
        groupsContainer.hidden = false;
      } else {
        groupsContainer.innerHTML = '';
        groupsContainer.hidden = true;
      }
    }

    // 6. Botón de pista
    const btnHint = document.getElementById('btn-juego-hint');
    if (btnHint) {
      if (currentQ.hintAvailable) {
        btnHint.hidden = false;
        btnHint.disabled = false;
      } else {
        btnHint.hidden = true;
      }
    }

    // 7. Botón de continuar / siguiente
    const btnContinue = document.getElementById('btn-juego-continue');
    if (btnContinue) {
      if (currentQ.isResolved) {
        btnContinue.hidden = false;
        btnContinue.textContent = (currentQ.index === 3) ? 'Ver fin de ronda' : 'Continuar';
      } else {
        btnContinue.hidden = true;
      }
    }

    // 8. Opciones de respuesta dinámicas
    const optionsGrid = document.getElementById('juego-options-grid');
    if (optionsGrid) {
      optionsGrid.innerHTML = '';

      currentQ.alternatives.forEach((alt) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-option';
        btn.type = 'button';

        if (currentQ.modalidad === MODALITIES.PREGUNTA_5) {
          btn.setAttribute('data-option', String(alt.product));
          btn.setAttribute('data-operation', alt.label);
          btn.setAttribute('aria-label', alt.ariaLabel || alt.label);

          const span = document.createElement('span');
          span.className = 'option-operation';
          span.textContent = alt.label;
          btn.appendChild(span);
        } else {
          btn.setAttribute('data-option', String(alt.value));
          btn.setAttribute('aria-label', String(alt.value));

          const span = document.createElement('span');
          span.className = 'option-number';
          span.textContent = alt.label;
          btn.appendChild(span);
        }

        if (currentQ.isResolved) {
          btn.disabled = true;
          if (alt.isCorrect) {
            btn.classList.add('option-correct');
          }
        }

        btn.addEventListener('click', () => handleOptionSelect(alt, btn));
        optionsGrid.appendChild(btn);
      });
    }

    // 9. Locución si se solicita
    if (shouldSpeak) {
      guide.speakInstruction(currentQ.spokenPrompt, { returnState: GUIDE_STATES.NORMAL });
    }
  }

  /**
   * Maneja la interacción con una opción de respuesta
   */
  function handleOptionSelect(option, btn) {
    if (!currentRound || !currentRound.questionRound) return;
    const qRound = currentRound.questionRound;
    const currentQ = qRound.questions[qRound.currentIndex];
    if (!currentQ || currentQ.isResolved) return;

    guide.notifyUserGesture();

    const evalResult = evaluateAnswer(qRound, option);
    const feedbackBox = document.getElementById('juego-feedback-box');
    const optionsGrid = document.getElementById('juego-options-grid');
    const btnContinue = document.getElementById('btn-juego-continue');

    // Quitar selección previa de otros botones
    if (optionsGrid) {
      const allBtns = optionsGrid.querySelectorAll('.btn-option');
      allBtns.forEach((b) => b.classList.remove('selected'));
    }
    btn.classList.add('selected');

    if (evalResult.isCorrect) {
      // Acierto
      btn.classList.add('option-correct');

      // Deshabilitar todas las opciones para evitar selecciones posteriores
      if (optionsGrid) {
        const allBtns = optionsGrid.querySelectorAll('.btn-option');
        allBtns.forEach((b) => {
          b.disabled = true;
        });
      }

      guide.playEffect('acierto');
      guide.setState(GUIDE_STATES.CELEBRANDO);
      guide.speakInstruction(GUIDE_SCRIPT.acierto, { returnState: GUIDE_STATES.CELEBRANDO });

      if (feedbackBox) {
        feedbackBox.hidden = false;
        feedbackBox.className = 'feedback-box feedback-success';
        feedbackBox.textContent = '¡Muy bien! Respuesta correcta.';
      }

      if (btnContinue) {
        btnContinue.hidden = false;
        btnContinue.textContent = evalResult.isLastQuestion ? 'Ver fin de ronda' : 'Continuar';
        btnContinue.focus();
      }
    } else {
      // Reintento no punitivo
      btn.classList.add('option-retry');

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
    if (!currentRound || !currentRound.questionRound) return;
    guide.notifyUserGesture();

    const hintInfo = revealHint(currentRound.questionRound);
    if (!hintInfo) return;

    guide.playEffect('clic');
    guide.setState(GUIDE_STATES.PENSANDO);

    const feedbackBox = document.getElementById('juego-feedback-box');
    if (feedbackBox) {
      feedbackBox.hidden = false;
      feedbackBox.className = 'feedback-box feedback-hint';
      feedbackBox.textContent = hintInfo.hintText;
    }

    const groupsContainer = document.getElementById('juego-groups-container');
    if (groupsContainer) {
      renderJuegoGroups(groupsContainer, hintInfo.groups, hintInfo.groupsAriaLabel);
      groupsContainer.hidden = false;
    }

    guide.speakInstruction(hintInfo.hintText, { returnState: GUIDE_STATES.PENSANDO });
  }

  /**
   * Actualiza los estados visuales y de accesibilidad de las tarjetas de nivel en la vista Inicio
   */
  function updateLevelsView() {
    LEVELS_CATALOG.forEach((item) => {
      const btn = document.getElementById(`btn-level-${item.level}`);
      if (!btn) return;
      const unlocked = isLevelUnlocked(item.level, progressionState.highestUnlockedLevel);

      if (unlocked) {
        btn.disabled = false;
        btn.removeAttribute('aria-disabled');
        btn.classList.remove('level-locked');
        btn.classList.add('level-unlocked');
        btn.setAttribute('aria-label', `${item.ariaLabel}. Nivel disponible`);
        const badge = btn.querySelector('.level-badge');
        if (badge) {
          badge.className = 'level-badge available-badge';
          badge.removeAttribute('aria-hidden');
          badge.textContent = 'Disponible';
        }
      } else {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.remove('level-unlocked');
        btn.classList.add('level-locked');
        btn.setAttribute('aria-label', `${item.ariaLabel}. Bloqueado`);
        const badge = btn.querySelector('.level-badge');
        if (badge) {
          badge.className = 'level-badge locked-badge';
          badge.setAttribute('aria-hidden', 'true');
          badge.textContent = '🔒 Bloqueado';
        }
      }
    });

    const banner = document.getElementById('storage-status-banner');
    if (banner) {
      if (progressionLoadResult.warning) {
        banner.hidden = false;
        banner.textContent = progressionLoadResult.warning;
      } else {
        banner.hidden = true;
        banner.textContent = '';
      }
    }
  }

  /**
   * Maneja el clic en el botón Continuar / Ver fin de ronda
   */
  function handleContinueClick() {
    if (!currentRound || !currentRound.questionRound) return;
    guide.notifyUserGesture();
    guide.playEffect('clic');

    const adv = advanceRound(currentRound.questionRound);
    if (adv.isFinished) {
      const progressionResult = closeRoundProgression(
        progressionState,
        currentRound,
        typeof localStorage !== 'undefined' ? localStorage : null
      );
      updateLevelsView();
      renderFinView(adv.summary, progressionResult);
      navigateTo('fin', { speak: true });
    } else {
      renderCurrentQuestion(true);
    }
  }

  /**
   * Renderiza el resumen accesible en la vista Fin de ronda (0..4 aciertos)
   */
  function renderFinView(summary, progressionResult) {
    const scoreText = document.getElementById('fin-score-text');
    if (scoreText && summary) {
      scoreText.textContent = `Aciertos al primer intento: ${summary.firstAttemptSuccesses} de 4`;
    }

    const message = document.getElementById('fin-summary-message');
    if (message && summary) {
      if (summary.firstAttemptSuccesses === 4) {
        message.textContent = '¡Excelente trabajo! Acertaste todas al primer intento.';
      } else if (summary.firstAttemptSuccesses >= 3) {
        message.textContent = '¡Muy bien hecho! Sigue practicando.';
      } else {
        message.textContent = '¡Buen esfuerzo! Puedes repetir la ronda para mejorar.';
      }
    }

    const unlockText = document.getElementById('fin-unlock-text');
    const btnNext = document.getElementById('btn-fin-next');
    const result = progressionResult || (currentRound ? currentRound._progressionResult : null);

    if (result && result.unlockedNewLevel && result.nextLevel) {
      if (unlockText) {
        unlockText.hidden = false;
        unlockText.textContent = `🌟 ¡Desbloqueaste el Nivel ${result.nextLevel}!`;
      }
    } else {
      if (unlockText) {
        unlockText.hidden = true;
        unlockText.textContent = '';
      }
    }

    if (btnNext) {
      const currentLevel = currentRound ? currentRound.level : 1;
      const nextLevel = currentLevel + 1;
      // Invariante de MVP: nunca ofrecer un Nivel 5
      if (nextLevel <= MAX_LEVEL && isLevelUnlocked(nextLevel, progressionState.highestUnlockedLevel) && summary && summary.firstAttemptSuccesses >= 3) {
        btnNext.hidden = false;
        btnNext.textContent = `Jugar Nivel ${nextLevel}`;
      } else {
        btnNext.hidden = true;
      }
    }
  }

  /**
   * Conmuta el estado de sonido y actualiza el botón de la cabecera
   */
  function toggleSound() {
    const isEnabled = guide.toggleSound();
    progressionState.soundEnabled = isEnabled;
    const saveRes = saveProgressionState(progressionState);
    if (!saveRes.success && saveRes.warning) {
      progressionLoadResult.warning = saveRes.warning;
      updateLevelsView();
    }
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
   * Inicializa los escuchadores de eventos del shell y las cuatro vistas
   */
  function initApp() {
    // Sincronizar estado inicial del botón de sonido según preferencia persistida
    guide.setSoundEnabled(progressionState.soundEnabled);
    syncSoundToggleButton(guide.isSoundEnabled());

    // Actualizar visualmente la disponibilidad de los niveles
    updateLevelsView();

    // 1. Navegación desde Inicio
    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        startNewRound(progressionState.highestUnlockedLevel);
        navigateTo('aprende', { speak: true });
      });
    }

    // Handlers unificados de niveles 1..4 (reemplazan el handler estático exclusivo del Nivel 1)
    LEVELS_CATALOG.forEach((item) => {
      const btn = document.getElementById(`btn-level-${item.level}`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (!isLevelUnlocked(item.level, progressionState.highestUnlockedLevel)) {
            return;
          }
          guide.notifyUserGesture();
          guide.playEffect('clic');
          startNewRound(item.level);
          navigateTo('aprende', { speak: true });
        });
      }
    });

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
    const btnJuegoContinue = document.getElementById('btn-juego-continue');
    if (btnJuegoContinue) {
      btnJuegoContinue.addEventListener('click', handleContinueClick);
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

    // 4. Navegación desde Fin de ronda
    const btnFinNext = document.getElementById('btn-fin-next');
    if (btnFinNext) {
      btnFinNext.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        const currentLevel = currentRound ? currentRound.level : 1;
        const nextLevel = currentLevel + 1;
        if (nextLevel <= MAX_LEVEL && isLevelUnlocked(nextLevel, progressionState.highestUnlockedLevel)) {
          startNewRound(nextLevel);
          navigateTo('aprende', { speak: true });
        }
      });
    }

    const btnFinRepeat = document.getElementById('btn-fin-repeat');
    if (btnFinRepeat) {
      btnFinRepeat.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        const nextLevel = currentRound ? currentRound.level : 1;
        startNewRound(nextLevel);
        navigateTo('aprende', { speak: true });
      });
    }

    const btnFinHome = document.getElementById('btn-fin-home');
    if (btnFinHome) {
      btnFinHome.addEventListener('click', () => {
        guide.notifyUserGesture();
        guide.playEffect('clic');
        updateLevelsView();
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
        updateLevelsView();
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
      AUDIO_ASSETS,
      startNewRound,
      getCurrentRound: () => currentRound,
      getAprendeModel: () => (currentRound ? currentRound.aprendeModel : null),
      getQuestionRound: () => (currentRound ? currentRound.questionRound : null),
      getCurrentQuestion: () => (currentRound && currentRound.questionRound ? currentRound.questionRound.questions[currentRound.questionRound.currentIndex] : null),
      renderCurrentQuestion,
      renderFinView,
      updateLevelsView,
      getProgressionState: () => ({ ...progressionState }),
      setHighestUnlockedLevel: (lvl) => {
        progressionState.highestUnlockedLevel = normalizeHighestUnlockedLevel(lvl);
        saveProgressionState(progressionState);
        updateLevelsView();
      },
      resetProgression: () => {
        progressionState = createInitialProgressionState();
        saveProgressionState(progressionState);
        updateLevelsView();
      },
      closeRoundProgression: (round) => closeRoundProgression(progressionState, round, typeof localStorage !== 'undefined' ? localStorage : null),
      LEVELS_CATALOG,
      isLevelUnlocked: (lvl) => isLevelUnlocked(lvl, progressionState.highestUnlockedLevel),
      setForcedRoundOptions: (opts) => {
        forcedRoundOptions = opts;
      },
      clearForcedRoundOptions: () => {
        forcedRoundOptions = null;
      },
      setAprendeFactors: (a, b) => {
        forcedAprendeFactors = { a, b };
        if (currentRound) {
          currentRound.a = a;
          currentRound.b = b;
          currentRound.aprendeModel = createAprendeModel(a, b);
          const container = document.getElementById('aprende-content');
          if (container && currentView === 'aprende') {
            renderAprende(container, currentRound.aprendeModel);
          }
        }
        return forcedAprendeFactors;
      },
      clearForcedAprendeFactors: () => {
        forcedAprendeFactors = null;
      }
    };
  }
})();
