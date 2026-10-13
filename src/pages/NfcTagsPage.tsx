import { useEffect, useState, type FormEvent } from 'react';

import { useAuth } from '../auth/AuthContext';
import { AdministrationNav } from '../components/AdministrationNav';
import { createNfcTag, getEmployees, getNfcTags, updateNfcTag, type EmployeeRecord, type NfcTagRecord } from '../services/api';

const emptyForm = { code: '', employeeId: '' };

export function NfcTagsPage() {
  const { session } = useAuth();
  const token = session?.token ?? '';
  const [tags, setTags] = useState<NfcTagRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function reload() { setTags(await getNfcTags(token)); }

  useEffect(() => {
    Promise.all([getNfcTags(token), getEmployees(token)])
      .then(([tagData, employeeData]) => { setTags(tagData); setEmployees(employeeData); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar los TAG NFC'));
  }, [token]);

  const availableEmployees = employees.filter((employee) => employee.active && (!tags.some((tag) => tag.employeeId === employee.id) || employee.id === form.employeeId));

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage('');
    try {
      if (editingId) { await updateNfcTag(token, editingId, { employeeId: form.employeeId }); setMessage('Asociación actualizada.'); }
      else { await createNfcTag(token, form); setMessage('TAG NFC asociado correctamente.'); }
      setForm(emptyForm); setEditingId(null); await reload();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible guardar el TAG'); }
  }

  async function toggle(tag: NfcTagRecord) {
    setError('');
    try { const updated = await updateNfcTag(token, tag.id, { active: !tag.active }); setTags((current) => current.map((item) => item.id === updated.id ? updated : item)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible actualizar el TAG'); }
  }

  return <section className="page employees-page">
    <AdministrationNav />
    <p className="eyebrow">IDENTIFICACIÓN OPERATIVA</p><h1>TAG NFC</h1><p>Asocie códigos NFC únicos con funcionarios activos.</p>
    <div className="users-layout">
      <form className="panel form-grid" onSubmit={submit}>
        <h2>{editingId ? 'Cambiar funcionario asociado' : 'Asociar TAG NFC'}</h2>
        <label>Código del TAG<input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} disabled={editingId !== null} minLength={4} maxLength={80} required /></label>
        {editingId && <small>El código es único y no puede modificarse.</small>}
        <label>Funcionario<select value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} required><option value="">Seleccione un funcionario activo</option>{availableEmployees.map((employee) => <option value={employee.id} key={employee.id}>{employee.name} · {employee.identification}</option>)}</select></label>
        <button className="primary-action" type="submit">{editingId ? 'Guardar asociación' : 'Asociar TAG'}</button>
        {editingId && <button className="secondary-action" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar</button>}
        {message && <p className="form-success">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}
      </form>
      <div className="panel employees-panel"><div className="panel-heading"><div><p className="eyebrow">TAGS REGISTRADOS</p><h2>Asociaciones</h2></div><span className="demo-badge">{tags.length} TOTAL</span></div>
        {tags.length === 0 ? <p className="empty-list">No hay TAG NFC registrados.</p> : tags.map((tag) => <article className="employee-row" key={tag.id}>
          <div><strong>{tag.code}</strong><small>Identificador NFC</small></div><div><strong>{tag.employee?.name}</strong><small>{tag.employee?.identification}</small></div>
          <button className="secondary-action compact" type="button" onClick={() => { setEditingId(tag.id); setForm({ code: tag.code, employeeId: tag.employeeId }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Editar</button>
          <button className={tag.active ? 'status-button active' : 'status-button'} type="button" onClick={() => void toggle(tag)}>{tag.active ? 'Activo' : 'Inactivo'}</button>
        </article>)}
      </div>
    </div>
  </section>;
}
