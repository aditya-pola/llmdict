/**
 * carousel.js — Horizontal scroll, edge hover, mousewheel, touch swipe, card animations
 */
const Carousel = (() => {
  let _track = null;
  let _observer = null;
  let _scrollRAF = null;
  let _scrollDir = 0; // -1 left, 0 stop, 1 right
  let _navId = 0;
  const SCROLL_SPEED = 6;

  function init(trackEl) {
    _track = trackEl;
    _setupIntersectionObserver();
    _setupEdgeScroll();
    _setupWheelScroll();
    _setupTouchSwipe();
  }

  function _setupIntersectionObserver() {
    _observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
          entry.target.classList.add('visible');
          entry.target.addEventListener('animationend', () => {
            entry.target.style.animation = 'none';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'scale(1) rotate(0deg)';
          }, { once: true });
        }
      }
    }, {
      root: _track,
      threshold: 0.1
    });
  }

  /**
   * Edge auto-scroll using rAF loop (more reliable than setInterval)
   */
  function _setupEdgeScroll() {
    const leftZone = document.getElementById('scroll-zone-left');
    const rightZone = document.getElementById('scroll-zone-right');

    function tick() {
      if (_scrollDir !== 0) {
        _track.scrollLeft += _scrollDir * SCROLL_SPEED;
        _scrollRAF = requestAnimationFrame(tick);
      }
    }

    function startScroll(dir) {
      _scrollDir = dir;
      if (!_scrollRAF) _scrollRAF = requestAnimationFrame(tick);
    }

    function stopScroll() {
      _scrollDir = 0;
      if (_scrollRAF) { cancelAnimationFrame(_scrollRAF); _scrollRAF = null; }
    }

    if (leftZone) {
      leftZone.addEventListener('mouseenter', () => startScroll(-1));
      leftZone.addEventListener('mouseleave', stopScroll);
    }
    if (rightZone) {
      rightZone.addEventListener('mouseenter', () => startScroll(1));
      rightZone.addEventListener('mouseleave', stopScroll);
    }
  }

  /**
   * Mousewheel → horizontal scroll
   * Listen on document — any vertical wheel scrolls the carousel horizontally
   */
  function _setupWheelScroll() {
    document.addEventListener('wheel', (e) => {
      // Don't hijack scroll when overlay is open
      const overlay = document.getElementById('overlay');
      if (overlay && overlay.classList.contains('active')) return;

      // Don't hijack if scrolling inside an overflowing card
      if (e.target.closest && e.target.closest('.term-list, .category-list, .term-explanation')) return;

      e.preventDefault();
      _track.scrollLeft += (e.deltaY !== 0 ? e.deltaY : e.deltaX);
    }, { passive: false });
  }

  function _setupTouchSwipe() {
    let startX = 0, startY = 0;
    _track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    _track.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) {
        const step = 504; // card width + gap
        _track.scrollBy({ left: dx < 0 ? step : -step, behavior: 'smooth' });
      }
    }, { passive: true });
  }

  function observeCard(cardEl) {
    if (_observer) _observer.observe(cardEl);
  }

  function scrollToCard(cardId) {
    const el = document.getElementById(`card-${cardId}`);
    if (!el) return;

    const id = ++_navId;

    // Calculate target scroll position to center the card
    const trackRect = _track.getBoundingClientRect();
    const cardRect = el.getBoundingClientRect();
    const targetScroll = _track.scrollLeft + (cardRect.left - trackRect.left) - (trackRect.width / 2) + (cardRect.width / 2);

    // Smooth scroll via JS (since we removed CSS scroll-behavior)
    const start = _track.scrollLeft;
    const distance = targetScroll - start;
    const duration = Math.min(600, Math.abs(distance) * 0.5);
    const startTime = performance.now();

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
      _track.scrollLeft = start + distance * ease;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    setTimeout(() => {
      if (_navId !== id) return;
      el.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.4)';
      el.style.transition = 'box-shadow 0.4s ease';
      setTimeout(() => {
        if (_navId !== id) return;
        el.style.boxShadow = '';
      }, 1200);
    }, 400);
  }

  return { init, observeCard, scrollToCard };
})();
