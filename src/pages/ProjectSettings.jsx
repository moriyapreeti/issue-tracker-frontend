import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { projectsApi, usersApi, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { PageLoader, Spinner } from '../components/Spinner';
import { Avatar, KeyChip } from '../components/Badges';

export default function ProjectSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [newMember, setNewMember] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([projectsApi.get(id), usersApi.list()])
      .then(([p, u]) => { setProject(p); setUsers(u); setForm({ name: p.name, description: p.description || '' }); })
      .catch((e) => { toast.error(errorMessage(e)); navigate('/projects'); });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!project) return <PageLoader />;

  const canManage = project.canManage;
  const candidates = users.filter((u) => !project.members.some((m) => m.id === u.id));

  const run = async (fn, okMsg) => {
    try { const res = await fn(); if (okMsg) toast.success(okMsg); return res; } catch (e) { toast.error(errorMessage(e)); }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const p = await run(() => projectsApi.update(id, form), 'Project saved');
    if (p) setProject(p);
    setSaving(false);
  };

  const add = async () => {
    if (!newMember) return;
    const p = await run(() => projectsApi.addMember(id, newMember), 'Member added');
    if (p) { setProject(p); setNewMember(''); }
  };

  const remove = async (m) => {
    if (!window.confirm(`Remove ${m.name} from this project? Their tickets here become unassigned.`)) return;
    const p = await run(() => projectsApi.removeMember(id, m.id), 'Member removed');
    if (p) setProject(p);
  };

  const deleteProject = async () => {
    if (!window.confirm(`Delete "${project.name}" and all of its tickets? This cannot be undone.`)) return;
    const ok = await run(() => projectsApi.remove(id).then(() => true), 'Project deleted');
    if (ok) navigate('/projects');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <div className="flex items-center gap-2"><KeyChip>{project.key}</KeyChip><Link to={`/projects/${id}`} className="text-sm text-ink-500 hover:underline">Back to board</Link></div>
        <h1 className="mt-1 text-3xl font-bold">Team & settings</h1>
      </div>

      <form onSubmit={save} className="panel space-y-4 p-6">
        <h2 className="text-lg font-bold">Details</h2>
        <div><label className="label" htmlFor="s-name">Name</label><input id="s-name" className="input" required disabled={!canManage} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label" htmlFor="s-desc">Description</label><textarea id="s-desc" className="input min-h-24" disabled={!canManage} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        {canManage && <div className="flex justify-end"><button className="btn-primary" disabled={saving}>{saving && <Spinner className="h-4 w-4 text-white" />} Save changes</button></div>}
      </form>

      <section className="panel p-6">
        <h2 className="text-lg font-bold">Members <span className="text-ink-300">{project.members.length}</span></h2>
        {canManage && (
          <div className="mt-4 flex gap-2">
            <select className="input" aria-label="Person to add" value={newMember} onChange={(e) => setNewMember(e.target.value)}>
              <option value="">Choose a person to add…</option>
              {candidates.map((u) => <option key={u.id} value={u.id}>{u.name} · {u.email}</option>)}
            </select>
            <button className="btn-primary" onClick={add} disabled={!newMember}>Add</button>
          </div>
        )}
        <ul className="mt-4 divide-y divide-slate-100">
          {project.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <Avatar user={m} size="h-9 w-9 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.name}{m.id === project.owner.id && <span className="ml-2 rounded-md bg-brand-50 px-1.5 py-0.5 text-xs text-brand-700">Owner</span>}</p>
                <p className="truncate text-xs text-ink-500">{m.email} · {m.role.toLowerCase()}</p>
              </div>
              {canManage && m.id !== project.owner.id && <button className="btn-ghost text-red-600 hover:!text-red-700" onClick={() => remove(m)}>Remove</button>}
            </li>
          ))}
        </ul>
      </section>

      {canManage && (
        <section className="rounded-xl border border-red-200 bg-red-50/50 p-6">
          <h2 className="text-lg font-bold text-red-800">Delete project</h2>
          <p className="mt-1 text-sm text-red-700">Removes the project, every ticket, comment and screenshot in it.</p>
          <button className="btn-danger mt-4" onClick={deleteProject}>Delete this project</button>
        </section>
      )}
    </div>
  );
}
