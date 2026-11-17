import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, closestCorners, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { STATUSES } from '../utils/constants';
import TicketCard from './TicketCard';

function DraggableCard({ ticket }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: String(ticket.id) });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className={`cursor-grab touch-manipulation active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}>
      <TicketCard ticket={ticket} />
    </div>
  );
}

function Column({ status, tickets }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.key });
  return (
    <section className="flex min-h-[24rem] min-w-[17rem] flex-1 flex-col rounded-xl bg-slate-200/60 p-2" aria-label={status.label}>
      <header className="flex items-center gap-2 px-2 pb-3 pt-2">
        <span className={`h-2.5 w-2.5 rounded-full ${status.bar}`} />
        <h3 className="text-sm font-bold">{status.label}</h3>
        <span className="ml-auto rounded-md bg-white px-1.5 text-xs font-semibold text-ink-500">{tickets.length}</span>
      </header>
      <div ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 rounded-lg p-1 transition-colors ${isOver ? 'bg-brand-100/70 ring-2 ring-brand-500/40' : ''}`}>
        {tickets.map((t) => <DraggableCard key={t.id} ticket={t} />)}
        {tickets.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-500">Drop tickets here</p>}
      </div>
    </section>
  );
}

export default function KanbanBoard({ tickets, onMove }) {
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );
  const active = tickets.find((t) => String(t.id) === activeId);

  const handleEnd = ({ active: a, over }) => {
    setActiveId(null);
    if (!over) return;
    const ticket = tickets.find((t) => String(t.id) === a.id);
    if (ticket && ticket.status !== over.id) onMove(ticket, over.id);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={({ active: a }) => setActiveId(String(a.id))} onDragEnd={handleEnd} onDragCancel={() => setActiveId(null)}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {STATUSES.map((s) => <Column key={s.key} status={s} tickets={tickets.filter((t) => t.status === s.key)} />)}
      </div>
      <DragOverlay>{active ? <TicketCard ticket={active} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}
