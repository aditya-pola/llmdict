/**
 * data.js — Load and index the glossary data
 */
const Data = (() => {
  let _categories = [];
  let _entries = {};
  let _entryIndex = []; // flat list for search
  let _searchIndex = []; // [{entry, name, expansion, oneliner}] all lower-cased once

  async function load() {
    const res = await fetch('data/glossary.json');
    const json = await res.json();
    _categories = json.categories;
    _entries = json.entries;
    _entryIndex = Object.values(_entries);
    // Pre-lowercase search fields once at load time so per-keystroke search
    // is a small array of cheap String.includes checks instead of
    // recomputing toLowerCase() for every entry on every keystroke.
    _searchIndex = _entryIndex.map(e => ({
      entry: e,
      name: (e.name || '').toLowerCase(),
      expansion: (e.expansion || '').toLowerCase(),
      oneliner: (e.oneliner || '').toLowerCase(),
    }));
    return { categories: _categories, entries: _entries };
  }

  function getEntry(id) {
    return _entries[id] || null;
  }

  function getCategories() {
    return _categories;
  }

  function getAllEntries() {
    return _entryIndex;
  }

  /**
   * Search entries by query string across name, expansion, oneliner, explanation
   */
  function search(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const out = [];
    for (let i = 0; i < _searchIndex.length; i++) {
      const r = _searchIndex[i];
      let score = 0;
      if (r.name.includes(q)) score += 10;
      if (r.name.startsWith(q)) score += 5;
      if (r.expansion.includes(q)) score += 4;
      if (r.oneliner.includes(q)) score += 2;
      if (score > 0) out.push({ entry: r.entry, score });
    }
    out.sort((a, b) => b.score - a.score);
    return out.slice(0, 12).map(r => r.entry);
  }

  /**
   * Build a map of entry ID -> all IDs that reference it
   * (for building the graph and related terms)
   */
  function buildRelationshipMap() {
    const map = {};
    for (const e of _entryIndex) {
      const related = e.related || [];
      for (const rid of related) {
        if (!map[e.id]) map[e.id] = new Set();
        map[e.id].add(rid);
        // bidirectional
        if (!map[rid]) map[rid] = new Set();
        map[rid].add(e.id);
      }
    }
    // convert sets to arrays
    for (const k in map) map[k] = [...map[k]];
    return map;
  }

  return { load, getEntry, getCategories, getAllEntries, search, buildRelationshipMap };
})();
