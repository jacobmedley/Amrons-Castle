// Copy a built client to the explicitly selected Genesis static directory.
// Does not restart services, change authentication, or remove existing files.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'dist', 'client');
if (!process.argv[2]) throw new Error('Pass the Genesis pipeline/src/genesis_pipeline/web/castle directory.');
const target = path.resolve(process.argv[2]);
if (!target.replaceAll('\\', '/').endsWith('/pipeline/src/genesis_pipeline/web/castle')) throw new Error('Unexpected dashboard destination.');
if (!existsSync(path.join(source, 'index.html'))) throw new Error('Build the client first.');
mkdirSync(path.join(target, 'assets'), { recursive: true });
const files = ['index.html', ...readdirSync(path.join(source, 'assets')).filter(name => !name.endsWith('-prompt.txt')).map(name => `assets/${name}`)];
for (const name of files.filter(name => name !== 'index.html')) cpSync(path.join(source, name), path.join(target, name));
// Switch the entry point only after all referenced assets exist.
cpSync(path.join(source, 'index.html'), path.join(target, 'index.html'));
writeFileSync(path.join(target, 'build-manifest.json'), JSON.stringify({ files: files.map(name => ({ name, sha256: createHash('sha256').update(readFileSync(path.join(source, name))).digest('hex') })) }, null, 2) + '\n');
console.log(`Installed ${files.length} client files. No service was restarted.`);
