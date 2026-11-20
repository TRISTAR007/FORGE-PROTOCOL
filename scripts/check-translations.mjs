// Checks every src/messages/*.json against en.json: missing keys, extra keys,
// and {placeholders} that don't match. Run: node scripts/check-translations.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'messages');
const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, String(v)]]
  );
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

const en = new Map(flatten(JSON.parse(readFileSync(join(dir, 'en.json'), 'utf8'))));
let problems = 0;

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'en.json')) {
  let data;
  try {
    data = new Map(flatten(JSON.parse(readFileSync(join(dir, file), 'utf8'))));
  } catch (e) {
    console.log(`${file}: INVALID JSON — ${e.message}`);
    problems++;
    continue;
  }
  const missing = [...en.keys()].filter((k) => !data.has(k));
  const extra = [...data.keys()].filter((k) => !en.has(k));
  const badPh = [...data.entries()].filter(([k, v]) => en.has(k) && placeholders(v) !== placeholders(en.get(k))).map(([k]) => k);
  const status = missing.length || extra.length || badPh.length ? 'PROBLEMS' : 'ok';
  console.log(`${file}: ${data.size}/${en.size} keys — ${status}`);
  if (missing.length) console.log('  missing:', missing.join(', '));
  if (extra.length) console.log('  extra:', extra.join(', '));
  if (badPh.length) console.log('  placeholder mismatch:', badPh.join(', '));
  problems += missing.length + extra.length + badPh.length;
}
process.exit(problems ? 1 : 0);
