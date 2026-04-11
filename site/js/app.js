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
  History.init(historyBar);

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
  });

  // --- Overlay ---

  function openOverlay(entry) {
    overlayContent.innerHTML = Cards.renderOverlayContent(entry, entries);
    Cards.renderMath(overlayContent);
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => overlay.classList.add('active'));
    History.push(entry.id, entry.name);
  }

  function closeOverlay() {
    overlay.classList.remove('active');
    setTimeout(() => overlay.classList.add('hidden'), 250);
  }

  overlayClose.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(); });

  // --- Home button ---
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) homeBtn.addEventListener('click', () => Stack.goTo(0));

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
