import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useAuth } from '../auth/AuthContext';
import { AdministrationNav } from '../components/AdministrationNav';
import {
  createEmployee,
  getDepartments,
  getEmployees,
  updateEmployee,
  type DepartmentRecord,
  type EmployeeRecord,
} from '../services/api';

const emptyForm = { identification: '', name: '', department: '', position: '' };

export function EmployeesPage() {
  const { session } = useAuth();
  const token = session?.token ?? '';
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadEmployees = useCallback(async (query = '') => {
    try {
      setEmployees(await getEmployees(token, query));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible cargar los funcionarios');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    Promise.all([getEmployees(token), getDepartments(token)])
      .then(([employeeData, departmentData]) => {
        setEmployees(employeeData); setDepartments(departmentData); setError('');
        const firstActive = departmentData.find((department) => department.active);
        if (firstActive) setForm((current) => current.department ? current : { ...current, department: firstActive.name });
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar los funcionarios'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (editingId) {
        await updateEmployee(token, editingId, {
          name: form.name,
          department: form.department,
          position: form.position,
        });
        setMessage('Funcionario actualizado correctamente.');
      } else {
        await createEmployee(token, form);
        setMessage('Funcionario creado correctamente.');
      }
      setForm({ ...emptyForm, department: departments.find((department) => department.active)?.name ?? '' });
      setEditingId(null);
      await loadEmployees(search);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible guardar el funcionario');
    }
  }

  function startEditing(employee: EmployeeRecord) {
    setEditingId(employee.id);
    setForm({
      identification: employee.identification,
      name: employee.name,
      department: employee.department,
      position: employee.position,
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function toggleActive(employee: EmployeeRecord) {
    try {
      const updated = await updateEmployee(token, employee.id, { active: !employee.active });
      setEmployees((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible actualizar el funcionario');
    }
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    await loadEmployees(search);
  }

  return (
    <section className="page employees-page">
      <AdministrationNav />
      <p className="eyebrow">CATÁLOGOS DEL SISTEMA</p>
      <h1>Funcionarios</h1>
      <p>Registre y mantenga actualizada la información del personal institucional.</p>
      <div className="users-layout">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar funcionario' : 'Registrar funcionario'}</h2>
          <label>Identificación<input value={form.identification} onChange={(event) => setForm({ ...form, identification: event.target.value })} minLength={5} maxLength={20} disabled={editingId !== null} required /></label>
          {editingId && <small>La identificación es única y no puede modificarse.</small>}
          <label>Nombre completo<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} required /></label>
          <label>Departamento<select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} required>
            <option value="" disabled>Seleccione un departamento</option>
            {departments.filter((department) => department.active || department.name === form.department).map((department) => <option key={department.id} value={department.name}>{department.name}{department.active ? '' : ' (inactivo)'}</option>)}
          </select></label>
          <label>Puesto<input value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} minLength={2} required /></label>
          <button className="primary-action" type="submit">{editingId ? 'Guardar cambios' : 'Registrar funcionario'}</button>
          {editingId && <button className="secondary-action" type="button" onClick={() => { setEditingId(null); setForm({ ...emptyForm, department: departments.find((department) => department.active)?.name ?? '' }); }}>Cancelar edición</button>}
          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
        <div className="panel employees-panel">
          <div className="panel-heading"><div><p className="eyebrow">PERSONAL REGISTRADO</p><h2>Funcionarios</h2></div><span className="demo-badge">{employees.length} TOTAL</span></div>
          <form className="catalog-search" onSubmit={handleSearch}>
            <input aria-label="Buscar funcionarios" placeholder="Buscar por identificación, nombre o departamento" value={search} onChange={(event) => setSearch(event.target.value)} />
            <button type="submit">Buscar</button>
          </form>
          {loading ? <p>Cargando funcionarios…</p> : employees.length === 0 ? <p className="empty-list">No hay funcionarios que mostrar.</p> : employees.map((employee) => (
            <article className="employee-row" key={employee.id}>
              <div className="employee-identity"><strong>{employee.name}</strong><small>{employee.identification}</small></div>
              <div><strong>{employee.department}</strong><small>{employee.position}</small></div>
              <button className="secondary-action compact" type="button" onClick={() => startEditing(employee)}>Editar</button>
              <button className={employee.active ? 'status-button active' : 'status-button'} type="button" onClick={() => void toggleActive(employee)}>{employee.active ? 'Activo' : 'Inactivo'}</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
