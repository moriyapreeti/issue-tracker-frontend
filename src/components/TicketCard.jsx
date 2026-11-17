import { Avatar, PriorityBadge, TypeMark } from './Badges';

export default function TicketCard({ ticket, dragging = false, showProject = false }) {
  return (
    <div className={`rounded-lg bg-white p-3 text-left shadow-card transition-shadow hover:shadow-md ${dragging ? 'rotate-1 shadow-lift' : ''}`}>
      <p className="text-sm font-semibold leading-snug">{ticket.title}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TypeMark type={ticket.type} />
          <span className="text-xs font-semibold text-ink-500">{ticket.projectKey}-{ticket.id}</span>
          {showProject && <span className="text-xs text-ink-300">{ticket.projectName}</span>}
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <Avatar user={ticket.assignee} />
        </div>
      </div>
    </div>
  );
}
