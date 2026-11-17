import { useEffect, useState } from 'react';
import { usersApi, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageLoader } from '../components/Spinner';
import { Avatar } from '../components/Badges';
import { ROLES } from '../utils/constants';

export default function Users() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState(null);

  useEffect(() => {
    usersApi.list().then(setUsers).catch((e) => { toast.error(errorMessage(e)); setUsers([]); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const changeRole = async (u, role) => {
    try {
      const updated = await usersApi.setRole(u.id, role);
      setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)));
      toast.success(`${u.name} is now ${role.toLowerCase()}`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (!users) return <PageLoader />;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-3xl font-bold">People & roles</h1>
      <p className="mb-6 text-sm text-ink-500">Managers can create projects. Admins can do everything, including changing roles.</p>
      <ul className="panel divide-y divide-slate-100">
        {users.map((u) => (
          <li key={u.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar user={u} size="h-9 w-9 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{u.name}{u.id === me.id && <span className="ml-2 text-xs text-ink-300">You</span>}</p>
              <p className="truncate text-xs text-ink-500">{u.email}</p>
            </div>
            <select className="input !w-auto" aria-label={`Role for ${u.name}`} value={u.role} disabled={u.id === me.id} onChange={(e) => changeRole(u, e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
