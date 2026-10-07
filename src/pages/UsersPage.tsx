import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useAuth } from '../auth/AuthContext';
import { createUser, getUsers, updateUser, type UserRecord } from '../services/api';
import type { Role } from '../types/auth';

const emptyForm = { name: '', email: '', password: '', role: 'GUARDA' as Role };

export function UsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const token = session?.token ?? '';

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await getUsers(token));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    getUsers(token)
      .then((data) => { setUsers(data); setError(''); })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'No fue posible cargar los usuarios');
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await createUser(token, form);
      setForm(emptyForm);
      setMessage('Usuario creado correctamente.');
      await loadUsers();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible crear el usuario');
    }
  }

  async function changeUser(user: UserRecord, changes: { role?: Role; active?: boolean }) {
    setError('');
    try {
      const updated = await updateUser(token, user.id, changes);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible actualizar el usuario');
    }
  }

  return (
    <section className="page users-page">
      <p className="eyebrow">SEGURIDAD Y ACCESO</p>
      <h1>Usuarios y roles</h1>
      <p>Administre las cuentas autorizadas para utilizar SICAF.</p>
      <div className="users-layout">
        <form className="panel form-grid" onSubmit={handleCreate}>
          <h2>Crear usuario</h2>
          <label>Nombre<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} required /></label>
          <label>Correo<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Contraseña<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={8} required /></label>
          <small>Debe incluir mayúscula, minúscula y número.</small>
          <label>Rol<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}><option value="GUARDA">Guarda</option><option value="ADMINISTRADOR">Administrador</option></select></label>
          <button className="primary-action" type="submit">Crear usuario</button>
          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
        <div className="panel users-panel">
          <div className="panel-heading"><div><p className="eyebrow">CUENTAS REGISTRADAS</p><h2>Usuarios</h2></div><span className="demo-badge">{users.length} TOTAL</span></div>
          {loading ? <p>Cargando usuarios…</p> : users.map((user) => (
            <article className="user-row" key={user.id}>
              <span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span>
              <div className="user-identity"><strong>{user.name}</strong><small>{user.email}</small></div>
              <select aria-label={`Rol de ${user.name}`} value={user.role} disabled={user.id === session?.user.id} onChange={(event) => void changeUser(user, { role: event.target.value as Role })}><option value="GUARDA">Guarda</option><option value="ADMINISTRADOR">Administrador</option></select>
              <button className={user.active ? 'status-button active' : 'status-button'} type="button" disabled={user.id === session?.user.id} onClick={() => void changeUser(user, { active: !user.active })}>{user.active ? 'Activo' : 'Inactivo'}</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
