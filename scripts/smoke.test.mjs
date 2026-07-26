import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('prototype disclaimer component exists', () => {
  assert.ok(existsSync('src/components/PrototypeDisclaimer.astro'));
});
