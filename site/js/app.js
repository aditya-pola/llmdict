/**
 * app.js — Main application, wires everything together
 */
(async function () {
  // Load data
  const { categories, entries } = await Data.load();

  // DOM refs
  const track = document.getElementById('carousel-track');
  const historyBar = document.getElementById('history-bar');
  const overlay = document.getElementById('overlay');
  const overlayCard = document.getElementById('overlay-card');
  const overlayContent = document.getElementById('overlay-content');
  const overlayClose = document.getElementById('overlay-close');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  // Init modules
  Carousel.init(track);
  History.init(historyBar);

  // --- Build cards in order: Home → [Category → Terms]... ---

  // Home card
  const homeCard = Cards.createHomeCard(categories);
  track.appendChild(homeCard);
  Carousel.observeCard(homeCard);

  // Category + term cards
  for (const cat of categories) {
    // Category card
    const catCard = Cards.createCategoryCard(cat, entries);
    track.appendChild(catCard);
    Carousel.observeCard(catCard);

    // Term cards for this category
    for (const eid of cat.entries) {
      const entry = entries[eid];
      if (!entry) continue;
      const termCard = Cards.createTermCard(entry, entries);
      track.appendChild(termCard);
      Carousel.observeCard(termCard);
    }
  }

  // --- Render math in all cards once KaTeX loads ---
  function renderAllMath() {
    if (typeof renderMathInElement === 'function') {
      track.querySelectorAll('.card--term').forEach(c => Cards.renderMath(c));
    }
  }
  // KaTeX loads deferred — wait for it
  if (typeof renderMathInElement === 'function') {
    renderAllMath();
  } else {
    window.addEventListener('load', () => setTimeout(renderAllMath, 100));
  }

  // --- Navigation handler ---

  function navigateTo(id) {
    // Determine card ID prefix
    let cardId = id;
    // If it's a category link (starts with cat-)
    if (id.startsWith('cat-')) {
      cardId = id; // card-cat-xxx
    }

    Carousel.scrollToCard(cardId);

    // Push to history
    const entry = Data.getEntry(id.replace('cat-', ''));
    if (entry) {
      History.push(id, entry.name);
    } else {
      // It's a category
      const catId = id.replace('cat-', '');
      const cat = categories.find(c => c.id === catId);
      if (cat) History.push(id, cat.label);
    }
  }

  // --- Event delegation for all clickable links ---

  document.addEventListener('click', (e) => {
    // Inline links and term links
    const link = e.target.closest('[data-target]');
    if (link) {
      e.preventDefault();
      e.stopPropagation();
      const target = link.dataset.target;

      // Close overlay if open
      closeOverlay();

      navigateTo(target);
      return;
    }

    // Term card click → open overlay
    const termCard = e.target.closest('.card--term');
    if (termCard && !e.target.closest('.inline-link')) {
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
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay();
  });

  // --- Home button ---
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      Carousel.scrollToCard('home');
    });
  }

  // --- Search ---

  Search.init(searchInput, searchResults, navigateTo);

  // --- Keyboard shortcut: Cmd/Ctrl+K to focus search ---
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // --- Handle hash navigation (from graph view or direct links) ---
  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => navigateTo(hash), 300);
    }
  }
  handleHash();
  window.addEventListener('hashchange', handleHash);

})();
