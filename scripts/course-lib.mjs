import { createHash } from 'node:crypto';
import path from 'node:path';
import { load } from 'cheerio';
import TurndownService from 'turndown';
import gfmPlugin from 'turndown-plugin-gfm';

export const SITE = 'https://pierrelucbacon.com/rlbook/';
export const REPOSITORY = 'https://github.com/pierrelux/rlbook';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const normalizeText = text => text.replace(/\r\n/g, '\n');
export const json = value => `${JSON.stringify(value, null, 2)}\n`;

// Parse data, never evaluate executable JavaScript from a downloaded page.
export function parseSite(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  const prefix = 'window.__remixContext =';
  const script = scripts.map(match => match[1].trim()).find(text => text.startsWith(prefix));
  if (!script) throw new Error('Les données de navigation MyST sont absentes du HTML.');
  const context = JSON.parse(script.slice(prefix.length).replace(/;\s*$/, '').trim());
  const loaders = context.state?.loaderData;
  const config = loaders?.root?.config;
  const project = config?.projects?.find(item => item.github === REPOSITORY);
  if (!project?.toc || !project?.pages) throw new Error('Projet RLBook ou navigation complète introuvable.');
  const route = Object.values(loaders).find(value => value?.page && value?.project);
  return { config, project, page: route?.page };
}

export function flattenToc(toc, parents = []) {
  return toc.flatMap(entry => {
    const groups = entry.title ? [...parents, entry.title] : parents;
    return [
      ...(entry.file ? [{ file: entry.file, groups: [...parents] }] : []),
      ...flattenToc(entry.children ?? [], groups),
    ];
  });
}

export function orderedPages(project, localToc) {
  const sourceToc = flattenToc(localToc);
  const publishedToc = flattenToc(project.toc);
  if (JSON.stringify(sourceToc) !== JSON.stringify(publishedToc)) {
    throw new Error('Le sommaire du clone diffère du site. Mettre ebook à jour explicitement avant l’import.');
  }
  const publishedPages = [];
  let group = [];
  for (const entry of project.pages) {
    if (!entry.slug) group = [entry.title];
    else publishedPages.push({ ...entry, groups: entry.level === 1 ? [] : [...group] });
  }
  if (sourceToc.length !== publishedPages.length + 1 || !sourceToc[0].file.endsWith('intro.md')) {
    throw new Error('La correspondance entre les fichiers sources et la barre latérale est ambiguë.');
  }
  return sourceToc.map((source, index) => {
    const sitePage = index === 0 ? { slug: '', title: project.title, groups: [] } : publishedPages[index - 1];
    if (JSON.stringify(source.groups) !== JSON.stringify(sitePage.groups)) {
      throw new Error(`Section incohérente pour ${source.file}.`);
    }
    // Markdown slugs are predictable; notebook slugs are provided by the site.
    const expectedSlug = path.posix.basename(source.file, '.md').replaceAll('_', '-');
    if (index > 0 && source.file.endsWith('.md') && expectedSlug !== sitePage.slug) {
      throw new Error(`Route incohérente pour ${source.file}: ${sitePage.slug}.`);
    }
    const number = String(index + 1).padStart(2, '0');
    const stem = index === 0 ? 'intro' : sitePage.slug;
    if (!/^[a-z0-9-]+$/.test(stem)) throw new Error(`Slug non sûr: ${stem}`);
    return {
      number,
      title: sitePage.title,
      groups: source.groups,
      source_file: source.file,
      slug: sitePage.slug,
      url: new URL(sitePage.slug, SITE).href,
      filename: `${number}-${stem}.md`,
    };
  });
}

export function safeRelative(file) {
  const normalized = path.posix.normalize(file.replaceAll('\\', '/'));
  if (normalized.startsWith('../') || normalized === '..' || path.posix.isAbsolute(normalized) || /^[A-Za-z]:/.test(normalized)) {
    throw new Error(`Chemin hors du projet interdit: ${file}`);
  }
  return normalized;
}

export function pageLink(url, currentUrl, pages) {
  const target = new URL(url, currentUrl);
  const base = new URL(SITE);
  if (![base.origin, 'https://pierrelux.github.io'].includes(target.origin)) return null;
  const pathname = target.pathname.replace(/\/$/, '');
  const page = pages.find(item => new URL(item.url).pathname.replace(/\/$/, '') === pathname)
    ?? (['/rlbook/index', '/rlbook/intro'].includes(pathname) ? pages[0] : null);
  return page ? `${page.filename}${target.hash}` : null;
}

export function expandMacros(latex, macros = {}) {
  for (const [name, definition] of Object.entries(macros).sort(([a], [b]) => b.length - a.length)) {
    const replacement = typeof definition === 'string' ? definition : definition.macro;
    if (!replacement) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    latex = latex.replace(new RegExp(`${escaped}(?![A-Za-z])`, 'g'), () => replacement);
  }
  return latex;
}

export function fenceFor(code) {
  const longest = Math.max(2, ...[...code.matchAll(/`+/g)].map(match => match[0].length));
  return '`'.repeat(longest + 1);
}

export function notebookMarkdown(notebook) {
  return notebook.cells.map(cell => {
    const text = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
    if (cell.cell_type === 'markdown') return text;
    if (cell.cell_type === 'code') {
      const fence = fenceFor(text);
      return `${fence}python\n${text.trimEnd()}\n${fence}`;
    }
    return text ?? '';
  }).join('\n\n') + '\n';
}

// Prose transforms must not mistake [operator](state) inside LaTeX for a link.
export async function mapOutsideInlineLiterals(text, transform) {
  const literals = /(?<!\\)\$(?:\\.|[^$\\])*(?<!\\)\$|(?<ticks>`+)[\s\S]*?\k<ticks>|\\\([\s\S]*?\\\)/g;
  let result = '';
  let offset = 0;
  for (const match of text.matchAll(literals)) {
    result += await transform(text.slice(offset, match.index)) + match[0];
    offset = match.index + match[0].length;
  }
  return result + await transform(text.slice(offset));
}

export function withProvenance(source, header) {
  const frontmatter = source.match(/^---\n[\s\S]*?\n---\n/);
  return frontmatter
    ? `${frontmatter[0]}\n${header}\n${source.slice(frontmatter[0].length).trimStart()}`
    : `${header}\n${source}`;
}

export function convertArticle(html, { macros = {}, rewriteUrl = url => url } = {}) {
  const $ = load(html);
  const article = $('article.content').first();
  if (!article.length) throw new Error('Article principal absent du HTML.');
  const title = article.find('h1').first().text().trim();
  if (!title) throw new Error('Titre du chapitre absent.');

  // Keep hidden solutions and code disclosures. Only remove navigation/UI.
  article.find('script, style, nav, button, .sr-only, .myst-fm-block-header, .myst-fm-authors-affiliations').remove();
  article.find('a[title="Link to this Section"]').remove();
  article.find('img').each((_, node) => {
    const element = $(node);
    element.attr('src', rewriteUrl(element.attr('src') ?? '', 'image'));
    element.removeAttr('srcset');
  });
  article.find('a[href]').each((_, node) => {
    const element = $(node);
    element.attr('href', rewriteUrl(element.attr('href'), 'link'));
  });
  article.find('iframe[src]').each((_, node) => {
    const source = new URL($(node).attr('src'), SITE).href;
    const link = $('<p><a></a></p>');
    link.find('a').attr('href', source).text(`Démonstration interactive — ${$(node).attr('title') || source}`);
    $(node).replaceWith(link);
  });
  // Preserve section/equation/figure anchors, not only GitHub's heading slugs.
  article.find('[id]').each((_, node) => {
    const id = $(node).attr('id');
    if (id && node.name !== 'a') {
      const enclosingLink = $(node).parents('a[href]').first();
      (enclosingLink.length ? enclosingLink : $(node)).before($('<a></a>').attr('id', id));
    }
  });

  // Turndown normalizes text-node whitespace before applying custom rules.
  // Store exact LaTeX in attributes first so multiline formulas stay intact.
  article.find('.katex-display, .katex').each((_, node) => {
    const annotation = $(node).find('annotation[encoding="application/x-tex"]').first();
    if (annotation.length) $(node).attr('data-course-tex', annotation.text());
  });
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '_' });
  td.use(gfmPlugin.gfm);
  td.addRule('math', {
    filter: node => node.classList?.contains('katex-display') || node.classList?.contains('katex'),
    replacement: (_, node) => {
      const annotation = node.querySelector('annotation[encoding="application/x-tex"]');
      if (!annotation) throw new Error('Une formule KaTeX a perdu sa source LaTeX.');
      const tex = expandMacros(node.getAttribute('data-course-tex') ?? annotation.textContent, macros).trim();
      return node.classList.contains('katex-display') ? `\n\n$$\n${tex}\n$$\n\n` : `$${tex}$`;
    },
  });
  td.addRule('stableAnchors', {
    filter: node => node.nodeName === 'A' && node.getAttribute('id') && !node.getAttribute('href'),
    replacement: (_, node) => `\n<a id="${node.getAttribute('id').replaceAll('"', '&quot;')}"></a>\n`,
  });
  td.addRule('codeWithLanguage', {
    filter: 'pre',
    replacement: (_, node) => {
      const code = node.querySelector('code') ?? node;
      const language = code.className?.match(/(?:language-|lang-)([\w+-]+)/)?.[1]
        ?? node.className?.match(/(?:language-|lang-)([\w+-]+)/)?.[1] ?? '';
      const text = code.textContent.trimEnd();
      const fence = fenceFor(text);
      return `\n\n${fence}${language}\n${text}\n${fence}\n\n`;
    },
  });
  // Browser-only charts/replays remain on the original site, with static fallbacks.
  td.remove(['svg', 'canvas']);
  const markdown = td.turndown(article.html()).replace(/\n{4,}/g, '\n\n\n').trim() + '\n';
  return {
    title,
    markdown,
    heading_count: article.find('h1, h2, h3, h4, h5, h6').length,
    math_count: article.find('annotation[encoding="application/x-tex"]').length,
    image_count: article.find('img').length,
    headings: article.find('h1, h2, h3, h4, h5, h6').map((_, node) => $(node).text().trim()).get(),
  };
}
