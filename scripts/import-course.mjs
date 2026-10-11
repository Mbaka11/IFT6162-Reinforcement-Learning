import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';
import { parse as parseYaml } from 'yaml';
import {
  SITE, REPOSITORY, sha256, normalizeText, json, parseSite, orderedPages,
  safeRelative, pageLink, notebookMarkdown, withProvenance, convertArticle, mapOutsideInlineLiterals,
} from './course-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, '.cache', 'rlbook');
const flags = new Set(process.argv.slice(2));
if (flags.has('--help')) {
  console.log('Usage: npm run import -- [--offline | --refresh]\nSans option: utilise le cache, télécharge les ressources manquantes.\n--offline: aucun accès réseau. --refresh: relit le site, sans modifier ebook.');
  process.exit(0);
}
if ([...flags].some(flag => !['--offline', '--refresh'].includes(flag)) || (flags.has('--offline') && flags.has('--refresh'))) {
  throw new Error('Options invalides. Utiliser --help.');
}
const offline = flags.has('--offline');
const refresh = flags.has('--refresh');
const generated = new Map();
const assets = new Map();
const assetPromises = new Map();
const absolute = file => path.join(ROOT, safeRelative(file));

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}
async function save(file, value) {
  const target = absolute(file);
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  await fs.mkdir(path.dirname(target), { recursive: true });
  if (!await exists(target) || !buffer.equals(await fs.readFile(target))) await fs.writeFile(target, buffer);
  generated.set(file, { path: file, sha256: sha256(buffer), bytes: buffer.length });
}

async function fetchCached(url, name, maxBytes = 20 * 1024 * 1024) {
  await fs.mkdir(CACHE, { recursive: true });
  const bodyFile = path.join(CACHE, safeRelative(name));
  const metaFile = `${bodyFile}.json`;
  if (!refresh && await exists(bodyFile) && await exists(metaFile)) {
    const body = await fs.readFile(bodyFile);
    const meta = JSON.parse(await fs.readFile(metaFile, 'utf8'));
    if (meta.url !== url || meta.sha256 !== sha256(body)) throw new Error(`Cache incohérent: ${name}`);
    return { body, meta };
  }
  if (offline) throw new Error(`Ressource absente du cache hors ligne: ${url}`);
  let failure;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(90_000),
        headers: { 'User-Agent': 'IFT6162-course-archive/1.0 (+https://github.com/Mbaka11/IFT6162-Reinforcement-Learning)' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      if (Number(response.headers.get('content-length')) > maxBytes) throw new Error(`Ressource trop volumineuse: ${url}`);
      const chunks = [];
      let bytes = 0;
      for await (const chunk of response.body) {
        bytes += chunk.length;
        if (bytes > maxBytes) throw new Error(`Ressource trop volumineuse: ${url}`);
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks);
      const meta = {
        url, final_url: response.url, retrieved_at: new Date().toISOString(),
        content_type: response.headers.get('content-type'), sha256: sha256(body), bytes,
      };
      await fs.writeFile(bodyFile, body);
      await fs.writeFile(metaFile, json(meta));
      return { body, meta };
    } catch (error) {
      failure = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw failure;
}

async function websiteAsset(url, preferredPath) {
  const canonical = new URL(url, SITE);
  canonical.hash = '';
  const key = canonical.href;
  if (assetPromises.has(key)) return assetPromises.get(key);
  const promise = (async () => {
    const filename = decodeURIComponent(path.posix.basename(canonical.pathname)).replace(/[^a-zA-Z0-9._-]/g, '-');
    const local = preferredPath ?? `Content/Assets/Website/${sha256(key).slice(0, 10)}-${filename}`;
    const fetched = await fetchCached(key, `asset-${sha256(key)}.data`, 50 * 1024 * 1024);
    if (fetched.meta.content_type?.includes('text/html')) throw new Error(`Une ressource statique est devenue une page HTML: ${key}`);
    await save(local, fetched.body);
    assets.set(key, { kind: 'website', path: local, ...fetched.meta });
    return local;
  })();
  assetPromises.set(key, promise);
  return promise;
}

async function asyncReplace(text, expression, replacement) {
  let result = '';
  let offset = 0;
  for (const match of text.matchAll(expression)) {
    result += text.slice(offset, match.index) + await replacement(match);
    offset = match.index + match[0].length;
  }
  return result + text.slice(offset);
}

const commit = execFileSync('git', ['-C', path.join(ROOT, 'ebook'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (execFileSync('git', ['-C', path.join(ROOT, 'ebook'), 'status', '--porcelain'], { encoding: 'utf8' }).trim()) {
  throw new Error('ebook contient des modifications locales. Préserver les sources avant de lancer un import.');
}
const localConfig = parseYaml(await fs.readFile(absolute('ebook/myst.yml'), 'utf8'));
const home = await fetchCached(SITE, '01-intro.html');
const site = parseSite(home.body.toString('utf8'));
const pages = orderedPages(site.project, localConfig.project.toc);
const bySource = new Map(pages.map(page => [page.source_file, page]));

async function sourceTarget(target, page, mode = 'link') {
  if (!target || target.startsWith('#') || /^(?:data:|mailto:|tel:)/.test(target)) return target;
  if (/^https?:\/\//.test(target)) return pageLink(target, page.url, pages) ?? target;
  const split = target.match(/^([^?#]*)(.*)$/);
  const file = safeRelative(path.posix.join(path.posix.dirname(page.source_file), decodeURIComponent(split[1])));
  const numbered = bySource.get(file);
  if (numbered) return `${numbered.filename}${split[2]}`;
  if (!await exists(absolute(`ebook/${file}`))) throw new Error(`Référence locale absente dans ${page.source_file}: ${target}`);
  if (/\.(?:png|jpe?g|svg|webp|gif|pdf)$/i.test(file) || mode === 'include') {
    const local = `Content/Assets/Source/${file}`;
    const body = await fs.readFile(absolute(`ebook/${file}`));
    await save(local, body);
    assets.set(`source:${file}`, { kind: 'source', source_file: file, path: local, sha256: sha256(body), bytes: body.length });
    return `${path.posix.relative('Content', local)}${split[2]}`;
  }
  return `${REPOSITORY}/blob/${commit}/${file}${split[2]}`;
}

async function rewriteSource(text, page) {
  const output = [];
  let fence = null;
  let displayMath = false;
  for (let line of text.split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
    if (marker) {
      if (!fence) {
        fence = marker[1];
        const directive = line.match(/^([`~]{3,}\{(?:figure|image|include|literalinclude)\}\s+)(\S+)(.*)$/);
        if (directive) line = `${directive[1]}${await sourceTarget(directive[2], page, 'include')}${directive[3]}`;
      } else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      output.push(line);
      continue;
    }
    if (!fence) {
      const mathDelimiters = [...line.matchAll(/(?<!\\)\$\$/g)].length;
      const mathLine = displayMath || mathDelimiters > 0 || /^\s*\\[\[\]]/.test(line);
      if (mathDelimiters % 2 === 1) displayMath = !displayMath;
      if (/^\s*\\\[/.test(line)) displayMath = true;
      if (/^\s*\\\]/.test(line)) displayMath = false;
      if (!mathLine) {
        line = await mapOutsideInlineLiterals(line, segment => asyncReplace(segment, /(!?\[[^\]\n]*\]\()([^\s)]+)([^)]*\))/g,
          async match => `${match[1]}${await sourceTarget(match[2], page)}${match[3]}`));
        line = await asyncReplace(line, /^(:{3,}\{(?:figure|image|include|literalinclude)\}\s+)(\S+)(.*)$/g,
          async match => `${match[1]}${await sourceTarget(match[2], page, 'include')}${match[3]}`);
        line = await asyncReplace(line, /(<img\b[^>]*\bsrc=")([^"]+)(")/gi,
          async match => `${match[1]}${await sourceTarget(match[2], page)}${match[3]}`);
      }
    }
    output.push(line);
  }
  return output.join('\n');
}

const manifestPages = [];
for (const page of pages) {
  console.log(`${page.number}/${pages.length} ${page.source_file}`);
  const source = normalizeText(await fs.readFile(absolute(`ebook/${page.source_file}`), 'utf8'));
  const markdown = page.source_file.endsWith('.ipynb') ? notebookMarkdown(JSON.parse(source)) : source;
  const sourceHeader = `> **Cours de Pierre-Luc Bacon — ${page.number}.** [Site](${page.url}) · [Source originale](${REPOSITORY}/blob/${commit}/${page.source_file}) · [Version Web extraite](Website/${page.filename})\n> Copie organisée des sources MyST ; les directives originales sont conservées. Ne pas modifier ce fichier généré : utiliser \`Notes/\`.\n`;
  const sourcePath = `Content/${page.filename}`;
  await save(sourcePath, withProvenance(await rewriteSource(markdown, page), sourceHeader));

  const fetched = page.number === '01' ? home : await fetchCached(page.url, `${page.number}-${page.slug}.html`);
  const html = fetched.body.toString('utf8');
  const $ = load(html);
  const article = $('article.content').first();
  if (!article.length) throw new Error(`Article manquant: ${page.url}`);
  const urls = new Map();
  const references = article.find('img[src], a[href]').toArray();
  for (const element of references) {
    const raw = $(element).attr(element.name === 'img' ? 'src' : 'href');
    if (!raw || raw.startsWith('#') || /^(?:data:|mailto:|tel:)/.test(raw)) continue;
    const localPage = pageLink(raw, page.url, pages);
    if (localPage) { urls.set(raw, localPage); continue; }
    const url = new URL(raw, page.url);
    const isOwnResource = url.origin === new URL(SITE).origin && url.pathname.startsWith('/rlbook/');
    if (isOwnResource && /\.(?:png|jpe?g|svg|webp|gif|pdf|csv|json|txt|ipynb)$/i.test(url.pathname)) {
      const file = await websiteAsset(url.href);
      urls.set(raw, path.posix.relative('Content/Website', file) + url.hash);
    } else urls.set(raw, url.href);
  }
  const rendered = convertArticle(html, {
    macros: site.project.math ?? localConfig.project.math,
    rewriteUrl: raw => raw.startsWith('#') ? raw : urls.get(raw) ?? raw,
  });
  const webHeader = `> **Cours de Pierre-Luc Bacon — ${page.number}.** [Page publiée](${page.url}) · [Source numérotée](../${page.filename})\n> Extraction HTML → Markdown, effectuée le ${fetched.meta.retrieved_at.slice(0, 10)}. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.\n\n`;
  const webPath = `Content/Website/${page.filename}`;
  await save(webPath, webHeader + rendered.markdown);
  manifestPages.push({
    ...page, source_path: sourcePath, website_path: webPath,
    source_sha256: sha256(source), website_html_sha256: fetched.meta.sha256,
    retrieved_at: fetched.meta.retrieved_at,
    cache_file: `.cache/rlbook/${page.number === '01' ? '01-intro' : `${page.number}-${page.slug}`}.html`,
    source_output_sha256: generated.get(sourcePath).sha256,
    website_output_sha256: generated.get(webPath).sha256,
    website_title: rendered.title, heading_count: rendered.heading_count,
    math_count: rendered.math_count, image_count: rendered.image_count,
  });
}

// Small useful supplements; large simulations and source code remain in ebook.
await save('Resources/references.bib', normalizeText(await fs.readFile(absolute('ebook/references.bib'), 'utf8')));
let labGuide = normalizeText(await fs.readFile(absolute('ebook/labs.md'), 'utf8'));
labGuide = labGuide.replaceAll('](lab/notebooks/', '](Notebooks/');
for (const page of pages.filter(item => item.source_file.endsWith('.md'))) {
  labGuide = labGuide.replaceAll(`](${page.source_file})`, `](../Content/Website/${page.filename})`);
}
await save('Resources/lab-guide.md', `> Guide de Pierre-Luc Bacon, copié depuis [labs.md](${REPOSITORY}/blob/${commit}/labs.md), avec les liens locaux adaptés. Exécuter les commandes du guide depuis \`ebook/\`.\n\n${labGuide}`);
const notebooks = (await fs.readdir(absolute('ebook/lab/notebooks'))).filter(file => file.endsWith('.ipynb')).sort();
for (const file of notebooks) {
  await save(`Resources/Notebooks/${file}`, normalizeText(await fs.readFile(absolute(`ebook/lab/notebooks/${file}`), 'utf8')));
}
const pdf = site.project.exports?.find(item => item.format === 'pdf' && item.url);
if (pdf) await websiteAsset(new URL(pdf.url, SITE).href, 'Resources/rlbook.pdf');

let index = '# Contenu du cours — ordre de lecture\n\n';
index += 'Ordre exact de la barre latérale du [livre en ligne](https://pierrelucbacon.com/rlbook/), vérifié contre `ebook/myst.yml`. Les titres de sections ne reçoivent pas de numéro : seuls les chapitres sont numérotés.\n\n';
index += '- **Sources** : textes MyST complets, liens de chapitres adaptés.\n- **Version Web** : Markdown lisible avec LaTeX et les figures produites par le site.\n- Ne pas fusionner automatiquement les deux versions : elles peuvent évoluer à des moments différents. Les originaux sont préservés dans `ebook/` et le cache HTML local.\n- Les macros MyST des sources sont définies dans `ebook/myst.yml` ; elles sont développées dans la version Web.\n\n';
let previousGroup = null;
for (const page of pages) {
  const group = page.groups.join(' / ') || 'Introduction et plan de cours';
  if (group !== previousGroup) {
    index += `\n## ${group}\n\n| Nº | Chapitre | Source | Version Web |\n|---|---|---|---|\n`;
    previousGroup = group;
  }
  index += `| ${page.number} | ${page.title.replaceAll('|', '\\|')} | [Markdown](${page.filename}) | [Lire](Website/${page.filename}) |\n`;
}
index += '\n## Ressources\n\n- [Notebooks, PDF et bibliographie](../Resources/README.md)\n- [Provenance et attribution](../Sources/README.md)\n- [Manifeste d’import](../Sources/import-manifest.json)\n';
await save('Content/README.md', index);
await save('Content/Website/README.md', '# Pages publiées extraites\n\nVoir le [sommaire complet](../README.md). Chaque page correspond à une page publiée, avec la même numérotation que les sources. Les copies sont complètes pour le texte rendu côté serveur ; les interactions JavaScript, vidéos distantes et laboratoires Web ne sont pas reproduits en Markdown. Les liens vers le site original restent disponibles.\n');
await save('Sources/navigation.json', json({
  site: SITE, retrieved_at: home.meta.retrieved_at, source_commit: commit,
  toc: site.project.toc,
  pages: pages.map(({ number, title, groups, source_file, slug, url, filename }) => ({ number, title, groups, source_file, slug, url, filename })),
}));

// Remove only stale files from the previous generated inventory, and only if unedited.
const manifestPath = absolute('Sources/import-manifest.json');
if (await exists(manifestPath)) {
  const previous = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  for (const entry of previous.generated_files ?? []) {
    if (generated.has(entry.path) || !await exists(absolute(entry.path))) continue;
    if (sha256(await fs.readFile(absolute(entry.path))) !== entry.sha256) {
      throw new Error(`Ancien fichier généré modifié, conservé: ${entry.path}. Le déplacer dans Notes avant de réimporter.`);
    }
    await fs.unlink(absolute(entry.path));
  }
}
const manifest = {
  schema_version: 1, site: SITE, repository: REPOSITORY, source_commit: commit,
  navigation_retrieved_at: home.meta.retrieved_at, chapter_count: pages.length,
  order_authority: 'Barre latérale MyST publiée (project.pages), contrôlée contre les deux tables des matières.',
  attribution: 'Pierre-Luc Bacon — Building Up RL: From Dynamics and Control to Learning',
  redistribution: 'Le propriétaire de ce dépôt indique que le professeur autorise cette copie. Aucune licence générale supplémentaire n’est accordée.',
  pages: manifestPages,
  assets: [...assets.values()].sort((a, b) => a.path.localeCompare(b.path)),
  notebooks: notebooks.map(file => `Resources/Notebooks/${file}`),
  generated_files: [...generated.values()].sort((a, b) => a.path.localeCompare(b.path)),
};
await fs.writeFile(manifestPath, json(manifest));
console.log(`Import terminé : ${pages.length} chapitres × 2 versions, ${assets.size} ressources, ${notebooks.length} notebooks.\nRegrouper avec npm run chatgpt:pack, puis vérifier avec npm run check et npm test.`);
