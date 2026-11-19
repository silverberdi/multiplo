import fs from 'node:fs';

export function chromeExecutablePath() {
  const candidates = [
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  const executable = candidates.find((candidate) => candidate && fs.existsSync(candidate));
  if (!executable) throw new Error('No se encontró Chrome/Chromium; define CHROME_BIN para ejecutar las pruebas E2E.');
  return executable;
}
