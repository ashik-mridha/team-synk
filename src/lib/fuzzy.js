/**
 * Subsequence fuzzy score: every query character must appear in order. Consecutive runs and
 * matches at word starts score higher; returns -1 when there is no match.
 */
export function fuzzyScore(query, text) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = text.toLowerCase();

  let score = 0;
  let from = 0;
  let streak = 0;
  for (const char of q) {
    const index = t.indexOf(char, from);
    if (index === -1) return -1;
    const wordStart = index === 0 || /[\s\-_/]/.test(t[index - 1]);
    streak = index === from ? streak + 1 : 0;
    score += 1 + streak * 2 + (wordStart ? 3 : 0);
    from = index + 1;
  }
  // Shorter targets rank above longer ones with the same match quality.
  return score - t.length * 0.01;
}

export function fuzzyFilter(items, query, getText) {
  if (!query.trim()) return items;
  return items
    .map((item) => ({ item, score: fuzzyScore(query, getText(item)) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
