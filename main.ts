import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function outputDirectory(): string {
  const configured = process.env.MAKEFUN_OUTPUT_DIR;
  return configured === undefined ? '/output' : configured;
}

function copyTree(source: string, destination: string): void {
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) copyFileSync(from, to);
    else throw new Error(`Cannot package unsupported entry: ${from}`);
  }
}

const projectDirectory = dirname(fileURLToPath(import.meta.url));
const destination = outputDirectory();

try {
  copyTree(join(projectDirectory, 'app'), join(destination, 'app'));
  copyTree(join(projectDirectory, 'screenshots'), join(destination, 'screenshots'));
  writeFileSync(join(destination, 'dossier.json'), buildDossier(destination, DOSSIER_CAPS));
} catch (cause) {
  const detail = cause instanceof Error ? cause.message : String(cause);
  throw new Error(`Submission assembly failed for ${destination}: ${detail}`, { cause });
}
