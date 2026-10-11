import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSite, flattenToc, orderedPages, safeRelative, pageLink, expandMacros,
  notebookMarkdown, withProvenance, convertArticle, mapOutsideInlineLiterals,
} from '../scripts/course-lib.mjs';

const toc = [
  { file: 'intro.md' }, { file: 'syllabus.md' },
  { title: 'Models', children: [{ file: 'modeling-controlled-systems.md' }] },
  { title: 'Demos', children: [{ file: 'lab/notebooks/08_collocation_from_nodes.ipynb' }] },
];
const project = {
  title: 'Book', github: 'https://github.com/pierrelux/rlbook', toc,
  pages: [
    { title: 'Syllabus', slug: 'syllabus', level: 1 },
    { title: 'Models', level: 1 },
    { title: 'Controlled systems', slug: 'modeling-controlled-systems', level: 2 },
    { title: 'Demos', level: 1 },
    { title: 'Pendulum', slug: 'collocation-from-nodes', level: 2 },
  ],
};
const pages = orderedPages(project, toc);
const math = (tex, display = false) => `${display ? '<span class="katex-display">' : ''}<span class="katex"><span class="katex-mathml"><math><semantics><mrow>duplicate visual text</mrow><annotation encoding="application/x-tex">${tex}</annotation></semantics></math></span><span class="katex-html">duplicate visual text</span></span>${display ? '</span>' : ''}`;

test('parse MyST data without evaluating scripts', () => {
  const data = { state: { loaderData: { root: { config: { projects: [project] } } } } };
  const html = `<script>throw new Error('do not execute');</script><script>window.__remixContext = ${JSON.stringify(data)};</script>`;
  assert.deepEqual(parseSite(html).project, project);
  assert.throws(() => parseSite('<html></html>'), /absentes/);
  assert.throws(() => parseSite('<script>window.__remixContext = globalThis;</script>'), SyntaxError);
});

test('flatten complete nested navigation, not alphabetical filenames', () => {
  assert.deepEqual(flattenToc(toc).map(page => page.file), [
    'intro.md', 'syllabus.md', 'modeling-controlled-systems.md', 'lab/notebooks/08_collocation_from_nodes.ipynb',
  ]);
  assert.deepEqual(flattenToc(toc)[2].groups, ['Models']);
  assert.equal(pages[3].filename, '04-collocation-from-nodes.md');
  assert.equal(pages[0].filename, '01-intro.md');
});

test('refuse a stale source tree or mismatching published routes', () => {
  assert.throws(() => orderedPages(project, toc.toReversed()), /diffère/);
  const changed = structuredClone(project);
  changed.pages[2].slug = 'wrong-route';
  assert.throws(() => orderedPages(changed, toc), /Route incohérente/);
  changed.pages.pop();
  assert.throws(() => orderedPages(changed, toc), /ambiguë/);
});

test('validate paths against traversal and absolute Windows/Unix paths', () => {
  assert.equal(safeRelative('Content/../Resources/book.pdf'), 'Resources/book.pdf');
  for (const unsafe of ['../secret', '/etc/passwd', 'C:\\secret.txt', '..\\secret']) {
    assert.throws(() => safeRelative(unsafe), /interdit/);
  }
});

test('rewrite both site origins while retaining exact section fragments', () => {
  assert.equal(pageLink('https://pierrelux.github.io/rlbook/syllabus#schedule', pages[0].url, pages), '02-syllabus.md#schedule');
  assert.equal(pageLink('/rlbook/modeling-controlled-systems/', pages[0].url, pages), '03-modeling-controlled-systems.md');
  assert.equal(pageLink('/rlbook/', pages[2].url, pages), '01-intro.md');
  assert.equal(pageLink('https://example.com/rlbook/syllabus', pages[0].url, pages), null);
});

test('expand mathematical macros only at command boundaries', () => {
  assert.equal(expandMacros('\\BellmanPi v + \\BellmanPolicy', {
    '\\Bellman': '\\mathsf{L}', '\\BellmanPi': { macro: '\\mathsf{L}_\\pi' },
  }), '\\mathsf{L}_\\pi v + \\BellmanPolicy');
});

test('prose transformations preserve inline LaTeX and inline code exactly', async () => {
  const input = 'Read [chapter](x.md); $[\\Bellman v](s)$ and `[code](x.md)` stay intact.';
  const transformed = await mapOutsideInlineLiterals(input, async text => text.replaceAll('(x.md)', '(01-x.md)'));
  assert.equal(transformed, 'Read [chapter](01-x.md); $[\\Bellman v](s)$ and `[code](x.md)` stay intact.');
});

test('preserve notebook cells and safely fence embedded backticks', () => {
  const result = notebookMarkdown({ cells: [
    { cell_type: 'markdown', source: ['# Heading\n', 'Full explanation'] },
    { cell_type: 'code', source: 'print("```")\n' },
  ] });
  assert.match(result, /Full explanation/);
  assert.match(result, /````python\nprint\("```"\)\n````/);
});

test('keep YAML frontmatter at the top when adding attribution', () => {
  const result = withProvenance('---\nkey: value\n---\n# Title\n', '> Source\n');
  assert.ok(result.startsWith('---\nkey: value\n---\n'));
  assert.match(result, /> Source\n\n# Title/);
});

test('convert full article with LaTeX, hidden solution, code and stable anchors', () => {
  const html = `<nav>Do not import navigation</nav><article class="content">
    <h1>Chapter</h1><h2 id="topic">Topic<a title="Link to this Section">¶</a></h2>
    <p>Inline ${math('x_{t+1}=f(x_t,u_t)')}.</p>
    <div id="eq-one">${math('\\Bellman v\n= v', true)}</div>
    <details hidden><summary>Solution</summary><p>Keep this answer.</p></details>
    <pre><code class="language-python">print(&quot;&#96;&#96;&#96;&quot;)</code></pre>
    <img src="/rlbook/build/plot.svg" alt="Plot"/>
    <script>never execute this</script><button>UI control</button>
  </article>`;
  const result = convertArticle(html, {
    macros: { '\\Bellman': '\\mathsf{L}' }, rewriteUrl: raw => raw.includes('plot.svg') ? '../Assets/plot.svg' : raw,
  });
  assert.match(result.markdown, /\$x_\{t\+1\}=f\(x_t,u_t\)\$/);
  assert.ok(result.markdown.includes('$$\n\\mathsf{L} v\n= v\n$$'));
  assert.ok(result.markdown.includes('<a id="eq-one"></a>'));
  assert.match(result.markdown, /Keep this answer/);
  assert.match(result.markdown, /````python/);
  assert.match(result.markdown, /!\[Plot\]\(\.\.\/Assets\/plot.svg\)/);
  assert.doesNotMatch(result.markdown, /duplicate visual|navigation|never execute|UI control|¶/);
  assert.equal(result.heading_count, 2);
  assert.equal(result.math_count, 2);
});

test('anchors do not break image hyperlinks', () => {
  const result = convertArticle('<article class="content"><h1>Title</h1><a href="https://example.com"><img id="badge" src="badge.svg" alt="Badge"/></a></article>');
  assert.ok(result.markdown.includes('[![Badge](badge.svg)](https://example.com)'));
  assert.ok(result.markdown.includes('<a id="badge"></a>'));
});

test('refuse an empty extraction instead of silently dropping a page', () => {
  assert.throws(() => convertArticle('<main>No article</main>'), /absent/);
  assert.throws(() => convertArticle('<article class="content"><p>No title</p></article>'), /Titre/);
});
