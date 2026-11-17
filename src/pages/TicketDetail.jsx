import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { projectsApi, ticketsApi, errorMessage, fileUrl } from '../api/client';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import TicketForm from '../components/TicketForm';
import CommentSection from '../components/CommentSection';
import { PageLoader, Spinner } from '../components/Spinner';
import { Avatar, KeyChip, PriorityBadge, TypeMark } from '../components/Badges';
import { PRIORITIES, STATUSES, TYPES, byKey } from '../utils/constants';
import { formatDate } from '../utils/helpers';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);
  const [ticket, setTicket] = useState(null);
  const [project, setProject] = useState(null);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setTicket(null);
    ticketsApi.get(id)
      .then(async (t) => { setTicket(t); setProject(await projectsApi.get(t.projectId)); })
      .catch((e) => { toast.error(errorMessage(e)); navigate('/tickets'); });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ticket || !project) return <PageLoader label="Loading ticket…" />;

  const act = async (fn, okMsg) => {
    try { const res = await fn(); if (okMsg) toast.success(okMsg); return res; } catch (e) { toast.error(errorMessage(e)); }
  };

  const changeStatus = async (e) => { const t = await act(() => ticketsApi.setStatus(id, e.target.value)); if (t) setTicket(t); };
  const changeAssignee = async (e) => { const t = await act(() => ticketsApi.assign(id, e.target.value ? Number(e.target.value) : null)); if (t) setTicket(t); };

  const save = async (data) => {
    const t = await act(() => ticketsApi.update(id, data), 'Ticket updated');
    if (t) { setTicket(t); setEditing(false); }
  };

  const remove = async () => {
    if (!window.confirm('Delete this ticket and its comments? This cannot be undone.')) return;
    const ok = await act(() => ticketsApi.remove(id).then(() => true), 'Ticket deleted');
    if (ok) navigate(`/projects/${ticket.projectId}`);
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Screenshot must be 5MB or smaller');
    setUploading(true);
    const t = await act(() => ticketsApi.upload(id, file), 'Screenshot uploaded');
    if (t) setTicket(t);
    setUploading(false);
  };

  const removeShot = async () => { const t = await act(() => ticketsApi.removeAttachment(id), 'Screenshot removed'); if (t) setTicket(t); };

  const shot = fileUrl(ticket.attachmentUrl);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <KeyChip>{ticket.projectKey}</KeyChip>
        <Link to={`/projects/${ticket.projectId}`} className="hover:underline">{ticket.projectName}</Link>
        <span>/</span><span>{ticket.projectKey}-{ticket.id}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-8">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold leading-tight">{ticket.title}</h1>
              <div className="flex shrink-0 gap-2">
                {ticket.canEdit && <button className="btn-secondary" onClick={() => setEditing(true)}>Edit</button>}
                {ticket.canDelete && <button className="btn-ghost text-red-600 hover:!text-red-700" onClick={remove}>Delete</button>}
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words text-ink-700">{ticket.description || <span className="text-ink-300">No description provided.</span>}</p>
          </div>

          <section aria-label="Screenshot">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Screenshot</h3>
              {ticket.canEdit && (
                <div className="flex gap-2">
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={upload} />
                  <button className="btn-secondary" onClick={() => fileRef.current.click()} disabled={uploading}>{uploading && <Spinner className="h-4 w-4" />} {shot ? 'Replace' : 'Upload'}</button>
                  {shot && <button className="btn-ghost" onClick={removeShot}>Remove</button>}
                </div>
              )}
            </div>
            {shot ? (
              <a href={shot} target="_blank" rel="noreferrer"><img src={shot} alt={`Screenshot for ${ticket.title}`} className="max-h-96 rounded-xl bg-white object-contain shadow-card" /></a>
            ) : (
              <p className="text-sm text-ink-500">No screenshot attached.</p>
            )}
          </section>

          <CommentSection ticketId={ticket.id} />
        </div>

        <aside className="panel h-fit space-y-4 p-5">
          <div>
            <label className="label" htmlFor="d-status">Status</label>
            <select id="d-status" className="input" value={ticket.status} onChange={changeStatus}>
              {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="d-assignee">Assignee</label>
            <select id="d-assignee" className="input" value={ticket.assignee?.id || ''} onChange={changeAssignee} disabled={!ticket.canEdit}>
              <option value="">Unassigned</option>
              {project.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <dl className="space-y-3 border-t border-slate-100 pt-4 text-sm">
            <div className="flex items-center justify-between"><dt className="text-ink-500">Priority</dt><dd><PriorityBadge priority={ticket.priority} /></dd></div>
            <div className="flex items-center justify-between"><dt className="text-ink-500">Type</dt><dd className="flex items-center gap-1.5 font-semibold"><TypeMark type={ticket.type} />{byKey(TYPES, ticket.type).label}</dd></div>
            <div className="flex items-center justify-between"><dt className="text-ink-500">Reporter</dt><dd className="flex items-center gap-2 font-semibold"><Avatar user={ticket.reporter} />{ticket.reporter.name}</dd></div>
            <div className="flex items-center justify-between"><dt className="text-ink-500">Created</dt><dd>{formatDate(ticket.createdAt)}</dd></div>
            <div className="flex items-center justify-between"><dt className="text-ink-500">Updated</dt><dd>{formatDate(ticket.updatedAt)}</dd></div>
          </dl>
        </aside>
      </div>

      {editing && (
        <Modal title="Edit ticket" wide onClose={() => setEditing(false)}>
          <TicketForm projects={[project]} initial={ticket} lockProject submitLabel="Save changes" onSubmit={save} onCancel={() => setEditing(false)} />
        </Modal>
      )}
    </div>
  );
}
