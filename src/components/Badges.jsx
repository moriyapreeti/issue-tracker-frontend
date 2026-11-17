import { PRIORITIES, STATUSES, TYPES, byKey } from '../utils/constants';

export const StatusBadge = ({ status }) => {
  const s = byKey(STATUSES, status);
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${s.chip}`}>{s.label}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const p = byKey(PRIORITIES, priority);
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${p.chip}`}>{p.label}</span>;
};

export const TypeMark = ({ type, withLabel = false }) => {
  const t = byKey(TYPES, type);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500" title={t.label}>
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: t.color }} />
      {withLabel && t.label}
    </span>
  );
};

const AVATAR_COLORS = ['#0E7C7B', '#7C3AED', '#C2410C', '#1D4ED8', '#BE185D', '#4D7C0F', '#B45309'];

export function Avatar({ user, size = 'h-7 w-7 text-xs' }) {
  if (!user) {
    return <span className={`inline-flex ${size} items-center justify-center rounded-full border border-dashed border-ink-300 text-ink-300`} title="Unassigned">?</span>;
  }
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className={`inline-flex ${size} items-center justify-center rounded-full font-bold text-white ring-2 ring-white`}
      style={{ background: AVATAR_COLORS[user.id % AVATAR_COLORS.length] }} title={user.name}>
      {initials}
    </span>
  );
}

export const KeyChip = ({ children }) => (
  <span className="rounded-md bg-ink-900 px-1.5 py-0.5 font-display text-xs font-bold text-white">{children}</span>
);
