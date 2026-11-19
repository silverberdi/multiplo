/** Catálogo liviano Fola. La manifest completa solo se prepara localmente. */
export const FOLA_RELEASE = 'assets-fola-v1.1.0';
export const FOLA_ZIP_URL = 'https://github.com/silverberdi/multiplo/releases/download/assets-fola-v1.1.0/multiplo-fola-v1.1.0-audios-490.zip';
export const FOLA_SHA256 = '202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929';
export const FOLA_BASE_PATH = 'assets/audio/fola';

const EVENT_CLIPS = Object.freeze({
  bienvenida: 'evento_bienvenida', bienvenidaRegreso: 'evento_bienvenida_regreso', invitarJugar: 'evento_invitar_jugar',
  elegirTabla: 'evento_elegir_tabla', nivelBloqueado: 'evento_nivel_bloqueado', comenzarRonda: 'evento_comenzar_ronda', mostrarGrupos: 'evento_mostrar_grupos',
  sumaRepetida: 'evento_suma_repetida', conectarMultiplicacion: 'evento_conectar_multiplicacion', continuar: 'evento_continuar',
  instruccionContar: 'evento_instruccion_contar', instruccionResultado: 'evento_instruccion_resultado', instruccionInversa: 'evento_instruccion_inversa',
  instruccionOpciones: 'evento_instruccion_opciones', tocarRespuesta: 'evento_tocar_respuesta', repetirAudio: 'evento_repetir_audio',
  ofrecerPista: 'evento_ofrecer_pista', pistaContar: 'evento_pista_contar', pistaPasoPaso: 'evento_pista_paso_paso',
  pistaTablasAltas: 'evento_pista_tablas_altas', ayudaReintentar: 'evento_ayuda_reintentar', ayudaOtroIntento: 'evento_ayuda_otro_intento',
  ayudaSinPrisa: 'evento_ayuda_sin_prisa', acierto: 'evento_acierto_01', acierto2: 'evento_acierto_02', acierto3: 'evento_acierto_03', acierto4: 'evento_acierto_04', acierto5: 'evento_acierto_05', acierto6: 'evento_acierto_06', premioEstrella: 'evento_premio_estrella', siguienteEjercicio: 'evento_siguiente_ejercicio',
  finRonda: 'evento_fin_ronda', nivelNuevo: 'evento_nivel_nuevo', refuerzoRonda: 'evento_refuerzo_ronda', repetirNivel: 'evento_repetir_nivel',
  despedida: 'evento_despedida', terminarTablaDiez: 'evento_terminar_tabla_diez'
});

export const FOLA_APPLICATION_IDS = Object.freeze([
  ...Object.values(EVENT_CLIPS),
  ...Array.from({ length: 4 }, (_, index) => `intro_tabla_0${index + 2}`),
  ...['pregunta', 'explicacion', 'operacion'].flatMap((kind) =>
    Array.from({ length: 4 }, (_, a) => Array.from({ length: 5 }, (_, b) => `${kind}_${String(a + 2).padStart(2, '0')}x${String(b + 1).padStart(2, '0')}`)).flat()
  ),
  ...Array.from({ length: 25 }, (_, index) => `numero_${String(index + 1).padStart(3, '0')}`)
]);

const NUMBERS = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve','treinta','treinta y uno','treinta y dos','treinta y tres','treinta y cuatro','treinta y cinco','treinta y seis','treinta y siete','treinta y ocho','treinta y nueve','cuarenta','cuarenta y uno','cuarenta y dos','cuarenta y tres','cuarenta y cuatro','cuarenta y cinco','cuarenta y seis','cuarenta y siete','cuarenta y ocho','cuarenta y nueve','cincuenta','cincuenta y uno','cincuenta y dos','cincuenta y tres','cincuenta y cuatro','cincuenta y cinco','cincuenta y seis','cincuenta y siete','cincuenta y ocho','cincuenta y nueve','sesenta','sesenta y uno','sesenta y dos','sesenta y tres','sesenta y cuatro','sesenta y cinco','sesenta y seis','sesenta y siete','sesenta y ocho','sesenta y nueve','setenta','setenta y uno','setenta y dos','setenta y tres','setenta y cuatro','setenta y cinco','setenta y seis','setenta y siete','setenta y ocho','setenta y nueve','ochenta','ochenta y uno','ochenta y dos','ochenta y tres','ochenta y cuatro','ochenta y cinco','ochenta y seis','ochenta y siete','ochenta y ocho','ochenta y nueve','noventa','noventa y uno','noventa y dos','noventa y tres','noventa y cuatro','noventa y cinco','noventa y seis','noventa y siete','noventa y ocho','noventa y nueve','cien'];

export function numberWord(n) { return NUMBERS[n] || String(n); }
export function clipFile(id) {
  let index = null;
  const eventIndex = Object.values(EVENT_CLIPS).indexOf(id) + 1;
  if (eventIndex > 0) index = eventIndex;
  let m = /^(intro_tabla)_(\d+)$/.exec(id);
  if (m) index = 37 + Number(m[2]);
  for (const [prefix, start] of [['pregunta', 48], ['explicacion', 148], ['operacion', 248]]) {
    m = new RegExp(`^${prefix}_(\\d+)x(\\d+)$`).exec(id);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (a >= 1 && a <= 10 && b >= 1 && b <= 10) index = start + (a - 1) * 10 + b - 1;
    }
  }
  m = /^inversa_(\d+)$/.exec(id);
  if (m) {
    const products = [1,2,3,4,5,6,7,8,9,10,12,14,15,16,18,20,21,24,25,27,28,30,32,35,36,40,42,45,48,49,50,54,56,60,63,64,70,72,80,81,90,100];
    const inverseIndex = products.indexOf(Number(m[1]));
    if (inverseIndex >= 0) index = 348 + inverseIndex;
  }
  m = /^numero_(\d+)$/.exec(id);
  if (m && Number(m[1]) >= 0 && Number(m[1]) <= 100) index = 390 + Number(m[1]);
  if (!Number.isInteger(index)) return null;
  const canonicalId = id.replace(/^(inversa|numero)_(\d+)$/, (_, prefix, value) => `${prefix}_${String(Number(value)).padStart(3, '0')}`);
  return `${FOLA_BASE_PATH}/audios/${String(index).padStart(2, '0')}_${canonicalId}.wav`;
}

function operationId(kind, a, b) {
  return `${kind}_${String(a).padStart(2, '0')}x${String(b).padStart(2, '0')}`;
}

export function selectFolaClip(event, context = {}, options = {}) {
  const { a, b, producto } = context;
  let id = options.clipId || EVENT_CLIPS[event];
  if (!id && ['aprende', 'explicacion'].includes(event)) id = operationId('explicacion', a, b);
  if (!id && ['pregunta', 'preguntaResultado'].includes(event)) id = operationId('pregunta', a, b);
  if (!id && ['alternativa', 'operacion'].includes(event)) id = operationId('operacion', a, b);
  if (!id && ['inversa', 'preguntaInversa'].includes(event)) id = `inversa_${String(producto).padStart(3, '0')}`;
  if (!id && event === 'numero') id = `numero_${String(context.numero ?? producto).padStart(3, '0')}`;
  if (!id && event === 'tabla') id = `intro_tabla_${String(a).padStart(2, '0')}`;
  if (!id) return null;

  if (Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(producto) && a * b !== producto) return null;

  if (['aprende', 'explicacion', 'pregunta', 'preguntaResultado', 'alternativa', 'operacion'].includes(event)) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 1 || a > 10 || b > 10) return null;
  }
  if (['inversa', 'preguntaInversa'].includes(event) && (!Number.isInteger(producto) || producto < 1 || producto > 100)) return null;
  const file = clipFile(id);
  if (!file) return null;
  if (options.expectedText && !isMathTextCompatible(options.expectedText, { a, b, producto })) return null;
  return Object.freeze({ id, file, expectedText: options.expectedText || null, event, context: { a, b, producto } });
}

export function isMathTextCompatible(text, { a, b, producto } = {}) {
  if (!text) return false;
  const normalized = text.toLocaleLowerCase('es');
  if (Number.isInteger(a) && Number.isInteger(b)) {
    const expected = `${numberWord(a)} por ${numberWord(b)}`;
    const operation = new RegExp(`\\b${a}\\s*[×x]\\s*${b}\\b`);
    if (normalized.includes('por') && !normalized.includes(expected)) return false;
    const groupMatch = normalized.match(/(\d+|[a-záéíóúüñ ]+)\s+grupos?\s+de\s+(\d+|[a-záéíóúüñ ]+)/);
    if (groupMatch) {
      const count = parseNumberWord(groupMatch[1]);
      const size = parseNumberWord(groupMatch[2]);
      if (count !== a || size !== b) return false;
    }
    if (normalized.includes(expected) || operation.test(normalized)) return true;
  }
  if (Number.isInteger(producto) && normalized.includes('da')) return normalized.includes(numberWord(producto));
  return true;
}

function parseNumberWord(value) {
  const trimmed = value.trim();
  const numeric = Number(trimmed);
  if (Number.isInteger(numeric)) return numeric;
  return NUMBERS.indexOf(trimmed);
}

export { EVENT_CLIPS };
