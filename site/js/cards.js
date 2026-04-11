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
    // Build a map of names/IDs to look for
    const terms = Object.values(entries)
      .map(e => ({ id: e.id, name: e.name, patterns: [e.name] }))
      .sort((a, b) => b.name.length - a.name.length); // longest first

    let result = text;
    const used = new Set();
    for (const t of terms) {
      for (const pattern of t.patterns) {
        // Case-insensitive match, but only if not already linked
        const regex = new RegExp(`\\b(${escapeRegex(pattern)})\\b`, 'gi');
        if (regex.test(result) && !used.has(t.id)) {
          result = result.replace(regex, (match) => {
            return `<span class="inline-link" data-target="${t.id}">${match}</span>`;
          });
          used.add(t.id);
          break;
        }
      }
    }
    return result;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Create the Home card
   */
  function createHomeCard(categories) {
    const card = document.createElement('div');
    card.className = 'card card--home';
    card.id = 'card-home';
    card.innerHTML = `
      <div class="home-title">LLM Glossary</div>
      <div class="home-subtitle">141 terms across ${categories.length} categories</div>
      <ul class="category-list">
        ${categories.map(c =>
          `<li><span class="category-link" data-target="cat-${c.id}">${c.label} <span style="color:var(--text-tertiary)">(${c.entries.length})</span></span></li>`
        ).join('')}
      </ul>
    `;
    return card;
  }

  /**
   * Create a Category card
   */
  function createCategoryCard(cat, entries) {
    const card = document.createElement('div');
    card.className = 'card card--category';
    card.id = `card-cat-${cat.id}`;
    card.innerHTML = `
      <div class="cat-label">Category</div>
      <div class="cat-title">${cat.label}</div>
      <ul class="term-list">
        ${cat.entries.map(eid => {
          const e = entries[eid];
          if (!e) return '';
          return `<li><span class="term-link" data-target="${e.id}">${e.name}</span></li>`;
        }).join('')}
      </ul>
    `;
    return card;
  }

  /**
   * Create a Term card (the compact "walk away" version)
   */
  function createTermCard(entry, allEntries) {
    const card = document.createElement('div');
    card.className = 'card card--term';
    card.id = `card-${entry.id}`;
    card.dataset.entryId = entry.id;

    const explanation = linkifyText(entry.explanation || entry.oneliner || '', allEntries);

    card.innerHTML = `
      <div class="term-name">${entry.name}</div>
      <div class="term-expansion">${entry.expansion || ''}</div>
      <div class="term-explanation">${explanation}</div>
      <div class="card-expand-hint">click to expand</div>
    `;
    return card;
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
   * Render LaTeX math in an element using KaTeX auto-render.
   * Recognizes $...$ (inline) and $$...$$ (display).
   */
  function renderMath(el) {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(el, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }

  return { createHomeCard, createCategoryCard, createTermCard, renderOverlayContent, renderMath };
})();
