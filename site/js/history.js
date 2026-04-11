/**
 * history.js — Track visited cards, render history reel
 */
const History = (() => {
  let _bar = null;
  let _visited = []; // array of { id, label }
  const MAX_HISTORY = 30;

  function init(barEl) {
    _bar = barEl;
  }

  function push(id, label) {
    // Don't duplicate the most recent
    if (_visited.length > 0 && _visited[_visited.length - 1].id === id) return;
    // Remove earlier duplicate
    _visited = _visited.filter(v => v.id !== id);
    _visited.push({ id, label });
    if (_visited.length > MAX_HISTORY) _visited.shift();
    _render();
  }

  function _render() {
    if (!_bar) return;
    _bar.innerHTML = _visited.map(v =>
      `<span class="history-chip" data-target="${v.id}">${v.label}</span>`
    ).join('');
    // Scroll to end
    _bar.scrollLeft = _bar.scrollWidth;
  }

  return { init, push };
})();
