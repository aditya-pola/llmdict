/**
 * stack.js — Stacked card navigation with inertia scroll + card tilt
 * One card visible at center, others peek from sides with vertical titles
 * Mousewheel / edge hover / touch swipe to navigate between cards
 */
const Stack = (() => {
  let _container = null;
  let _cards = [];           // ordered array of card DOM elements
  let _currentIndex = 0;
  let _velocity = 0;
  let _accumulator = 0;      // sub-card scroll accumulation
  let _isEdgeScrolling = false;
  let _edgeDir = 0;
  let _currentTilt = 0;
  let _navId = 0;

  // Responsive: on mobile, only 1 card peeks each side but peeks MORE
  function getIsMobile() { return window.innerWidth < 768; }
  let PEEK_WIDTH = getIsMobile() ? 40 : 48;
  let PEEK_GAP = getIsMobile() ? 4 : 4;
  let MAX_PEEK = getIsMobile() ? 1 : 5;

  window.addEventListener('resize', () => {
    const m = getIsMobile();
    PEEK_WIDTH = m ? 40 : 48;
    PEEK_GAP = m ? 4 : 4;
    MAX_PEEK = m ? 1 : 5;
  });
  const WHEEL_IMPULSE = 0.006;    // wheel delta → accumulator (lower = slower)
  const EDGE_ACCEL = 0.003;       // edge hover accumulation rate per frame
  const FRICTION = 0.85;
  const SNAP_THRESHOLD = 0.5;     // accumulator > this → navigate
  let _lastSnapTime = 0;
  const SNAP_COOLDOWN = 200;      // ms between snaps to prevent rapid-fire
  const MAX_TILT = 3;
  const TILT_SMOOTHING = 0.1;

  function init(containerEl) {
    _container = containerEl;
    _setupWheelScroll();
    _setupEdgeScroll();
    _setupTouchSwipe();
    _startPhysicsLoop();
  }

  function addCard(cardEl) {
    _cards.push(cardEl);
    _container.appendChild(cardEl);
  }

  function getCardCount() {
    return _cards.length;
  }

  /**
   * Position all cards relative to the active index
   */
  function _layout(tiltDeg) {
    const cardWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-width')) || 476;

    // How many cards on either side of the active card to keep populated.
    // Anything within this radius gets its full inner HTML built (lazy
    // term cards are realized as the user navigates closer to them).
    const POPULATE_RADIUS = MAX_PEEK + 3;

    for (let i = 0; i < _cards.length; i++) {
      const card = _cards[i];
      const offset = i - _currentIndex;
      const absOff = Math.abs(offset);

      // Remove all state classes
      card.classList.remove('card--active', 'card--left', 'card--right', 'card--buffer', 'card--hidden');

      // Lazy-populate term cards entering populate radius
      if (absOff <= POPULATE_RADIUS && card.dataset.entryId && card.dataset.populated !== '1') {
        if (typeof Cards !== 'undefined' && Cards.populateTermCard) {
          Cards.populateTermCard(card);
        }
      }

      if (offset === 0) {
        // Active card
        card.classList.add('card--active');
        card.style.transform = `translateX(0) scale(1) rotateY(${tiltDeg}deg)`;
        card.style.opacity = '1';
        card.style.zIndex = 50;
        card.style.pointerEvents = 'auto';
      } else if (absOff <= MAX_PEEK) {
        // Peeking card
        const dir = offset < 0 ? 'left' : 'right';
        card.classList.add(`card--${dir}`);

        // Position peek cards
        const peekOffset = (PEEK_WIDTH + PEEK_GAP) * absOff;
        const tx = offset < 0
          ? -(cardWidth / 2 + peekOffset)
          : (cardWidth / 2 + peekOffset);

        const scale = 1 - absOff * 0.015;
        const opacity = Math.max(0.3, 0.85 - absOff * 0.1);
        const z = MAX_PEEK - absOff + 1;

        card.style.transform = `translateX(${tx}px) scale(${scale}) rotateY(${tiltDeg * 0.3}deg)`;
        card.style.opacity = String(opacity);
        card.style.zIndex = String(z);
        card.style.pointerEvents = 'auto';
        card.style.cursor = 'pointer';
      } else if (absOff === MAX_PEEK + 1) {
        // Buffer: one step beyond peek range. Kept in the render tree
        // (visibility: hidden, not display: none) so that when this card
        // becomes the next peek, the transition has a starting frame to
        // interpolate from — otherwise incoming cards "cut" instead of slide.
        card.classList.add('card--buffer');
        const tx = offset < 0 ? -800 : 800;
        card.style.transform = `translateX(${tx}px) scale(0.8)`;
        card.style.opacity = '0';
        card.style.zIndex = '0';
        card.style.pointerEvents = 'none';
      } else {
        // Fully hidden: display: none to keep OOM fix from 95fa405.
        card.classList.add('card--hidden');
        const tx = offset < 0 ? -800 : 800;
        card.style.transform = `translateX(${tx}px) scale(0.8)`;
        card.style.opacity = '0';
        card.style.zIndex = '0';
        card.style.pointerEvents = 'none';
      }
    }
  }

  /**
   * Navigate to a specific card index
   */
  function goTo(index) {
    if (index < 0) index = 0;
    if (index >= _cards.length) index = _cards.length - 1;
    _currentIndex = index;
    _accumulator = 0;
    _layout(_currentTilt);
    _updateMobilePeekLabels();
    _kick(); // resume the loop in case it was idling, e.g. for tilt to settle
  }

  function _updateMobilePeekLabels() {
    const leftLabel = document.getElementById('mobile-peek-left');
    const rightLabel = document.getElementById('mobile-peek-right');
    if (!leftLabel || !rightLabel) return;

    // Previous card label
    if (_currentIndex > 0) {
      const prevCard = _cards[_currentIndex - 1];
      const prevLabel = prevCard.querySelector('.peek-label span');
      leftLabel.textContent = prevLabel ? prevLabel.textContent : '';
    } else {
      leftLabel.textContent = '';
    }

    // Next card label
    if (_currentIndex < _cards.length - 1) {
      const nextCard = _cards[_currentIndex + 1];
      const nextLabel = nextCard.querySelector('.peek-label span');
      rightLabel.textContent = nextLabel ? nextLabel.textContent : '';
    } else {
      rightLabel.textContent = '';
    }
  }

  /**
   * Navigate to a card by its DOM id
   */
  function goToCard(cardId) {
    const el = document.getElementById(`card-${cardId}`);
    if (!el) return;
    const idx = _cards.indexOf(el);
    if (idx >= 0) {
      _navId++;
      goTo(idx);
    }
  }

  function getCurrentCard() {
    return _cards[_currentIndex] || null;
  }

  // --- Scroll inputs ---

  function _setupWheelScroll() {
    document.addEventListener('wheel', (e) => {
      const overlay = document.getElementById('overlay');
      if (overlay && overlay.classList.contains('active')) return;

      // Let history bar and search results scroll natively
      if (e.target.closest('.history-bar, .search-results, .overlay-card')) return;

      e.preventDefault();
      // Pick whichever axis the user was dominantly scrolling on. A pure
      // priority-with-fallback on deltaY misses touchpad horizontal swipes,
      // because a two-finger horizontal gesture usually produces a small but
      // non-zero deltaY from finger jitter, which would win and drown out
      // the intended deltaX.
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      _accumulator += delta * WHEEL_IMPULSE;
      _velocity = delta * WHEEL_IMPULSE;
      _kick();
    }, { passive: false });
  }

  function _setupEdgeScroll() {
    const left = document.getElementById('scroll-zone-left');
    const right = document.getElementById('scroll-zone-right');
    if (left) {
      left.addEventListener('mouseenter', () => { _isEdgeScrolling = true; _edgeDir = -1; _kick(); });
      left.addEventListener('mouseleave', () => { if (_edgeDir === -1) _isEdgeScrolling = false; });
    }
    if (right) {
      right.addEventListener('mouseenter', () => { _isEdgeScrolling = true; _edgeDir = 1; _kick(); });
      right.addEventListener('mouseleave', () => { if (_edgeDir === 1) _isEdgeScrolling = false; });
    }
  }

  function _setupTouchSwipe() {
    let startX = 0, startY = 0, startTime = 0;

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = performance.now();
      _velocity = 0;
      _accumulator = 0;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const overlay = document.getElementById('overlay');
      if (overlay && overlay.classList.contains('active')) return;
      if (e.target.closest('.history-bar, .search-results, .search-wrapper, .globe-overlay, .shortcut-overlay')) return;

      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      if (Math.abs(dx) < 25 || Math.abs(dx) < Math.abs(dy)) return;

      // Drop rapid repeat swipes that would overwrite a transition mid-flight.
      const now = performance.now();
      if (now - _lastSnapTime < SNAP_COOLDOWN + 50) return;
      _lastSnapTime = now;

      // One card per swipe. Velocity-based jumps were inconsistent because
      // dx/dt varies wildly with release timing on visually identical flicks.
      const direction = dx < 0 ? 1 : -1;
      const target = _currentIndex + direction;
      if (target >= 0 && target < _cards.length) goTo(target);
    }, { passive: true });
  }

  // --- Physics loop ---
  // The loop schedules itself only while there is motion to compute. When
  // velocities and tilt settle to ~0, tick() returns without queuing the
  // next rAF. _kick() restarts it on user input or programmatic navigation.

  let _rafId = null;
  let _settledFrames = 0; // require N consecutive settled frames before stopping

  function _kick() {
    if (_rafId === null) {
      _settledFrames = 0;
      _rafId = requestAnimationFrame(_tick);
    }
  }

  function _tick() {
    // Edge hover: accumulate (this is itself a source of motion)
    if (_isEdgeScrolling) {
      _accumulator += _edgeDir * EDGE_ACCEL;
      _velocity = _edgeDir * EDGE_ACCEL;
    }

    // Snap when accumulator crosses threshold (with cooldown)
    const now = performance.now();
    if (now - _lastSnapTime > SNAP_COOLDOWN) {
      if (_accumulator >= SNAP_THRESHOLD) {
        goTo(_currentIndex + 1);
        _lastSnapTime = now;
      } else if (_accumulator <= -SNAP_THRESHOLD) {
        goTo(_currentIndex - 1);
        _lastSnapTime = now;
      }
    }

    // Friction on accumulator
    if (!_isEdgeScrolling) {
      _accumulator *= FRICTION;
      if (Math.abs(_accumulator) < 0.01) _accumulator = 0;
    }

    // Velocity decay
    _velocity *= FRICTION;
    if (Math.abs(_velocity) < 0.001) _velocity = 0;

    // Tilt: only update the active card's rotateY (don't re-layout everything)
    const targetTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, _velocity * 300));
    _currentTilt += (targetTilt - _currentTilt) * TILT_SMOOTHING;
    if (Math.abs(_currentTilt) < 0.05) _currentTilt = 0;

    const activeCard = _cards[_currentIndex];
    if (activeCard && Math.abs(_currentTilt) > 0.05) {
      activeCard.style.transform = `translateX(0) scale(1) rotateY(${_currentTilt}deg)`;
    } else if (activeCard) {
      activeCard.style.transform = 'translateX(0) scale(1) rotateY(0deg)';
    }

    // Decide whether the loop has quiesced
    const settled =
      !_isEdgeScrolling &&
      _accumulator === 0 &&
      _velocity === 0 &&
      _currentTilt === 0;

    if (settled) {
      _settledFrames++;
      if (_settledFrames >= 2) {
        _rafId = null;
        return; // stop the loop until next _kick
      }
    } else {
      _settledFrames = 0;
    }

    _rafId = requestAnimationFrame(_tick);
  }

  function _startPhysicsLoop() {
    _kick();
  }

  // --- History mode: filtered card set ---
  let _allCards = []; // full set backup

  function setFilteredCards(filteredCards) {
    if (_allCards.length === 0) _allCards = [..._cards];
    _cards = filteredCards;
    _currentIndex = Math.min(_currentIndex, _cards.length - 1);
  }

  function clearFilter() {
    if (_allCards.length > 0) {
      _cards = [..._allCards];
      _allCards = [];
    }
  }

  return { init, addCard, getCardCount, goTo, goToCard, getCurrentCard, setFilteredCards, clearFilter };
})();
