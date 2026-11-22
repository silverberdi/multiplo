import fs from 'node:fs';
import path from 'node:path';

const required = [
  'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_ZONE_ID', 'METRICS_DATABASE_ID',
  'METRICS_RATE_LIMIT_NAMESPACE'
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Falta la variable protegida ${name}`);
}

const hexId = /^[a-f0-9]{32}$/i;
for (const name of ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_ZONE_ID']) {
  if (!hexId.test(process.env[name])) throw new Error(`${name} debe ser un ID hexadecimal de 32 caracteres`);
}
if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(process.env.METRICS_DATABASE_ID)) {
  throw new Error('METRICS_DATABASE_ID debe ser un UUID válido de Cloudflare D1');
}
if (!/^\d+$/.test(process.env.METRICS_RATE_LIMIT_NAMESPACE)) {
  throw new Error('METRICS_RATE_LIMIT_NAMESPACE debe ser numérico');
}
const ingestionEnabled = process.env.METRICS_INGEST_ENABLED ?? 'false';
if (ingestionEnabled !== 'true' && ingestionEnabled !== 'false') {
  throw new Error('METRICS_INGEST_ENABLED solo puede ser true o false');
}

const config = {
  $schema: '../node_modules/wrangler/config-schema.json',
  name: 'multiplo-metrics-production',
  main: '../metrics/src/index.js',
  compatibility_date: '2026-11-10',
  account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
  workers_dev: false,
  routes: [{ pattern: 'multiplo.silverman.pro/api/metrics*', zone_id: process.env.CLOUDFLARE_ZONE_ID }],
  vars: {
    METRICS_INGEST_ENABLED: ingestionEnabled,
    METRICS_ALLOWED_HOST: 'multiplo.silverman.pro'
  },
  d1_databases: [{
    binding: 'DB',
    database_name: 'multiplo-metrics-production',
    database_id: process.env.METRICS_DATABASE_ID,
    migrations_dir: '../metrics/migrations'
  }],
  ratelimits: [{
    name: 'METRICS_RATE_LIMITER',
    namespace_id: process.env.METRICS_RATE_LIMIT_NAMESPACE,
    simple: { limit: 120, period: 60 }
  }]
};

const outputDirectory = path.resolve('.wrangler');
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'metrics-production.jsonc'), `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
console.log(`Configuración protegida creada; ingesta ${ingestionEnabled === 'true' ? 'habilitada por entrada explícita del workflow' : 'deshabilitada'}.`);
