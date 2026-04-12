/**
 * app.js — Main application (stacked card view)
 */
(async function () {
  const { categories, entries } = await Data.load();

  const container = document.getElementById('stack-container');
  const historyBar = document.getElementById('history-bar');
  const overlay = document.getElementById('overlay');
  const overlayCard = document.getElementById('overlay-card');
  const overlayContent = document.getElementById('overlay-content');
  const overlayClose = document.getElementById('overlay-close');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  Stack.init(container);
  History.init();

  // --- Build cards: [Contributing, Usage, Home] → [Category → Terms]... ---
  // Home is the default landing card; site pages (Usage / Contributing) sit to its left.

  // Usage card (idx 1)
  const usageCard = Cards.createInfoCard({
    id: 'usage',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:8px; opacity:0.4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    title: 'Usage',
    subtitle: 'a few tips to get the most out of this dictionary',
    faceItems: [
      { title: 'Home <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',      body: 'back to the home card.' },
      { title: 'Graph <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="19" r="2.5"/><line x1="7" y1="7.5" x2="10" y2="17"/><line x1="17" y1="7.5" x2="14" y2="17"/><line x1="7.5" y1="6" x2="16.5" y2="6"/></svg>',     body: 'map of how terms connect.' },
      { title: 'Browse',    body: 'click an inline link, scroll, or use arrows.' },
      { title: 'Search',    body: 'press <kbd>S</kbd>, type, <kbd>Enter</kbd>.' },
      { title: 'Expand',    body: 'click any card to open it.' },
      { title: 'History',   body: 'click trail.' },
      { title: 'Shortcuts', body: 'press <kbd>?</kbd> for the cheat sheet.' },
    ],
    overlayHtml: `
      <div class="overlay-name">Usage</div>
      <div class="overlay-expansion">tips for getting the most out of LLM Dictionary</div>

      <div class="overlay-section">
        <div class="overlay-section-title">What this is</div>
        <div class="overlay-section-body">A browsable dictionary for LLM, transformer, quantization, and serving terminology. Every entry is a card you can flip through. The goal isn't depth on day one — it's a place you can land on a confusing term in a model card or paper, get a plain-English answer in fifteen seconds, and follow the related links from there.</div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">Navigating</div>
        <div class="overlay-section-body">Cards are stacked left-to-right. Use the arrow keys, scroll, swipe, or click a peeking card to move. Click the active card to expand it for the full explanation, fundamentals, related terms, papers, and resources. Inline term names inside any explanation are clickable — they jump you to that card.</div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">The buttons</div>
        <div class="overlay-section-body">
          <div class="usage-btn-row"><span class="usage-btn-icon usage-btn-icon--home"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span><span>jumps back to the home card.</span></div>
          <div class="usage-btn-row"><span class="usage-btn-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="19" r="2.5"/><line x1="7" y1="7.5" x2="10" y2="17"/><line x1="17" y1="7.5" x2="14" y2="17"/><line x1="7.5" y1="6" x2="16.5" y2="6"/></svg></span><span>opens a force-directed map of every card and its links. Pinch/scroll to zoom, drag to pan. Click a node to highlight; click again to open it.</span></div>
          <div class="usage-btn-row"><span class="usage-btn-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg></span><span>press <kbd>S</kbd> to focus, type any term, <kbd>Enter</kbd> to jump.</span></div>
          <div class="usage-btn-row"><span class="usage-btn-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span><span>opens the contributing guide on GitHub.</span></div>
          <div class="usage-btn-row"><span class="usage-btn-icon usage-btn-icon--text">?</span><span>keyboard shortcuts cheat sheet. Or just press <kbd>?</kbd>.</span></div>
          <div class="usage-btn-row"><span class="usage-btn-icon usage-btn-icon--text">History</span><span>your recent path. Toggle to scrub back through what you've read.</span></div>
        </div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">Reading the cards</div>
        <div class="overlay-section-body">Every card has the same shape: a <em>oneliner</em> for the search blurb, an <em>explanation</em> on the card face (plain English, no math), and a <em>fundamentals</em> section in the expanded view (formulas, shapes, algorithm steps). If you just want the gist, the card face is enough. If you want to actually understand it, expand.</div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">Shortcuts</div>
        <div class="overlay-section-body">Press <kbd>?</kbd> any time to see the full list. The big ones: <kbd>&larr;</kbd>/<kbd>&rarr;</kbd> to navigate, <kbd>H</kbd> for home, <kbd>G</kbd> for graph, <kbd>S</kbd> for search, <kbd>Enter</kbd> to expand, <kbd>Esc</kbd> to close.</div>
      </div>
    `,
  });
  usageCard.innerHTML = `<div class="peek-label"><span>Usage</span></div><div class="card-content">${usageCard.innerHTML}</div>`;

  // Contributing card (idx 0)
  const contribCard = Cards.createInfoCard({
    id: 'contributing',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:8px; opacity:0.4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    title: 'Contributing',
    subtitle: 'one term = one JSON file.',
    faceItems: [
      { title: 'Fork',     body: 'fork the repo on GitHub' },
      { title: 'Add',      body: 'create <code>cards/your-term.json</code>' },
      { title: 'Validate', body: 'run <code>python3 validate.py</code>' },
      { title: 'PR',       body: 'open a pull request — auto-checks run' },
      { title: 'Merge',    body: 'on merge, the site rebuilds itself' },
      { title: 'Guide',    body: '<a href="https://github.com/aditya-pola/llmdict/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener" style="color:inherit; border-bottom:1px solid currentColor;">CONTRIBUTING.md</a>' },
    ],
    overlayHtml: `
      <div class="overlay-name">Contributing</div>
      <div class="overlay-expansion">add a term, fix a term, or fill a gap</div>

      <div class="overlay-section">
        <div class="overlay-section-title">The whole workflow</div>
        <div class="overlay-section-body">Every entry in this dictionary is a single JSON file in the <code>cards/</code> directory. To add a term, create one new file. To fix a term, edit one existing file. There is no build step you have to run, no database, no CMS — just JSON.</div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">Steps</div>
        <div class="overlay-section-body">
          <strong>1.</strong> Fork the repo at <a href="https://github.com/aditya-pola/llmdict" target="_blank" rel="noopener">github.com/aditya-pola/llmdict</a>.<br>
          <strong>2.</strong> Create <code>cards/your-term.json</code>. Copy any existing card as a template.<br>
          <strong>3.</strong> Fill in <code>id</code>, <code>name</code>, <code>expansion</code>, <code>category</code>, <code>oneliner</code>, <code>explanation</code>, <code>related</code>, <code>resources</code>. Optional: <code>fundamentals</code>, <code>foundational_papers</code>.<br>
          <strong>4.</strong> Run <code>python3 validate.py</code> locally — it checks length, JSON shape, related-link validity, and suggests connections you might've missed.<br>
          <strong>5.</strong> Open a pull request. CI re-runs validation; on merge the glossary auto-rebuilds.
        </div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">Writing rules (the short version)</div>
        <div class="overlay-section-body">
          The first sentence of <em>explanation</em> must answer "what is this?" in plain English — no jargon, no paper citations, no formulas. Save the math for <em>fundamentals</em>. Keep the explanation between 300–480 characters. Link to neighboring concepts via <code>related</code>; the site will linkify any mentioned term automatically.
        </div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">Full guide</div>
        <div class="overlay-section-body">The complete schema, length rules, category list, and the rubric the validator enforces all live in <a href="https://github.com/aditya-pola/llmdict/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">CONTRIBUTING.md</a>.</div>
      </div>
    `,
  });
  contribCard.innerHTML = `<div class="peek-label"><span>Contributing</span></div><div class="card-content">${contribCard.innerHTML}</div>`;

  // Philosophy card (idx 0 — leftmost, expresses project intent)
  const philosophyCard = Cards.createInfoCard({
    id: 'philosophy',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:8px; opacity:0.4"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M6 12h12"/></svg>',
    title: 'Philosophy',
    subtitle: 'a living dictionary for a moving field',
    faceItems: [
      { title: 'Living',     body: 'maintained, not shipped.' },
      { title: 'Open',       body: 'one file per term.' },
      { title: 'Accessible', body: 'plain language first.' },
    ],
    overlayHtml: `
      <div class="overlay-name">Philosophy</div>
      <div class="overlay-expansion">a living dictionary for a moving field</div>

      <div class="overlay-section">
        <div class="overlay-section-title">What this is</div>
        <div class="overlay-section-body">It is a dictionary of the language that has grown up around large language models and the work of training, adapting, and serving them.</div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">Why this exists</div>
        <div class="overlay-section-body">The vocabulary of machine learning has outgrown the places we used to look it up. A modern HuggingFace model card might mention GQA, RoPE, an <code>int4</code> quant flavour, a chat template variant, a fine-tuning method, and a serving stack. Each of those is a term someone coined in a paper or a framework changelog, and each carries its own history that the model card assumes you already know. The reference material that explains those terms is real and good, but it is scattered across paper appendices, blog posts, framework documentation, and the working knowledge of people close to the original conversations. There isn't a quiet, navigable, stable place to look something up, see what is adjacent to it, and leave with the right mental model. That is the gap this tries to sit in.</div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">A living document</div>
        <div class="overlay-section-body">This is meant to be maintained over a long horizon rather than published once and left behind, and the shape of the project follows from that intention. Each term lives in its own small file. The conventions for how to write one are documented and openly discussed. The work of adding or revising an entry is, ideally, only the work of writing it down. The hope is that the friction of contribution stays low enough for the rate of additions and corrections to keep reasonable pace with the rate at which the field introduces new things to write about.</div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">Open by design</div>
        <div class="overlay-section-body">Contributing happens through a pull request, much like contributing to any open project. Validation runs automatically and reports what to adjust. The writing conventions, including the things that make a card useful at a glance, what belongs on the face, and what belongs in the technical view, are documented in the contributing guide rather than held in the heads of a few maintainers. The rendering code is small enough to read in an evening. None of this is invented for this project; it borrows from the way open documentation has worked for a long time, and the borrowing is intentional.</div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">Resists going stale</div>
        <div class="overlay-section-body">Any reference like this will eventually be wrong about something. New methods arrive, older ones fall out of use, names get changed in upstream code, and there isn't a way to write an entry today that won't need a correction in a year. The conviction this project rests on is a modest one. If making a correction is roughly as cheap as noticing an error, corrections will happen often enough to keep the document in a useful, if imperfect, relationship with the field. Whether that conviction holds in practice is largely a question of whether the readers who rely on it are also willing, occasionally, to maintain it.</div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">Built as a reference</div>
        <div class="overlay-section-body">Each surface on the page has one job. The card face is the definition. The expanded view holds the technical detail: formulas, tensor shapes, algorithm steps, original sources. Words inside an entry that name other entries are linked to those entries, the way cross-references work in a printed reference. Search is for direct lookup. The graph view shows how entries relate. The history bar keeps the trail of what has been read. None of these surfaces try to do more than the one thing they exist for.</div>
      </div>

      <div class="overlay-section">
        <div class="overlay-section-title">An invitation</div>
        <div class="overlay-section-body">If you have looked something up here and felt that an entry could be clearer, or noticed a term that should exist and does not, or have one you know well enough to write down, contributions are warmly welcome. The <a href="https://github.com/aditya-pola/llmdict/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">contributing guide</a> explains the format and the conventions, less as requirements than as offers of structure to make the writing easier. Small corrections are valued exactly as much as long technical entries. The dictionary belongs to the people who use it.</div>
      </div>
    `,
  });
  philosophyCard.innerHTML = `<div class="peek-label"><span>Philosophy</span></div><div class="card-content">${philosophyCard.innerHTML}</div>`;

  // Visitor Map card (idx 1 — opens the globe overlay on click)
  const visitorCard = document.createElement('div');
  visitorCard.className = 'card card--home card--info card--visitors';
  visitorCard.id = 'card-visitors';
  visitorCard.dataset.opensGlobe = '1';
  visitorCard.innerHTML = `
    <div class="peek-label"><span>Visitors</span></div>
    <div class="card-content">
      <div class="home-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:8px; opacity:0.4"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>Visitors
      </div>
      <div class="home-title-underline"></div>
      <div class="visitors-cta">click to view</div>
    </div>
  `;

  // Home card (default landing)
  const homeCard = Cards.createHomeCard(categories);
  homeCard.innerHTML = `<div class="peek-label"><span>Home</span></div><div class="card-content">${homeCard.innerHTML}</div>`;

  // Add in left-to-right order: Visitors, Contributing, Philosophy, Usage, Home, then categories/terms
  Stack.addCard(visitorCard);
  Stack.addCard(contribCard);
  Stack.addCard(philosophyCard);
  Stack.addCard(usageCard);
  Stack.addCard(homeCard);
  const HOME_INDEX = 4;

  for (const cat of categories) {
    const catCard = Cards.createCategoryCard(cat, entries);
    catCard.innerHTML = `<div class="peek-label"><span>${cat.label}</span></div><div class="card-content">${catCard.innerHTML}</div>`;
    Stack.addCard(catCard);

    for (const eid of cat.entries) {
      const entry = entries[eid];
      if (!entry) continue;
      const termCard = Cards.createTermCard(entry, entries);
      termCard.innerHTML = `<div class="peek-label"><span>${entry.name}</span></div><div class="card-content">${termCard.innerHTML}</div>`;
      Stack.addCard(termCard);
    }
  }

  // Initial layout
  Stack.goTo(HOME_INDEX);

  // --- Navigation ---

  function navigateTo(id) {
    // Exit history mode if active, then navigate in full cabinet
    History.exitAndNavigate(id);

    let cardId = id;
    Stack.goToCard(cardId);

    const entry = Data.getEntry(id.replace('cat-', ''));
    if (entry) {
      History.push(id, entry.name);
    } else {
      const catId = id.replace('cat-', '');
      const cat = categories.find(c => c.id === catId);
      if (cat) History.push(id, cat.label);
    }
  }

  // --- Event delegation ---

  document.addEventListener('click', (e) => {
    // If user was selecting text, don't trigger card actions
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) return;

    // History locate button → exit history, go to card in full carousel
    const locateBtn = e.target.closest('.history-locate-btn');
    if (locateBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = locateBtn.dataset.locateId;
      if (id) navigateTo(id);
      return;
    }

    // Inline links and data-target links
    const link = e.target.closest('[data-target]');
    if (link) {
      e.preventDefault();
      e.stopPropagation();
      closeOverlay();
      navigateTo(link.dataset.target);
      return;
    }

    // Click a peeking (non-active) card → navigate to it
    const card = e.target.closest('.card');
    if (card && !card.classList.contains('card--active') && !card.classList.contains('card--hidden')) {
      e.preventDefault();
      const allCards = container.querySelectorAll('.card');
      const idx = Array.from(allCards).indexOf(card);
      if (idx >= 0) {
        Stack.goTo(idx);
        // Push to history
        const entryId = card.dataset.entryId;
        if (entryId) {
          const entry = Data.getEntry(entryId);
          if (entry) History.push(entryId, entry.name);
        }
      }
      return;
    }

    // Click active term card → open overlay
    const termCard = e.target.closest('.card--term.card--active');
    if (termCard && !e.target.closest('.inline-link') && !e.target.closest('[data-target]')) {
      const entryId = termCard.dataset.entryId;
      const entry = Data.getEntry(entryId);
      if (entry) openOverlay(entry);
      return;
    }

    // Click active info card (usage / contributing / visitors) → open overlay with rich content
    const infoCard = e.target.closest('.card--info.card--active');
    if (infoCard && !e.target.closest('[data-target]') && !e.target.closest('a')) {
      if (infoCard.dataset.opensGlobe === '1') {
        const overlayEl = document.getElementById('globe-overlay');
        if (overlayEl) {
          overlayEl.classList.remove('hidden');
          requestAnimationFrame(() => overlayEl.classList.add('active'));
        }
      } else {
        const html = infoCard.dataset.infoOverlay;
        if (html) openOverlayRaw(html, true);
      }
      return;
    }

    // Click active home card → expand to show all categories
    const homeCard = e.target.closest('.card--home:not(.card--info).card--active');
    if (homeCard && !e.target.closest('[data-target]')) {
      try {
        const allCats = JSON.parse(homeCard.dataset.allCategories);
        openOverlayRaw(`
          <div class="overlay-name">All Categories</div>
          <div class="overlay-expansion">${allCats.reduce((s, c) => s + c.count, 0)} terms</div>
          <div class="overlay-section">
            <ul style="list-style:none; display:flex; flex-direction:column; gap:0;">
              ${allCats.map(c =>
                `<li style="border-bottom:1px solid rgba(255,255,255,0.06);"><span class="related-tag" data-target="cat-${c.id}" style="display:block; border:none; border-radius:0; padding:9px 0; font-size:14px;">${c.label} <span style="opacity:0.35">(${c.count})</span></span></li>`
              ).join('')}
            </ul>
          </div>
        `, true);
      } catch (err) {}
      return;
    }

    // Click active category card → expand to show all terms
    const catCard = e.target.closest('.card--category.card--active');
    if (catCard && !e.target.closest('[data-target]')) {
      try {
        const allTerms = JSON.parse(catCard.dataset.allTerms);
        const catLabel = catCard.dataset.catLabel;
        openOverlayRaw(`
          <div class="overlay-name">${catLabel}</div>
          <div class="overlay-expansion">${allTerms.length} terms</div>
          <div class="overlay-section">
            <ul style="list-style:none; display:flex; flex-direction:column; gap:0;">
              ${allTerms.map(t =>
                `<li style="border-bottom:1px solid rgba(255,255,255,0.06);"><span class="related-tag" data-target="${t.id}" style="display:block; border:none; border-radius:0; padding:9px 0; font-size:14px;">${t.name}</span></li>`
              ).join('')}
            </ul>
          </div>
        `, true);
      } catch (err) {}
      return;
    }
  });

  // --- Overlay ---

  function openOverlay(entry) {
    overlayContent.innerHTML = Cards.renderOverlayContent(entry, entries);
    Cards.renderMath(overlayContent);
    overlay.classList.remove('hidden', 'overlay--light');
    requestAnimationFrame(() => overlay.classList.add('active'));
    History.push(entry.id, entry.name);
  }

  function openOverlayRaw(html, light) {
    overlayContent.innerHTML = html;
    overlay.classList.remove('hidden');
    if (light) overlay.classList.add('overlay--light');
    else overlay.classList.remove('overlay--light');
    requestAnimationFrame(() => overlay.classList.add('active'));
  }

  function closeOverlay() {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('overlay--light');
    }, 250);
  }

  overlayClose.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(); });

  // --- Position header action buttons in a row beside the bar ---
  function positionHeaderButtons() {
    const header = document.querySelector('.site-header');
    const buttons = [
      document.querySelector('.graph-pill'),
      document.getElementById('contribute-btn'),
    ].filter(Boolean);
    if (!header || !buttons.length) return;

    const rect = header.getBoundingClientRect();
    const btnSize = 36;
    const gap = 8;
    const topCenter = rect.top + (rect.height - btnSize) / 2;

    buttons.forEach((btn, i) => {
      btn.style.left = (rect.right + 10 + i * (btnSize + gap)) + 'px';
      btn.style.top = topCenter + 'px';
    });
  }
  positionHeaderButtons();
  window.addEventListener('resize', positionHeaderButtons);

  // --- Home button ---
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) homeBtn.addEventListener('click', () => {
    closeOverlay();
    History.exitAndNavigate('home');
    Stack.goTo(HOME_INDEX);
  });

  // --- Search ---
  Search.init(searchInput, searchResults, navigateTo);

  // --- Shortcut overlay ---
  const shortcutOverlay = document.getElementById('shortcut-overlay');
  const shortcutHint = document.getElementById('shortcut-hint');

  function openShortcuts() {
    shortcutOverlay.classList.remove('hidden');
    requestAnimationFrame(() => shortcutOverlay.classList.add('active'));
  }
  function closeShortcuts() {
    shortcutOverlay.classList.remove('active');
    setTimeout(() => shortcutOverlay.classList.add('hidden'), 200);
  }
  function isShortcutsOpen() {
    return shortcutOverlay && shortcutOverlay.classList.contains('active');
  }

  // --- Globe overlay (opened via the Visitor Map card) ---
  const globeOverlay = document.getElementById('globe-overlay');
  const globeClose = document.getElementById('globe-close');

  function openGlobe() {
    globeOverlay.classList.remove('hidden');
    requestAnimationFrame(() => globeOverlay.classList.add('active'));
  }
  function closeGlobe() {
    globeOverlay.classList.remove('active');
    setTimeout(() => globeOverlay.classList.add('hidden'), 200);
  }
  if (globeClose) globeClose.addEventListener('click', closeGlobe);
  if (globeOverlay) globeOverlay.addEventListener('click', (e) => {
    if (e.target === globeOverlay) closeGlobe();
  });

  // --- Unified keyboard handler ---
  function getActiveIndex() {
    const cards = container.querySelectorAll('.card');
    return Array.from(cards).findIndex(c => c.classList.contains('card--active'));
  }

  document.addEventListener('keydown', (e) => {
    // Always handle: Escape closes whatever is open
    if (e.key === 'Escape') {
      if (globeOverlay && globeOverlay.classList.contains('active')) { closeGlobe(); return; }
      if (isShortcutsOpen()) { closeShortcuts(); return; }
      closeOverlay();
      return;
    }

    // If shortcut overlay is open, any key dismisses it
    if (isShortcutsOpen()) {
      closeShortcuts();
      return;
    }

    // Cmd/Ctrl+K → focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      return;
    }

    // Don't handle shortcuts when typing in search
    if (e.target.tagName === 'INPUT') return;

    // Don't intercept when Ctrl/Meta/Alt is held (browser shortcuts like Ctrl+R, Ctrl+Shift+R)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Don't handle navigation shortcuts when overlay is open (except Escape, handled above)
    const overlayOpen = overlay && overlay.classList.contains('active');

    switch (e.key) {
      case '?':
        e.preventDefault();
        openShortcuts();
        break;

      case 'h':
      case 'H':
        e.preventDefault();
        closeOverlay();
        History.exitAndNavigate('home');
        Stack.goTo(HOME_INDEX);
        break;

      case 's':
      case 'S':
        if (!overlayOpen) {
          e.preventDefault();
          searchInput.focus();
        }
        break;

      case 'g':
      case 'G':
        if (!overlayOpen) {
          e.preventDefault();
          window.location.href = 'graph.html';
        }
        break;

      case 'r':
      case 'R':
        if (!overlayOpen) {
          e.preventDefault();
          const historyToggle = document.getElementById('history-toggle');
          if (historyToggle) historyToggle.click();
        }
        break;

      case 'Enter':
        if (!overlayOpen) {
          e.preventDefault();
          // Expand active card
          const activeCard = container.querySelector('.card--active.card--term');
          if (activeCard) {
            const entryId = activeCard.dataset.entryId;
            const entry = Data.getEntry(entryId);
            if (entry) openOverlay(entry);
          }
          // Home/category card → trigger click for expand overlay
          const homeActive = container.querySelector('.card--home.card--active');
          if (homeActive) homeActive.click();
          const catActive = container.querySelector('.card--category.card--active');
          if (catActive) catActive.click();
        }
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        if (!overlayOpen) {
          e.preventDefault();
          Stack.goTo(Math.min(getActiveIndex() + 1, Stack.getCardCount() - 1));
        }
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        if (!overlayOpen) {
          e.preventDefault();
          Stack.goTo(Math.max(getActiveIndex() - 1, 0));
        }
        break;
    }
  });

  // --- Hash navigation ---
  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash) setTimeout(() => navigateTo(hash), 300);
  }
  handleHash();
  window.addEventListener('hashchange', handleHash);

  // --- Math render (retry until KaTeX loads) ---
  function renderAllMath() {
    if (typeof renderMathInElement !== 'function') return false;
    container.querySelectorAll('.card-content').forEach(c => Cards.renderMath(c));
    return true;
  }
  if (!renderAllMath()) {
    const mathInterval = setInterval(() => {
      if (renderAllMath()) clearInterval(mathInterval);
    }, 200);
    // Give up after 5 seconds
    setTimeout(() => clearInterval(mathInterval), 5000);
  }

})();
