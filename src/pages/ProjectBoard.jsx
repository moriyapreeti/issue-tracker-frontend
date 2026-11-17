import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectsApi, ticketsApi, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../utils/helpers';
import KanbanBoard from '../components/KanbanBoard';
import TicketFilters from '../components/TicketFilters';
import TicketForm from '../components/TicketForm';
import Modal from '../components/Modal';
import { PageLoader, Spinner } from '../components/Spinner';
import { Avatar, KeyChip } from '../components/Badges';

const emptyFilters = { q: '', status: '', priority: '', type: '', assigneeId: '', mine: false };

export default function ProjectBoard() {
  const { id } = useParams();
  const toast = useToast();
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ ...emptyFilters, projectId: id });
  const [creating, setCreating] = useState(false);
  const q = useDebounce(filters.q);

  useEffect(() => {
    setProject(null);
    projectsApi.get(id).then(setProject).catch((e) => toast.error(errorMessage(e)));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(() => {
    setRefreshing(true);
    return ticketsApi.search({ ...filters, q, projectId: id, size: 500, sort: 'createdAt,desc' })
      .then((r) => setTickets(r.content))
      .catch((e) => { toast.error(errorMessage(e)); setTickets((t) => t || []); })
      .finally(() => setRefreshing(false));
  }, [id, q, filters.priority, filters.type, filters.assigneeId, filters.mine]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // Optimistic drag & drop: move the card immediately, roll back if the API rejects it
  const move = async (ticket, status) => {
    const previous = tickets;
    setTickets((list) => list.map((t) => (t.id === ticket.id ? { ...t, status } : t)));
    try {
      await ticketsApi.setStatus(ticket.id, status);
    } catch (e) {
      setTickets(previous);
      toast.error(errorMessage(e));
    }
  };

  const create = async (data) => {
    try {
      const t = await ticketsApi.create(data);
      setTickets((list) => [t, ...(list || [])]);
      setCreating(false);
      toast.success('Ticket created');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (!project) return <PageLoader label="Loading board…" />;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><KeyChip>{project.key}</KeyChip><Link to="/projects" className="text-sm text-ink-500 hover:underline">Projects</Link></div>
          <h1 className="mt-1 text-3xl font-bold">{project.name}</h1>
          {project.description && <p className="mt-1 max-w-2xl text-sm text-ink-500">{project.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex -space-x-2">{project.members.slice(0, 5).map((m) => <Avatar key={m.id} user={m} />)}</span>
          <Link to={`/projects/${id}/settings`} className="btn-secondary">Team & settings</Link>
          <button className="btn-primary" onClick={() => setCreating(true)}>New ticket</button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <TicketFilters filters={filters} setFilters={setFilters} members={project.members} hideProject hideStatus />
        {refreshing && <Spinner />}
      </div>

      {tickets === null ? <PageLoader label="Loading tickets…" /> : <KanbanBoard tickets={tickets} onMove={move} />}

      {creating && (
        <Modal title="New ticket" wide onClose={() => setCreating(false)}>
          <TicketForm projects={[project]} lockProject onSubmit={create} onCancel={() => setCreating(false)} />
        </Modal>
      )}
    </div>
  );
}
