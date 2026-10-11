import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';
import { parse as parseYaml } from 'yaml';
import { sha256, normalizeText, safeRelative, orderedPages, expandMacros } from './course-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const absolute = file => path.join(ROOT, safeRelative(file));
const read = file => fs.readFile(absolute(file), 'utf8');
const manifest = JSON.parse(await read('Sources/import-manifest.json'));
const navigation = JSON.parse(await read('Sources/navigation.json'));
const config = parseYaml(await read('ebook/myst.yml'));
const commit = execFileSync('git', ['-C', path.join(ROOT, 'ebook'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
check(commit === manifest.source_commit, 'Le commit ebook diffère du manifeste.');
check(navigation.source_commit === commit, 'Le commit de navigation diffère du clone.');
const reconstructed = orderedPages({
  title: config.project.title, toc: navigation.toc,
  pages: navigation.pages.slice(1).flatMap((page, index, all) => {
    const previousGroup = index === 0 ? '' : all[index - 1].groups.join('/');
    return [
      ...(page.groups.length && previousGroup !== page.groups.join('/') ? [{ title: page.groups[0], level: 1 }] : []),
      { ...page, level: page.groups.length ? 2 : 1 },
    ];
  }),
}, config.project.toc);
check(reconstructed.length === manifest.chapter_count, 'Nombre de chapitres incohérent.');
check(JSON.stringify(reconstructed) === JSON.stringify(navigation.pages), 'La navigation ne correspond pas à la numérotation.');
check(manifest.pages.length === manifest.chapter_count, 'Le manifeste ne contient pas tous les chapitres.');

for (const entry of manifest.generated_files) {
  try {
    const body = await fs.readFile(absolute(entry.path));
    check(body.length === entry.bytes && sha256(body) === entry.sha256, `Fichier généré modifié ou tronqué: ${entry.path}`);
    check(body.length < 100 * 1024 * 1024, `Fichier trop volumineux pour GitHub: ${entry.path}`);
  } catch (error) { errors.push(`Fichier généré introuvable: ${entry.path}: ${error.message}`); }
}

function proseOnly(markdown) {
  const result = [];
  let fence = null;
  let math = false;
  for (const line of normalizeText(markdown).split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      continue;
    }
    if (fence) continue;
    const dollars = [...line.matchAll(/(?<!\\)\$\$/g)].length;
    const isMath = math || dollars > 0;
    if (dollars % 2 === 1) math = !math;
    if (isMath) continue;
    result.push(line.replace(/(?<!\\)\$(?:\\.|[^$\\])*(?<!\\)\$|(?<ticks>`+)[\s\S]*?\k<ticks>/g, ''));
  }
  return result.join('\n');
}

const markdownFiles = [];
async function discover(directory = '') {
  for (const entry of await fs.readdir(path.join(ROOT, directory), { withFileTypes: true })) {
    if (['.git', '.cache', 'node_modules', 'ebook', 'private', 'Assets'].includes(entry.name)) continue;
    const file = directory ? `${directory}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await discover(file);
    else if (entry.name.endsWith('.md')) markdownFiles.push(file);
  }
}
await discover();
const documentCache = new Map();
async function document(file) {
  if (!documentCache.has(file)) documentCache.set(file, await read(file));
  return documentCache.get(file);
}
let localLinks = 0;
for (const file of markdownFiles) {
  const prose = proseOnly(await document(file));
  for (const match of prose.matchAll(/!?\[[^\]\n]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+"[^"]*")?\)/g)) {
    const raw = match[1] ?? match[2];
    if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(raw)) continue;
    const [target, fragment] = raw.split('#');
    const local = target ? path.posix.normalize(path.posix.join(path.posix.dirname(file), decodeURIComponent(target.split('?')[0]))) : file;
    try {
      await fs.access(absolute(local));
      localLinks++;
      if (fragment && local.startsWith('Content/Website/') && local.endsWith('.md')) {
        const content = await document(local);
        const id = decodeURIComponent(fragment);
        check(content.includes(`<a id="${id}"></a>`), `Ancre Web absente: ${file} → ${raw}`);
      }
    } catch { errors.push(`Lien local cassé: ${file} → ${raw}`); }
  }
}

let mathCount = 0;
let checkedCachedPages = 0;
for (const [index, page] of manifest.pages.entries()) {
  const number = String(index + 1).padStart(2, '0');
  check(page.number === number && page.filename.startsWith(`${number}-`), `Numéro incorrect: ${page.filename}`);
  const source = normalizeText(await read(`ebook/${page.source_file}`));
  check(sha256(source) === page.source_sha256, `Source originale modifiée: ${page.source_file}`);
  const web = await document(page.website_path);
  check(web.includes(`# ${page.website_title}`), `Titre manquant: ${page.website_path}`);
  check((proseOnly(web).match(/^#{1,6}\s/gm) ?? []).length === page.heading_count, `Sections perdues: ${page.website_path}`);
  mathCount += page.math_count;
  try {
    const html = await read(page.cache_file);
    checkedCachedPages++;
    check(sha256(html) === page.website_html_sha256, `Cache HTML modifié: ${page.cache_file}`);
    const $ = load(html);
    const article = $('article.content').first();
    article.find('script, style, nav, button, .sr-only, .myst-fm-block-header, .myst-fm-authors-affiliations').remove();
    const annotations = article.find('annotation[encoding="application/x-tex"]');
    check(annotations.length === page.math_count, `Nombre de formules incorrect: ${page.website_path}`);
    const formulas = new Map();
    annotations.each((_, node) => {
      const latex = expandMacros($(node).text(), config.project.math).trim();
      const display = $(node).parents('.katex-display').length > 0;
      const token = display ? `$$\n${latex}\n$$` : `$${latex}$`;
      formulas.set(token, (formulas.get(token) ?? 0) + 1);
    });
    // Markdown list nesting adds indentation; compare LaTeX tokens independent
    // of whitespace while still checking every symbol and macro expansion.
    const mathText = web.replace(/\s+/g, ' ');
    for (const [token, expectedCount] of formulas) {
      check(mathText.split(token.replace(/\s+/g, ' ')).length - 1 >= expectedCount, `Formule absente ou altérée: ${page.website_path}: ${token.slice(0, 110)}`);
    }
    check(article.find('img').length === page.image_count, `Images perdues: ${page.website_path}`);
  } catch (error) {
    // Caches are intentionally not shipped: checks still work on a fresh clone.
    if (error.code !== 'ENOENT') throw error;
  }
}
for (const directory of ['Content', 'Content/Website']) {
  const names = (await fs.readdir(absolute(directory))).filter(file => /^\d+-.*\.md$/.test(file)).sort();
  check(JSON.stringify(names) === JSON.stringify(manifest.pages.map(page => page.filename)), `Pages manquantes ou obsolètes dans ${directory}.`);
}
for (const notebook of manifest.notebooks) {
  const parsed = JSON.parse(await read(notebook));
  check(parsed.nbformat === 4 && parsed.cells.length > 0, `Notebook invalide: ${notebook}`);
}
const pdf = await fs.readFile(absolute('Resources/rlbook.pdf'));
check(pdf.subarray(0, 5).toString() === '%PDF-', 'Le PDF du livre est invalide.');
const packs = JSON.parse(await read('ChatGPT/Uploads/manifest.json'));
check(packs.source_manifest_sha256 === sha256(await fs.readFile(absolute('Sources/import-manifest.json'))), 'Les fichiers ChatGPT doivent être régénérés.');
check(JSON.stringify(packs.files.flatMap(file => file.chapters)) === JSON.stringify(manifest.pages.map(page => page.number)), 'Les regroupements ChatGPT ne couvrent pas tous les chapitres dans l’ordre.');
for (const entry of packs.files) {
  const body = await fs.readFile(absolute(entry.file));
  check(sha256(body) === entry.sha256 && body.length === entry.bytes, `Document ChatGPT altéré: ${entry.file}`);
  for (const number of entry.chapters) check(body.toString().includes(`# CHAPITRE ${number} —`), `Chapitre ${number} absent de ${entry.file}.`);
}
const prompt = await read('ChatGPT/SYSTEM_PROMPT.md');
check(prompt.length > 0 && prompt.length <= 8000, 'Les instructions du projet doivent rester sous 8000 caractères.');

if (errors.length) {
  console.error(`ÉCHEC — ${errors.length} problème(s):\n${errors.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`OK — ${manifest.chapter_count} chapitres × 2 versions, ${manifest.generated_files.length} fichiers intègres, ${localLinks} liens locaux, ${mathCount} formules et ${manifest.notebooks.length} notebooks.`);
  console.log(`Contrôle du HTML archivé : ${checkedCachedPages}/${manifest.chapter_count} pages (cache local facultatif).`);
  console.log(`ChatGPT : ${packs.files.length} documents complets, prompt de ${prompt.length} caractères.`);
}
