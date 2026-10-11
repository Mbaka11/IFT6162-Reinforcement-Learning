import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { json, sha256 } from './course-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'https://github.com/Mbaka11/IFT6162-Reinforcement-Learning';
const RAW = 'https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main';
const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'Sources/import-manifest.json'), 'utf8'));
const generatedPaths = new Set(manifest.generated_files.map(entry => entry.path));
const folder = path.join(ROOT, 'ChatGPT', 'Uploads');
await fs.mkdir(folder, { recursive: true });

let index = '# IFT-6.2.rl — Index des documents de référence\n\n';
index += 'Livre : **Building Up RL: From Dynamics and Control to Learning**, de **Pierre-Luc Bacon**. Les 31 pages sont regroupées intégralement dans quatre documents, dans l’ordre de la barre latérale du site. Les regroupements ne sont pas de nouveaux chapitres.\n\n';
index += `- Site : https://pierrelucbacon.com/rlbook/\n- Sources originales : https://github.com/pierrelux/rlbook\n- Copie organisée : ${REPO}\n- Commit source : \`${manifest.source_commit}\`\n- Capture de navigation : ${manifest.navigation_retrieved_at}\n\n`;
index += 'Les documents sont des extractions textuelles du HTML publié, avec les formules LaTeX et les liens. Ils ne contiennent pas les pixels des images, les vidéos ni les applications interactives. Les références restent des liens : leur présence ne prouve pas qu’un assistant les a consultées.\n\n';
index += '| Nº | Section du livre | Chapitre | Document joint |\n|---|---|---|---|\n';
for (const [position, page] of manifest.pages.entries()) {
  const group = Math.floor(position / 8) + 1;
  const start = String((group - 1) * 8 + 1).padStart(2, '0');
  const end = String(Math.min(group * 8, manifest.pages.length)).padStart(2, '0');
  const file = `${String(group).padStart(2, '0')}-chapitres-${start}-a-${end}.md`;
  index += `| ${page.number} | ${page.groups.join(' / ') || 'Introduction et plan'} | ${page.title.replaceAll('|', '\\|')} | ${file} |\n`;
}
index += '\nPour citer un passage, utiliser le **numéro de chapitre**, son titre et sa section ; pas seulement le numéro du regroupement. La numérotation originale des huit notebooks est indépendante.\n';
await fs.writeFile(path.join(ROOT, 'ChatGPT', 'COURSE_INDEX.md'), index);

function absoluteLinks(markdown, page) {
  return markdown.replace(/(!?\[[^\]\n]*\]\()([^\s)]+)([^)]*\))/g, (match, prefix, target, suffix) => {
    if (target.startsWith('#') || /^[a-z][a-z0-9+.-]*:|^\/\//i.test(target)) return match;
    const [file, fragment] = target.split('#');
    const resolved = path.posix.normalize(path.posix.join('Content/Website', file));
    // Do not interpret [operator](state) in LaTeX as a relative Markdown link.
    if (!generatedPaths.has(resolved)) return match;
    const base = prefix.startsWith('!') ? RAW : `${REPO}/blob/main`;
    return `${prefix}${base}/${resolved}${fragment ? `#${fragment}` : ''}${suffix}`;
  });
}

const outputs = [];
for (let offset = 0; offset < manifest.pages.length; offset += 8) {
  const selected = manifest.pages.slice(offset, offset + 8);
  const number = String(offset / 8 + 1).padStart(2, '0');
  const first = selected[0].number;
  const last = selected.at(-1).number;
  const file = `${number}-chapitres-${first}-a-${last}.md`;
  let text = `# IFT-6.2.rl — Document ${number} — Chapitres ${first} à ${last}\n\n`;
  text += 'Texte pédagogique de Pierre-Luc Bacon ; copie organisée pour l’auto-apprentissage. Ce document contient les pages complètes extraites du site, sans résumé de remplacement. Consulter les titres « CHAPITRE NN » pour retrouver leur numéro exact.\n\n';
  if (offset === 0) text += `${index}\n\n---\n\n`;
  else text += `Sommaire général : ${REPO}/blob/main/ChatGPT/COURSE_INDEX.md\n\n`;
  for (const page of selected) {
    const original = await fs.readFile(path.join(ROOT, page.website_path), 'utf8');
    // Verify the input instead of repacking a locally truncated chapter silently.
    if (sha256(original) !== page.website_output_sha256) throw new Error(`Page Web modifiée: ${page.website_path}`);
    text += `\n\n---\n\n# CHAPITRE ${page.number} — ${page.title}\n\n`;
    text += `Section du livre : ${page.groups.join(' / ') || 'Introduction et plan de cours'}\n\n`;
    text += `Page originale : ${page.url}\n\nCopie organisée : ${REPO}/blob/main/${page.website_path}\n\n`;
    text += absoluteLinks(original, page);
  }
  await fs.writeFile(path.join(folder, file), text);
  outputs.push({ file: `ChatGPT/Uploads/${file}`, chapters: selected.map(page => page.number), bytes: Buffer.byteLength(text), sha256: sha256(text) });
}
await fs.writeFile(path.join(folder, 'manifest.json'), json({
  source_manifest_sha256: sha256(await fs.readFile(path.join(ROOT, 'Sources/import-manifest.json'))),
  chapter_count: manifest.chapter_count, files: outputs,
}));
console.log(`Préparé ${outputs.length} documents contenant les ${manifest.chapter_count} pages complètes. Aucun fichier envoyé à ChatGPT.`);
