/**
 * carousel.js — Smooth inertia scroll with card tilt physics
 */
const Carousel = (() => {
  let _track = null;
  let _observer = null;
  let _scrollRAF = null;
  let _navId = 0;

  // Physics state for inertia scrolling
  let _velocity = 0;
  let _targetVelocity = 0;
  let _lastScrollLeft = 0;
  let _isEdgeScrolling = false;
  let _edgeDir = 0;
  let _physicsRunning = false;

  const EDGE_SPEED = 12;         // max edge hover speed
  const EDGE_ACCEL = 0.4;        // edge hover acceleration
  const WHEEL_IMPULSE = 0.9;     // wheel delta multiplier
  const FRICTION = 0.92;         // velocity decay per frame (higher = more slide)
  const VELOCITY_THRESHOLD = 0.3; // stop below this
  const MAX_TILT = 4;            // max card tilt in degrees
  const TILT_SMOOTHING = 0.15;   // how quickly tilt follows velocity

  function init(trackEl) {
    _track = trackEl;
    _lastScrollLeft = _track.scrollLeft;
    _setupIntersectionObserver();
    _setupEdgeScroll();
    _setupWheelScroll();
    _setupTouchSwipe();
    _startPhysicsLoop();
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
   * Edge hover: sets a target velocity that the physics loop accelerates toward
   */
  function _setupEdgeScroll() {
    const leftZone = document.getElementById('scroll-zone-left');
    const rightZone = document.getElementById('scroll-zone-right');

    if (leftZone) {
      leftZone.addEventListener('mouseenter', () => { _isEdgeScrolling = true; _edgeDir = -1; });
      leftZone.addEventListener('mouseleave', () => { if (_edgeDir === -1) _isEdgeScrolling = false; });
    }
    if (rightZone) {
      rightZone.addEventListener('mouseenter', () => { _isEdgeScrolling = true; _edgeDir = 1; });
      rightZone.addEventListener('mouseleave', () => { if (_edgeDir === 1) _isEdgeScrolling = false; });
    }
  }

  /**
   * Mousewheel adds impulse to velocity (not direct scrollLeft)
   */
  function _setupWheelScroll() {
    document.addEventListener('wheel', (e) => {
      // Let overlay scroll normally when open
      const overlay = document.getElementById('overlay');
      if (overlay && overlay.classList.contains('active')) return;

      // Let truly scrollable inner elements scroll (only if they have overflow)
      const scrollable = e.target.closest && e.target.closest('.overlay-card');
      if (scrollable && scrollable.scrollHeight > scrollable.clientHeight) return;

      e.preventDefault();
      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      _velocity += delta * WHEEL_IMPULSE;
    }, { passive: false });
  }

  function _setupTouchSwipe() {
    let startX = 0, startY = 0, startTime = 0;
    let lastTouchX = 0;

    _track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      lastTouchX = startX;
      startTime = performance.now();
      _velocity = 0; // kill inertia on touch
    }, { passive: true });

    _track.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - lastTouchX;
      lastTouchX = e.touches[0].clientX;
      _track.scrollLeft -= dx;
      _velocity = -dx * 2; // track finger velocity
    }, { passive: true });

    _track.addEventListener('touchend', (e) => {
      // Let inertia carry from the last velocity
      // Already set in touchmove
    }, { passive: true });
  }

  /**
   * Main physics loop — handles inertia, edge scrolling, card tilt
   */
  function _startPhysicsLoop() {
    let _currentTilt = 0;

    function tick() {
      // Edge scroll: accelerate toward target speed
      if (_isEdgeScrolling) {
        const target = _edgeDir * EDGE_SPEED;
        _velocity += (target - _velocity) * EDGE_ACCEL;
      }

      // Apply velocity
      if (Math.abs(_velocity) > VELOCITY_THRESHOLD) {
        _track.scrollLeft += _velocity;

        // Friction (deceleration)
        if (!_isEdgeScrolling) {
          _velocity *= FRICTION;
        }
      } else {
        _velocity = 0;
      }

      // --- Card tilt based on scroll velocity ---
      const targetTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, _velocity * 0.15));
      _currentTilt += (targetTilt - _currentTilt) * TILT_SMOOTHING;

      // Apply tilt to visible cards (only those in viewport for performance)
      const cards = _track.querySelectorAll('.card.visible');
      const trackRect = _track.getBoundingClientRect();

      for (const card of cards) {
        const cardRect = card.getBoundingClientRect();
        // Only tilt cards that are in/near the viewport
        if (cardRect.right < trackRect.left - 200 || cardRect.left > trackRect.right + 200) continue;

        // Skip cards still animating pop-in
        if (card.style.animation && card.style.animation !== 'none') continue;

        if (Math.abs(_currentTilt) > 0.05) {
          card.style.transform = `scale(1) rotateY(${_currentTilt}deg)`;
        } else {
          card.style.transform = 'scale(1) rotate(0deg)';
        }
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function observeCard(cardEl) {
    if (_observer) _observer.observe(cardEl);
  }

  /**
   * Smooth scroll to a card with cubic ease-out
   */
  function scrollToCard(cardId) {
    const el = document.getElementById(`card-${cardId}`);
    if (!el) return;

    const id = ++_navId;
    _velocity = 0; // kill inertia

    const trackRect = _track.getBoundingClientRect();
    const cardRect = el.getBoundingClientRect();
    const targetScroll = _track.scrollLeft + (cardRect.left - trackRect.left) - (trackRect.width / 2) + (cardRect.width / 2);
    const start = _track.scrollLeft;
    const distance = targetScroll - start;
    const duration = Math.min(700, Math.max(300, Math.abs(distance) * 0.4));
    const startTime = performance.now();

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 4); // quartic ease-out
      _track.scrollLeft = start + distance * ease;
      if (t < 1 && _navId === id) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);

    // Highlight pulse
    setTimeout(() => {
      if (_navId !== id) return;
      el.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.4)';
      el.style.transition = 'box-shadow 0.4s ease';
      setTimeout(() => {
        if (_navId !== id) return;
        el.style.boxShadow = '';
      }, 1200);
    }, duration + 100);
  }

  return { init, observeCard, scrollToCard };
})();
