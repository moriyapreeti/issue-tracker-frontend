export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin text-brand-600 ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex h-64 items-center justify-center gap-3 text-ink-500" role="status">
      <Spinner className="h-6 w-6" /> <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="panel flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-500">{hint}</p>}
      {action}
    </div>
  );
}
