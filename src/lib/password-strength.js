export function scorePassword(password) {
  if (password.length === 0) return { score: 0, label: 'Too short' };
  if (password.length < 8) return { score: 1, label: 'Too short' };
  let points = 0;
  if (password.length >= 12) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/\d/.test(password) && /[A-Za-z]/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;
  const score = Math.min(4, Math.max(1, points));
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] };
}
