import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useAuth } from '../auth/AuthContext';
import { AdministrationNav } from '../components/AdministrationNav';
import { createDepartment, getDepartments, updateDepartment, type DepartmentRecord } from '../services/api';

export function DepartmentsPage() {
  const { session } = useAuth();
  const token = session?.token ?? '';
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setDepartments(await getDepartments(token)); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible cargar los departamentos'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage('');
    try {
      await createDepartment(token, { name });
      setName(''); setMessage('Departamento creado correctamente.'); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible crear el departamento'); }
  }

  async function toggle(department: DepartmentRecord) {
    setError(''); setMessage('');
    try {
      const updated = await updateDepartment(token, department.id, { active: !department.active });
      setDepartments((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible actualizar el departamento'); }
  }

  return <section className="page employees-page">
    <AdministrationNav />
    <p className="eyebrow">CATÁLOGOS DEL SISTEMA</p>
    <h1>Departamentos</h1>
    <p>Administre las opciones disponibles al registrar y editar funcionarios.</p>
    <div className="users-layout">
      <form className="panel form-grid" onSubmit={submit}>
        <h2>Crear departamento</h2>
        <label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={120} required /></label>
        <button className="primary-action" type="submit">Crear departamento</button>
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
      <div className="panel employees-panel">
        <div className="panel-heading"><div><p className="eyebrow">OPCIONES DISPONIBLES</p><h2>Departamentos registrados</h2></div><span className="demo-badge">{departments.length} TOTAL</span></div>
        {loading ? <p>Cargando departamentos…</p> : departments.length === 0 ? <p className="empty-list">No hay departamentos registrados.</p> : departments.map((department) =>
          <article className="department-row" key={department.id}>
            <strong>{department.name}</strong>
            <button className={department.active ? 'status-button active' : 'status-button'} type="button" onClick={() => void toggle(department)}>{department.active ? 'Activo' : 'Inactivo'}</button>
          </article>)}
      </div>
    </div>
  </section>;
}
