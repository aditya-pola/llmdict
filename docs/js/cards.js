/**
 * cards.js — Render card elements from data
 */
const Cards = (() => {

  /**
   * Linkify known term IDs within text.
   * Wraps matching term names with clickable spans.
   */
  function linkifyText(text, entries) {
    if (!text) return '';

    // Protect $...$ LaTeX blocks from linkification
    const mathBlocks = [];
    let protected = text.replace(/\$\$[\s\S]+?\$\$|\$[^$]+?\$/g, (match) => {
      mathBlocks.push(match);
      return `%%MATH${mathBlocks.length - 1}%%`;
    });

    // Build a map of names/IDs to look for
    const terms = Object.values(entries)
      .map(e => ({ id: e.id, name: e.name, patterns: [e.name] }))
      .sort((a, b) => b.name.length - a.name.length); // longest first

    const used = new Set();
    const linkBlocks = [];

    for (const t of terms) {
      for (const pattern of t.patterns) {
        const regex = new RegExp(`\\b(${escapeRegex(pattern)})\\b`, 'gi');
        if (regex.test(protected) && !used.has(t.id)) {
          // Replace match with placeholder to prevent nested matching
          protected = protected.replace(regex, (match) => {
            const placeholder = `%%LINK${linkBlocks.length}%%`;
            linkBlocks.push(`<span class="inline-link" data-target="${t.id}">${match}</span>`);
            return placeholder;
          });
          used.add(t.id);
          break;
        }
      }
    }

    // Restore link placeholders
    protected = protected.replace(/%%LINK(\d+)%%/g, (_, i) => linkBlocks[parseInt(i)]);
    // Restore math blocks
    protected = protected.replace(/%%MATH(\d+)%%/g, (_, i) => mathBlocks[parseInt(i)]);
    return protected;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Create the Home card
   */
  function createHomeCard(categories) {
    const totalEntries = categories.reduce((s, c) => s + c.entries.length, 0);
    const previewCount = 8;
    const card = document.createElement('div');
    card.className = 'card card--home';
    card.id = 'card-home';
    card.innerHTML = `
      <div class="home-title"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:8px; opacity:0.4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Home</div>
      <div class="home-title-underline"></div>
      <div class="home-subtitle">${totalEntries} terms across ${categories.length} categories</div>
      <ul class="category-list">
        ${categories.slice(0, previewCount).map(c =>
          `<li><span class="category-link" data-target="cat-${c.id}">${c.label} <span style="opacity:0.4">(${c.entries.length})</span></span></li>`
        ).join('')}
      </ul>
      <div class="card-hint">click to see all &middot; scroll to explore &rarr;</div>
    `;
    // Store full categories for overlay
    card.dataset.allCategories = JSON.stringify(categories.map(c => ({ id: c.id, label: c.label, count: c.entries.length })));
    return card;
  }

  /**
   * Create a Category card
   */
  function createCategoryCard(cat, entries) {
    const previewCount = 8;
    const card = document.createElement('div');
    card.className = 'card card--category';
    card.id = `card-cat-${cat.id}`;
    const previewEntries = cat.entries.slice(0, previewCount);
    const hasMore = cat.entries.length > previewCount;
    card.innerHTML = `
      <div class="cat-label">Category</div>
      <div class="cat-title">${cat.label}</div>
      <ul class="term-list">
        ${previewEntries.map(eid => {
          const e = entries[eid];
          if (!e) return '';
          return `<li><span class="term-link" data-target="${e.id}">${e.name}</span></li>`;
        }).join('')}
      </ul>
      <div class="card-hint">${hasMore ? 'click to see all ' + cat.entries.length + ' terms &middot; ' : ''}scroll &rarr;</div>
    `;
    // Store full term list for overlay
    card.dataset.allTerms = JSON.stringify(cat.entries.map(eid => {
      const e = entries[eid];
      return e ? { id: e.id, name: e.name } : null;
    }).filter(Boolean));
    card.dataset.catLabel = cat.label;
    return card;
  }

  /**
   * Create a Term card (the compact "walk away" version).
   * If `populate` is false, the card is created with placeholder content
   * (no linkified explanation) and stashes the entry on _pendingEntry for
   * a later populateTermCard() call. The linkifier is the heaviest
   * synchronous cost during init (one regex scan per term per card),
   * so we defer it for cards far from the active position on first load.
   */
  const _pendingEntries = new WeakMap();
  const _pendingAllEntries = new WeakMap();

  function createTermCard(entry, allEntries, populate = true) {
    const card = document.createElement('div');
    card.className = 'card card--term';
    card.id = `card-${entry.id}`;
    card.dataset.entryId = entry.id;

    if (populate) {
      _populateTermCardInner(card, entry, allEntries);
    } else {
      // Placeholder: name + expansion + raw oneliner (no linkification yet).
      card.innerHTML = `
        <div class="term-name">${entry.name}</div>
        <div class="term-expansion">${entry.expansion || ''}</div>
        <div class="term-explanation">${entry.oneliner || ''}</div>
        <div class="card-expand-hint">click to expand</div>
      `;
      _pendingEntries.set(card, entry);
      _pendingAllEntries.set(card, allEntries);
    }
    return card;
  }

  function _populateTermCardInner(card, entry, allEntries) {
    const explanation = linkifyText(entry.explanation || entry.oneliner || '', allEntries);
    const html = `
      <div class="term-name">${entry.name}</div>
      <div class="term-expansion">${entry.expansion || ''}</div>
      <div class="term-explanation">${explanation}</div>
      <div class="card-expand-hint">click to expand</div>
    `;
    // If the card has already been wrapped with peek-label + card-content
    // (app.js does this immediately after createTermCard), write into the
    // content slot so the wrapper survives. Otherwise fall back to
    // replacing the whole innerHTML.
    const slot = card.querySelector('.card-content');
    if (slot) slot.innerHTML = html;
    else card.innerHTML = html;
    card.dataset.populated = '1';
  }

  /**
   * Idempotently populate a term card created in deferred mode.
   * Safe to call repeatedly; only does work the first time.
   */
  function populateTermCard(card) {
    if (!card || card.dataset.populated === '1') return;
    const entry = _pendingEntries.get(card);
    const allEntries = _pendingAllEntries.get(card);
    if (!entry || !allEntries) return;
    _populateTermCardInner(card, entry, allEntries);
    _pendingEntries.delete(card);
    _pendingAllEntries.delete(card);
  }

  /**
   * Render the expanded overlay content for a term
   */
  function renderOverlayContent(entry, allEntries) {
    const sections = [];

    // Explanation
    if (entry.explanation) {
      sections.push(`
        <div class="overlay-section">
          <div class="overlay-section-title">Explanation</div>
          <div class="overlay-section-body">${linkifyText(entry.explanation, allEntries)}</div>
        </div>
      `);
    }

    // Fundamentals
    if (entry.fundamentals) {
      sections.push(`
        <div class="overlay-section">
          <div class="overlay-section-title">How It Works</div>
          <div class="overlay-section-body">${linkifyText(entry.fundamentals, allEntries)}</div>
        </div>
      `);
    }

    // Related terms
    const related = entry.related || [];
    if (related.length > 0) {
      sections.push(`
        <div class="overlay-section">
          <div class="overlay-section-title">Related Terms</div>
          <div class="related-tags">
            ${related.map(rid => {
              const re = allEntries[rid];
              const label = re ? re.name : rid;
              return `<span class="related-tag" data-target="${rid}">${label}</span>`;
            }).join('')}
          </div>
        </div>
      `);
    }

    // Foundational papers
    const papers = entry.foundational_papers || [];
    if (papers.length > 0) {
      sections.push(`
        <div class="overlay-section">
          <div class="overlay-section-title">Foundational Papers</div>
          ${papers.map(p => {
            const link = p.arxiv
              ? `<a href="https://arxiv.org/abs/${p.arxiv}" target="_blank" rel="noopener">${p.title}</a>`
              : p.title;
            return `<div class="paper-item">${link}<br><span class="paper-authors">${p.authors} — ${p.venue}</span></div>`;
          }).join('')}
        </div>
      `);
    }

    // Resources
    const resources = entry.resources || [];
    if (resources.length > 0) {
      sections.push(`
        <div class="overlay-section">
          <div class="overlay-section-title">Resources</div>
          ${resources.map(r =>
            `<div class="resource-item"><a href="${r.url}" target="_blank" rel="noopener">${r.label}</a></div>`
          ).join('')}
        </div>
      `);
    }

    return `
      <div class="overlay-name">${entry.name}</div>
      <div class="overlay-expansion">${entry.expansion || ''}</div>
      ${sections.join('')}
    `;
  }

  /**
   * Lazy-load KaTeX (CSS + JS + auto-render extension) on first use.
   * Returns a Promise that resolves when KaTeX is ready to call.
   * Cached so subsequent calls resolve immediately.
   */
  let _katexPromise = null;
  function ensureKatexLoaded() {
    if (_katexPromise) return _katexPromise;
    _katexPromise = new Promise((resolve) => {
      // CSS
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(css);
      // Core JS, then the auto-render extension (must load in order)
      const core = document.createElement('script');
      core.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
      core.onload = () => {
        const auto = document.createElement('script');
        auto.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
        auto.onload = () => resolve();
        auto.onerror = () => resolve(); // fail silently — math just won't render
        document.head.appendChild(auto);
      };
      core.onerror = () => resolve();
      document.head.appendChild(core);
    });
    return _katexPromise;
  }

  /**
   * Render LaTeX math in an element using KaTeX auto-render.
   * Recognizes $...$ (inline) and $$...$$ (display).
   * Only loads KaTeX if the element actually contains a `$` delimiter.
   */
  function renderMath(el) {
    if (!el || el.textContent.indexOf('$') === -1) return;
    ensureKatexLoaded().then(() => {
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    });
  }

  /**
   * Create an Info card (usage / contributing). Same visual shell as the home card.
   * faceItems: array of {title, body} shown as a list on the card face.
   * overlayHtml: full HTML rendered when the card is clicked.
   */
  function createInfoCard({ id, icon, title, subtitle, faceItems, overlayHtml }) {
    const card = document.createElement('div');
    card.className = 'card card--home card--info';
    card.id = `card-${id}`;
    card.dataset.infoId = id;
    card.dataset.infoOverlay = overlayHtml;
    card.innerHTML = `
      <div class="home-title">${icon || ''}${title}</div>
      <div class="home-title-underline"></div>
      <div class="home-subtitle">${subtitle}</div>
      <ul class="category-list">
        ${faceItems.map(it =>
          `<li><span class="category-link" style="cursor:default;"><strong style="color:#000;font-weight:500;">${it.title}</strong> <span style="opacity:0.55">${it.body}</span></span></li>`
        ).join('')}
      </ul>
      <div class="card-hint">click to read more &middot; scroll &rarr;</div>
    `;
    return card;
  }

  return { createHomeCard, createCategoryCard, createTermCard, populateTermCard, createInfoCard, renderOverlayContent, renderMath, ensureKatexLoaded };
})();
