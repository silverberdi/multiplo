import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import { decryptBackup, encryptBackup, parseEncryptionKey } from '../scripts/protect-d1-backup.mjs';

test('D1 backup encryption round-trips and does not expose plaintext', () => {
  const key = crypto.randomBytes(32);
  const plaintext = Buffer.from('CREATE TABLE private_metrics (value INTEGER);');
  const encrypted = encryptBackup(plaintext, key);
  assert.notEqual(encrypted.includes(plaintext), true);
  assert.deepEqual(decryptBackup(encrypted, key), plaintext);
});

test('D1 backup rejects tampering and the wrong encryption key', () => {
  const key = crypto.randomBytes(32);
  const encrypted = encryptBackup(Buffer.from('sensitive snapshot'), key);
  const tampered = Buffer.from(encrypted);
  tampered[tampered.length - 4] ^= 1;
  assert.throws(() => decryptBackup(tampered, key), /autenticar o descifrar/);
  assert.throws(() => decryptBackup(encrypted, crypto.randomBytes(32)), /autenticar o descifrar/);
});

test('backup encryption key must be canonical base64 for 32 bytes', () => {
  assert.equal(parseEncryptionKey(Buffer.alloc(32, 7).toString('base64')).length, 32);
  assert.throws(() => parseEncryptionKey('short'), /32 bytes/);
});
