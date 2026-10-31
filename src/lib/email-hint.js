/**
 * Soft typo detection for email addresses. It only ever produces a suggestion ("Did you mean
 * you@gmail.com?"); it never rejects an address, so uncommon domains and TLDs keep working.
 */
const POPULAR_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'live.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
];

/** Mistyped endings of ".com" that are not real TLDs. */
const COM_TYPOS = new Set([
  'con',
  'som',
  'cmo',
  'vom',
  'xom',
  'comm',
  'ocm',
  'cim',
  'coom',
  'cpm',
  'clm',
  'om',
  'cm',
]);

/** Plain Damerau-style distance (insert, delete, substitute, adjacent swap), capped for tiny inputs. */
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** Returns a corrected full address, or null when the input looks fine (or is not an email yet). */
export function suggestEmail(input) {
  const value = (input ?? '').trim();
  const at = value.lastIndexOf('@');
  if (at < 1) return null;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1).toLowerCase();
  const dot = domain.lastIndexOf('.');
  if (dot < 1 || dot === domain.length - 1) return null;
  if (POPULAR_DOMAINS.includes(domain)) return null;

  const label = domain.slice(0, dot);
  const tld = domain.slice(dot + 1);

  // gmail.som -> gmail.com, mycompany.con -> mycompany.com
  if (COM_TYPOS.has(tld)) return `${local}@${label}.com`;

  // gmial.com -> gmail.com, gmail.co -> gmail.com (one edit away from a major provider)
  const close = POPULAR_DOMAINS.find((popular) => distance(domain, popular) === 1);
  return close ? `${local}@${close}` : null;
}
