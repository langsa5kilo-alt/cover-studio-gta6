import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const limits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000
};

function copyDirectory(source: string, target: string): void {
  mkdirSync(target, { recursive: true });
  for (const item of readdirSync(source, { withFileTypes: true })) {
    const sourcePath = join(source, item.name);
    const targetPath = join(target, item.name);
    if (item.isDirectory()) copyDirectory(sourcePath, targetPath);
    else if (item.isFile()) copyFileSync(sourcePath, targetPath);
    else throw new Error(`Unsupported package entry: ${sourcePath}`);
  }
}

function packageApp(): void {
  const projectRoot = dirname(fileURLToPath(import.meta.url));
  const outputRoot = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outputRoot, { recursive: true });
  copyDirectory(join(projectRoot, "app"), join(outputRoot, "app"));
  copyDirectory(join(projectRoot, "screenshots"), join(outputRoot, "screenshots"));
  const dossier = buildDossier(outputRoot, limits);
  writeFileSync(join(outputRoot, "dossier.json"), dossier);
}

packageApp();
