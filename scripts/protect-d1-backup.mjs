import crypto from 'node:crypto';
import fs from 'node:fs';

export function parseEncryptionKey(value = process.env.D1_BACKUP_ENCRYPTION_KEY) {
  if (typeof value !== 'string' || !value) throw new Error('Falta D1_BACKUP_ENCRYPTION_KEY');
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32 || key.toString('base64') !== value) {
    throw new Error('D1_BACKUP_ENCRYPTION_KEY debe ser una clave base64 de 32 bytes');
  }
  return key;
}

export function encryptBackup(plaintext, key = parseEncryptionKey()) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.from(JSON.stringify({
    version: 1,
    algorithm: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64')
  }) + '\n');
}

export function decryptBackup(envelopeBytes, key = parseEncryptionKey()) {
  let envelope;
  try { envelope = JSON.parse(envelopeBytes.toString('utf8')); }
  catch { throw new Error('El respaldo cifrado no es JSON válido'); }
  if (envelope?.version !== 1 || envelope?.algorithm !== 'aes-256-gcm') {
    throw new Error('Formato de respaldo cifrado no compatible');
  }
  const iv = Buffer.from(envelope.iv || '', 'base64');
  const tag = Buffer.from(envelope.tag || '', 'base64');
  const ciphertext = Buffer.from(envelope.ciphertext || '', 'base64');
  if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) {
    throw new Error('Contenido de respaldo cifrado inválido');
  }
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error('No se pudo autenticar o descifrar el respaldo D1');
  }
}

const [operation, input, output] = process.argv.slice(2);
if (operation) {
  if (!['encrypt', 'decrypt'].includes(operation) || !input || !output || process.argv.length !== 5) {
    console.error('Uso: node scripts/protect-d1-backup.mjs <encrypt|decrypt> <entrada> <salida>');
    process.exitCode = 2;
  } else {
    try {
      const key = parseEncryptionKey();
      const source = fs.readFileSync(input);
      const result = operation === 'encrypt' ? encryptBackup(source, key) : decryptBackup(source, key);
      fs.writeFileSync(output, result, { mode: 0o600 });
      console.log(operation === 'encrypt' ? 'Respaldo cifrado y autenticado.' : 'Respaldo descifrado y autenticado.');
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
