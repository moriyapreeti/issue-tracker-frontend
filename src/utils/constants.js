export const STATUSES = [
  { key: 'TODO', label: 'To do', bar: 'bg-slate-400', chip: 'bg-slate-100 text-slate-700' },
  { key: 'IN_PROGRESS', label: 'In progress', bar: 'bg-brand-600', chip: 'bg-brand-50 text-brand-700' },
  { key: 'DONE', label: 'Done', bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
];

export const PRIORITIES = [
  { key: 'LOW', label: 'Low', chip: 'bg-slate-100 text-slate-600' },
  { key: 'MEDIUM', label: 'Medium', chip: 'bg-sky-50 text-sky-700' },
  { key: 'HIGH', label: 'High', chip: 'bg-amber-50 text-amber-700' },
  { key: 'CRITICAL', label: 'Critical', chip: 'bg-red-50 text-red-700' },
];

export const TYPES = [
  { key: 'BUG', label: 'Bug', color: '#DC2626' },
  { key: 'TASK', label: 'Task', color: '#0E7C7B' },
  { key: 'STORY', label: 'Story', color: '#7C3AED' },
];

export const ROLES = ['ADMIN', 'MANAGER', 'DEVELOPER'];

export const byKey = (list, key) => list.find((x) => x.key === key) || list[0];
