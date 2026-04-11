/**
 * search.js — Fuzzy search with instant dropdown results
 */
const Search = (() => {
  let _input = null;
  let _results = null;
  let _onNavigate = null;

  function init(inputEl, resultsEl, onNavigate) {
    _input = inputEl;
    _results = resultsEl;
    _onNavigate = onNavigate;

    _input.addEventListener('input', _onInput);
    _input.addEventListener('focus', _onInput);
    _input.addEventListener('keydown', _onKeydown);
    document.addEventListener('click', (e) => {
      if (!_input.contains(e.target) && !_results.contains(e.target)) {
        _hide();
      }
    });
  }

  function _onInput() {
    const query = _input.value.trim();
    const results = Data.search(query);
    if (results.length === 0) {
      _hide();
      return;
    }
    _results.innerHTML = results.map(e => `
      <div class="search-result-item" data-target="${e.id}">
        <div class="result-name">${e.name}</div>
        <div class="result-oneliner">${e.oneliner || ''}</div>
      </div>
    `).join('');
    _results.classList.remove('hidden');

    _results.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.target;
        _input.value = '';
        _hide();
        if (_onNavigate) _onNavigate(id);
      });
    });
  }

  function _onKeydown(e) {
    if (e.key === 'Escape') {
      _input.value = '';
      _hide();
      _input.blur();
    }
  }

  function _hide() {
    _results.classList.add('hidden');
    _results.innerHTML = '';
  }

  return { init };
})();
