/**
 * data.js — Load and index the glossary data
 */
const Data = (() => {
  let _categories = [];
  let _entries = {};
  let _entryIndex = []; // flat list for search

  async function load() {
    const res = await fetch('data/glossary.json');
    const json = await res.json();
    _categories = json.categories;
    _entries = json.entries;
    _entryIndex = Object.values(_entries);
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
    return _entryIndex
      .map(e => {
        let score = 0;
        const name = (e.name || '').toLowerCase();
        const expansion = (e.expansion || '').toLowerCase();
        const oneliner = (e.oneliner || '').toLowerCase();
        if (name.includes(q)) score += 10;
        if (name.startsWith(q)) score += 5;
        if (expansion.includes(q)) score += 4;
        if (oneliner.includes(q)) score += 2;
        return { entry: e, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(r => r.entry);
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
