const PRIORITIES = {
  urgent: 'high',
  high: 'high',
  h: 'high',
  medium: 'medium',
  med: 'medium',
  m: 'medium',
  low: 'low',
  l: 'low',
};

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function atNoon(date) {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

/** Understands today, tomorrow, mon..sun (next one), +3d, 3d, nextweek and YYYY-MM-DD. */
export function parseDue(value, now = new Date()) {
  const text = value.toLowerCase();
  if (text === 'today') return atNoon(now);
  if (text === 'tomorrow' || text === 'tom') return atNoon(new Date(now.getTime() + 86_400_000));
  if (text === 'nextweek') return atNoon(new Date(now.getTime() + 7 * 86_400_000));

  const relative = /^\+?(\d{1,3})d$/.exec(text);
  if (relative) return atNoon(new Date(now.getTime() + Number(relative[1]) * 86_400_000));

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (iso) {
    const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12);
    // Month/day overflow (2027-13-45) rolls over silently, so require an exact round trip.
    return date.getMonth() === Number(iso[2]) - 1 && date.getDate() === Number(iso[3])
      ? date
      : null;
  }

  const weekday = WEEKDAYS.indexOf(text.slice(0, 3));
  if (weekday !== -1 && text.length >= 3) {
    const ahead = (weekday - now.getDay() + 7) % 7 || 7;
    return atNoon(new Date(now.getTime() + ahead * 86_400_000));
  }
  return null;
}

function findMember(query, members) {
  const q = query.toLowerCase();
  return members.find((m) => {
    const name = m.name.toLowerCase();
    const words = name.split(/\s+/);
    const local = (m.email ?? '').split('@')[0].toLowerCase();
    return (
      name.replace(/\s+/g, '').startsWith(q) ||
      words.some((w) => w.startsWith(q)) ||
      local.startsWith(q)
    );
  });
}

/**
 * Turns "Fix login bug !high @rahim #frontend due:fri" into fields. Anything that is not a
 * recognised token stays in the title, so a typo never silently drops text.
 */
export function parseQuickAdd(input, { members = [], now = new Date() } = {}) {
  const result = {
    title: '',
    priority: null,
    assignee: null,
    assigneeName: null,
    labels: [],
    dueDate: null,
  };
  const words = [];

  for (const token of input.trim().split(/\s+/).filter(Boolean)) {
    const priority = /^!(\w+)$/.exec(token);
    const mention = /^@(\S+)$/.exec(token);
    const label = /^#(\S+)$/.exec(token);
    const due = /^due:(\S+)$/i.exec(token);

    if (priority && PRIORITIES[priority[1].toLowerCase()]) {
      result.priority = PRIORITIES[priority[1].toLowerCase()];
    } else if (mention && findMember(mention[1], members)) {
      const member = findMember(mention[1], members);
      result.assignee = member.userId;
      result.assigneeName = member.name;
    } else if (label) {
      if (!result.labels.includes(label[1])) result.labels.push(label[1]);
    } else if (due && parseDue(due[1], now)) {
      result.dueDate = parseDue(due[1], now).toISOString();
    } else {
      words.push(token);
    }
  }

  result.title = words.join(' ');
  return result;
}
