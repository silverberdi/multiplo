import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = new Map(process.argv.slice(2).map((argument) => {
  const [key, ...value] = argument.replace(/^--/, '').split('=');
  return [key, value.join('=')];
}));
const month = args.get('month');
if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || '')) {
  throw new Error('Uso: node scripts/generate-monthly-report.mjs --month=YYYY-MM [--input=archivo.json] [--out-dir=directorio]');
}

const root = process.cwd();
const inputPath = path.resolve(root, args.get('input') || 'metrics/report/synthetic-fixture.json');
const outputDirectory = path.resolve(root, args.get('out-dir') || 'dist/metrics-report');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const start = `${month}-01`;
const endDate = new Date(`${start}T00:00:00.000Z`);
endDate.setUTCMonth(endDate.getUTCMonth() + 1);
const end = endDate.toISOString().slice(0, 10);
const extractedAt = data.extractedAtUtc;
if (!extractedAt || Number.isNaN(Date.parse(extractedAt))) throw new Error('extractedAtUtc debe ser una fecha UTC válida');

function isInPeriod(date) { return date >= start && date < end; }
function sum(rows, field) { return rows.reduce((total, row) => total + (Number(row[field]) || 0), 0); }
const daily = (data.daily || []).filter((row) => isInPeriod(row.date));
const operations = (data.operations || []).filter((row) => isInPeriod(row.date));
const questions = sum(daily, 'questionsAnswered');
const correct = sum(daily, 'firstAttemptCorrect');
const starts = sum(daily, 'roundsStarted');
const completed = sum(daily, 'roundsCompleted');
const trafficMatches = data.traffic?.periodStartUtc === start && data.traffic?.periodEndExclusiveUtc === end;
const d1Matches = data.periodStartUtc === start && data.periodEndExclusiveUtc === end;
const suppressionThreshold = 10;
const suppressedOperations = operations.map((row) => ({
  ...row,
  suppressed: Number(row.questionsAnswered) < suppressionThreshold
}));
const rows = [
  ['metric', 'value', 'denominator', 'note'],
  ['questions_answered', questions, '', 'Sumatoria D1; eventos falsificables'],
  ['first_attempt_accuracy', questions ? (correct / questions).toFixed(4) : 'Sin datos', questions, 'Σ firstAttemptCorrect / Σ questionsAnswered'],
  ['round_completion_by_event_date', starts ? (completed / starts).toFixed(4) : 'Sin datos', starts, 'Σ roundsCompleted / Σ roundsStarted; no es una cohorte'],
  ['practice_seconds', sum(daily, 'practiceSeconds'), '', 'Tiempo agregado; no promedio por jugador'],
  ['traffic_requests', data.traffic?.requests ?? 'Sin datos', '', trafficMatches ? 'Cloudflare export' : 'Ventana no comparable'],
  ['traffic_visits', data.traffic?.visits ?? 'Sin datos', '', 'Definición de Cloudflare; no equivale a niños únicos'],
  ['traffic_errors', data.traffic?.errors ?? 'Sin datos', data.traffic?.requests ?? '', 'Fuente/definición indicada por Cloudflare'],
  ['d1_window_complete', d1Matches ? 'sí' : 'no', `${data.periodStartUtc || 'desconocido'} a ${data.periodEndExclusiveUtc || 'desconocido'}`, 'Cobertura declarada por la extracción D1'],
  ['traffic_window_complete', trafficMatches ? 'sí' : 'no', `${data.traffic?.periodStartUtc || 'desconocido'} a ${data.traffic?.periodEndExclusiveUtc || 'desconocido'}`, 'Cobertura declarada por la exportación de Cloudflare'],
  ['estimated_cost_usd', data.traffic?.estimatedCostUsd ?? 'Sin datos', '', 'Importe reportado para la ventana; no habilita billing'],
  ['worker_errors', data.health?.workerErrors ?? 'Sin datos', data.health?.workerRequests ?? '', 'Fuente operativa aportada por operador'],
  ['d1_read_units', data.health?.d1ReadUnits ?? 'Sin datos', '', 'Cuota/uso reportado, no inferido de eventos'],
  ['d1_write_units', data.health?.d1WriteUnits ?? 'Sin datos', '', 'Cuota/uso reportado, no inferido de eventos'],
  ['d1_storage_bytes', data.health?.d1StorageBytes ?? 'Sin datos', '', 'Tamaño reportado por operador']
];
for (const row of suppressedOperations) {
  const errorRate = row.questionsAnswered ? (1 - row.firstAttemptCorrect / row.questionsAnswered) : null;
  rows.push([
    `operation_error_rate_${row.date}_table${row.table}_factor${row.factor}`,
    row.suppressed ? 'Suprimido' : (errorRate === null ? 'Sin datos' : errorRate.toFixed(4)),
    row.suppressed ? '<10 (suprimido)' : row.questionsAnswered,
    row.suppressed ? 'Celda inferior al umbral de eventos' : '1 - firstAttemptCorrect / questionsAnswered'
  ]);
}
const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n') + '\n';
const fmt = (value, denominator) => denominator ? `${(value / denominator * 100).toFixed(1)}%` : 'Sin datos';
const md = [
  `# Informe mensual Múltiplo: ${month} UTC`, '',
  `- Periodo: ${start} inclusive a ${end} exclusivo.`,
  `- Extraído: ${extractedAt}.`,
  `- Fuente: ${data.sourceLabel || 'entrada administrativa'}.`,
  `- Cobertura D1 declarada: ${d1Matches ? 'periodo completo' : `incompleta o sin fecha confiable (${data.periodStartUtc || 'desconocido'} a ${data.periodEndExclusiveUtc || 'desconocido'})`}.`,
  `- Traffic Analytics cubre el mismo periodo: ${trafficMatches ? 'sí' : 'no'}; se evita comparar ventanas distintas.`, '',
  '## Actividad agregada', '',
  `- Preguntas respondidas: ${questions}.`,
  `- Precisión de primer intento: ${questions ? fmt(correct, questions) : 'Sin datos'} (${correct}/${questions}).`,
  `- Rondas completadas por fecha de evento: ${starts ? fmt(completed, starts) : 'Sin datos'} (${completed}/${starts}); puede superar 100% si los eventos cruzan ventanas y no es una tasa de cohorte.`,
  `- Tiempo de práctica: ${sum(daily, 'practiceSeconds')} segundos acumulados; no representa un promedio por jugador.`, '',
  '## Tráfico, salud y costo', '',
  `- Requests: ${data.traffic?.requests ?? 'Sin datos'}; visitas: ${data.traffic?.visits ?? 'Sin datos'}; errores: ${data.traffic?.errors ?? 'Sin datos'}. Las definiciones corresponden a Cloudflare y no identifican niños únicos.`,
  `- Costo reportado: ${data.traffic?.estimatedCostUsd ?? 'Sin datos'} USD; no se infiere ni habilita facturación.`,
  `- Worker: ${data.health?.workerErrors ?? 'Sin datos'} errores / ${data.health?.workerRequests ?? 'Sin datos'} requests. D1: ${data.health?.d1ReadUnits ?? 'Sin datos'} unidades de lectura, ${data.health?.d1WriteUnits ?? 'Sin datos'} de escritura y ${data.health?.d1StorageBytes ?? 'Sin datos'} bytes.`, '',
  '## Desgloses por operación', '',
  '| Fecha | Tabla | Factor | Respondidas | Primer intento | Error | Resultado |',
  '|---|---:|---:|---:|---:|---:|---|',
  ...suppressedOperations.map((row) => `| ${row.date} | ${row.table} | ${row.factor} | ${row.suppressed ? '<10 (suprimido)' : row.questionsAnswered} | ${row.suppressed ? 'suprimido' : row.firstAttemptCorrect} | ${row.suppressed || !row.questionsAnswered ? 'suprimido' : `${((1 - row.firstAttemptCorrect / row.questionsAnswered) * 100).toFixed(1)}%`} | ${row.suppressed ? 'celda suprimida' : 'eventos agregados'} |`),
  ...(suppressedOperations.length ? [] : ['| Sin datos | — | — | — | — | — | Sin actividad en el periodo |']), '',
  `La supresión aplica a celdas con menos de ${suppressionThreshold} eventos; reduce granularidad, no demuestra anonimato ni representa personas únicas.`,
  'Los eventos pueden repetirse, perderse o falsificarse. No prueban identidad, retención individual ni efecto causal educativo.',
  'Datos sintéticos: no usar como medición real.'
].join('\n') + '\n';

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, `${month}-multiplo.csv`), csv);
fs.writeFileSync(path.join(outputDirectory, `${month}-multiplo.md`), md);
console.log(`Informe ${month} creado en ${path.relative(root, outputDirectory)}; origen: ${path.relative(root, inputPath)}`);

if (import.meta.url === pathToFileURL(process.argv[1]).href && !daily.length && !operations.length) {
  console.log('El periodo no tiene datos: el informe indica Sin datos y conserva denominadores cero.');
}
