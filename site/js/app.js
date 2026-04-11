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

  // --- Build cards: Home → [Category → Terms]... ---

  // Home card
  const homeCard = Cards.createHomeCard(categories);
  homeCard.innerHTML = `<div class="peek-label"><span>Home</span></div><div class="card-content">${homeCard.innerHTML}</div>`;
  Stack.addCard(homeCard);

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
  Stack.goTo(0);

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

    // Click active home card → expand to show all categories
    const homeCard = e.target.closest('.card--home.card--active');
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

  // --- Position graph button beside the header bar, vertically centered ---
  function positionGraphPill() {
    const header = document.querySelector('.site-header');
    const pill = document.querySelector('.graph-pill');
    if (!header || !pill) return;
    const rect = header.getBoundingClientRect();
    const pillH = pill.offsetHeight;
    pill.style.left = (rect.right + 10) + 'px';
    pill.style.top = (rect.top + (rect.height - pillH) / 2) + 'px';
  }
  positionGraphPill();
  window.addEventListener('resize', positionGraphPill);

  // --- Home button ---
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) homeBtn.addEventListener('click', () => {
    closeOverlay();
    History.exitAndNavigate('home');
    Stack.goTo(0);
  });

  // --- Search ---
  Search.init(searchInput, searchResults, navigateTo);

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // --- Arrow keys ---
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    const overlay = document.getElementById('overlay');
    if (overlay && overlay.classList.contains('active')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      Stack.goTo(Stack.getCardCount() > 0 ? Math.min(
        Array.from(container.querySelectorAll('.card')).findIndex(c => c.classList.contains('card--active')) + 1,
        Stack.getCardCount() - 1
      ) : 0);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      Stack.goTo(Math.max(
        Array.from(container.querySelectorAll('.card')).findIndex(c => c.classList.contains('card--active')) - 1,
        0
      ));
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
