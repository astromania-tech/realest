/**
 * embed-fonts-in-svgs.mjs
 *
 * Embeds the Neulis Neue Bold font as base64 inside each wordmark SVG.
 * Required because SVGs loaded via <img> are sandboxed from the page's
 * @font-face declarations — the font must be self-contained in the file.
 *
 * Usage: npx tsx scripts/embed-fonts-in-svgs.mjs
 *   (or: node scripts/embed-fonts-in-svgs.mjs)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Font file → @font-face declaration to inject
const FONTS = [
  {
    family: 'Neulis Neue',
    weight: 'bold',
    style: 'normal',
    file: path.join(ROOT, 'public/fonts/neulis/Neulis_Neue_Bold.otf'),
    format: 'opentype',
  },
];

// SVG files that reference external fonts
const SVG_FILES = [
  'public/realest-wordmark-dark.svg',
  'public/realest-wordmark-light.svg',
  'public/realest-logo-wordmark-dark.svg',
  'public/realest-logo-wordmark-light.svg',
];

function buildFontFaceBlock(fonts) {
  return fonts
    .map(({ family, weight, style, file, format }) => {
      const b64 = fs.readFileSync(file).toString('base64');
      return (
        `@font-face {\n` +
        `  font-family: '${family}';\n` +
        `  font-weight: ${weight};\n` +
        `  font-style: ${style};\n` +
        `  src: url('data:font/${format};base64,${b64}') format('${format}');\n` +
        `}`
      );
    })
    .join('\n');
}

function injectStyleIntoSvg(svgContent, styleBlock) {
  // If a <style> already exists inside <defs>, append to it
  if (/<defs[^>]*>[\s\S]*?<style[\s\S]*?<\/style>[\s\S]*?<\/defs>/i.test(svgContent)) {
    return svgContent.replace(
      /(<style[^>]*>)([\s\S]*?)(<\/style>)/i,
      (_, open, existing, close) => `${open}${existing}\n${styleBlock}${close}`,
    );
  }

  // If <defs> exists but is empty or has no <style>, inject inside it
  if (/<defs[^>]*\/>/.test(svgContent)) {
    // Self-closing <defs /> → replace with wrapping form
    return svgContent.replace(
      /<defs([^>]*)\s*\/>/i,
      `<defs$1><style>\n${styleBlock}\n</style></defs>`,
    );
  }
  if (/<defs[^>]*>/i.test(svgContent)) {
    return svgContent.replace(
      /(<defs[^>]*>)/i,
      `$1<style>\n${styleBlock}\n</style>`,
    );
  }

  // No <defs> at all — insert after opening <svg ...>
  return svgContent.replace(
    /(<svg[^>]*>)/i,
    `$1\n<defs><style>\n${styleBlock}\n</style></defs>`,
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

// Verify all font files exist before processing
for (const font of FONTS) {
  if (!fs.existsSync(font.file)) {
    console.error(`✗ Font not found: ${font.file}`);
    process.exit(1);
  }
}

console.log('Building @font-face block...');
const styleBlock = buildFontFaceBlock(FONTS);
console.log(`  → ${FONTS.length} font(s) encoded`);

let ok = 0;
let fail = 0;

for (const relative of SVG_FILES) {
  const svgPath = path.join(ROOT, relative);
  if (!fs.existsSync(svgPath)) {
    console.warn(`  ⚠ Skipped (not found): ${relative}`);
    continue;
  }
  try {
    const original = fs.readFileSync(svgPath, 'utf8');
    const modified = injectStyleIntoSvg(original, styleBlock);
    fs.writeFileSync(svgPath, modified, 'utf8');
    console.log(`  ✓ ${relative}`);
    ok++;
  } catch (err) {
    console.error(`  ✗ ${relative}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} updated, ${fail} failed.`);
if (fail > 0) process.exit(1);
