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

  // --- Unified keyboard handler ---
  function getActiveIndex() {
    const cards = container.querySelectorAll('.card');
    return Array.from(cards).findIndex(c => c.classList.contains('card--active'));
  }

  document.addEventListener('keydown', (e) => {
    // Always handle: Escape closes whatever is open
    if (e.key === 'Escape') {
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
        Stack.goTo(0);
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
