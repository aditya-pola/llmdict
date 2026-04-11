/**
 * history.js — Track visited cards, toggle history-only mode in the stack
 */
const History = (() => {
  let _visited = []; // { id, label, cardIndex }
  let _historyMode = false;
  let _savedIndex = 0; // remember position before entering history mode
  let _toggleBtn = null;
  let _countEl = null;
  let _labelEl = null;
  const MAX_HISTORY = 50;

  function init() {
    _toggleBtn = document.getElementById('history-toggle');
    _countEl = document.getElementById('history-count');
    _labelEl = document.getElementById('history-mode-label');

    if (_toggleBtn) {
      _toggleBtn.addEventListener('click', _toggle);
    }
  }

  function push(id, label) {
    // Don't duplicate the most recent
    if (_visited.length > 0 && _visited[_visited.length - 1].id === id) return;
    // Remove earlier duplicate
    _visited = _visited.filter(v => v.id !== id);
    _visited.push({ id, label });
    if (_visited.length > MAX_HISTORY) _visited.shift();
    _updateCount();
  }

  function _updateCount() {
    if (_countEl) _countEl.textContent = _visited.length;
  }

  function isHistoryMode() {
    return _historyMode;
  }

  function _toggle() {
    _historyMode = !_historyMode;

    if (_historyMode) {
      _enterHistoryMode();
    } else {
      _exitHistoryMode();
    }
  }

  function _enterHistoryMode() {
    if (_visited.length === 0) {
      _historyMode = false;
      return;
    }

    _toggleBtn.classList.add('active');
    _labelEl.classList.add('visible');

    // Save current position
    const allCards = document.querySelectorAll('#stack-container .card');
    _savedIndex = Array.from(allCards).findIndex(c => c.classList.contains('card--active'));

    // Hide all cards, show only visited ones
    allCards.forEach(c => {
      c.dataset.historyHidden = 'true';
      c.style.display = 'none';
    });

    // Show visited cards in visit order
    const visitedIds = _visited.map(v => v.id);
    const container = document.getElementById('stack-container');

    // Reorder: move visited cards to front in order
    for (const v of _visited) {
      const cardId = `card-${v.id}`;
      const card = document.getElementById(cardId);
      if (card) {
        card.style.display = '';
        card.dataset.historyHidden = 'false';
      }
    }

    // Rebuild stack with only visible cards
    const filteredCards = _visited
      .map(v => document.getElementById(`card-${v.id}`))
      .filter(Boolean);

    Stack.setFilteredCards(filteredCards);

    // Inject "find in carousel" button on each card
    for (const v of _visited) {
      const card = document.getElementById(`card-${v.id}`);
      if (!card) continue;
      // Don't double-add
      if (card.querySelector('.history-locate-btn')) continue;
      const btn = document.createElement('button');
      btn.className = 'history-locate-btn';
      btn.dataset.locateId = v.id;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Find in carousel`;
      card.querySelector('.card-content')?.appendChild(btn);
    }

    // Go to the most recent
    Stack.goTo(Stack.getCardCount() - 1);
  }

  function _exitHistoryMode() {
    _toggleBtn.classList.remove('active');
    _labelEl.classList.remove('visible');

    // Remove locate buttons
    document.querySelectorAll('.history-locate-btn').forEach(b => b.remove());

    // Restore all cards
    const allCards = document.querySelectorAll('#stack-container .card');
    allCards.forEach(c => {
      c.style.display = '';
      delete c.dataset.historyHidden;
    });

    // Restore full card set
    Stack.clearFilter();

    // Return to saved position
    Stack.goTo(_savedIndex);
  }

  /**
   * Called when a link is clicked during history mode — exit and navigate
   */
  function exitAndNavigate(id) {
    if (_historyMode) {
      _historyMode = false;
      _toggleBtn.classList.remove('active');
      _labelEl.classList.remove('visible');

      document.querySelectorAll('.history-locate-btn').forEach(b => b.remove());

      const allCards = document.querySelectorAll('#stack-container .card');
      allCards.forEach(c => {
        c.style.display = '';
        delete c.dataset.historyHidden;
      });

      Stack.clearFilter();
    }
  }

  return { init, push, isHistoryMode, exitAndNavigate };
})();
