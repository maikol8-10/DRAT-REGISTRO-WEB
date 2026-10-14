import { useEffect, useState, type FormEvent } from 'react';

import { useAuth } from '../auth/AuthContext';
import { AdministrationNav } from '../components/AdministrationNav';
import { createNfcTag, deleteNfcTag, getEmployees, getNfcTags, updateNfcTag, type EmployeeRecord, type NfcTagRecord } from '../services/api';

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
  const [search, setSearch] = useState('');

  async function reload() { setTags(await getNfcTags(token)); }

  useEffect(() => {
    Promise.all([getNfcTags(token), getEmployees(token)])
      .then(([tagData, employeeData]) => { setTags(tagData); setEmployees(employeeData); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar los TAG NFC'));
  }, [token]);

  const availableEmployees = employees.filter((employee) => employee.active && (!tags.some((tag) => tag.employeeId === employee.id) || employee.id === form.employeeId));
  const normalizedSearch = search.trim().toLocaleLowerCase('es');
  const filteredTags = tags.filter((tag) => [tag.code, tag.employee?.name, tag.employee?.identification]
    .some((value) => value?.toLocaleLowerCase('es').includes(normalizedSearch)));

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

  async function unassign(tag: NfcTagRecord) {
    setError(''); setMessage('');
    if (!window.confirm(`¿Desea liberar el TAG ${tag.code} de ${tag.employee?.name}?`)) return;
    try { await updateNfcTag(token, tag.id, { employeeId: null }); setMessage('TAG liberado. Ahora puede reasignarse o eliminarse si no tiene historial.'); await reload(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible liberar el TAG'); }
  }

  async function remove(tag: NfcTagRecord) {
    setError(''); setMessage('');
    if (tag.employeeId) { setError('Primero debe liberar el TAG del funcionario asignado.'); return; }
    if (!window.confirm(`¿Eliminar definitivamente el TAG ${tag.code}?`)) return;
    try { await deleteNfcTag(token, tag.id); setMessage('TAG eliminado correctamente.'); await reload(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible eliminar el TAG'); }
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
        <form className="catalog-search" onSubmit={(event) => event.preventDefault()}>
          <input aria-label="Buscar TAG NFC" placeholder="Buscar por código, funcionario o identificación" value={search} onChange={(event) => setSearch(event.target.value)} />
          {search && <button type="button" onClick={() => setSearch('')}>Limpiar</button>}
        </form>
        {tags.length === 0 ? <p className="empty-list">No hay TAG NFC registrados.</p> : filteredTags.length === 0 ? <p className="empty-list">No hay TAG NFC que coincidan con la búsqueda.</p> : filteredTags.map((tag) => <article className="employee-row" key={tag.id}>
          <div><strong>{tag.code}</strong><small>Identificador NFC</small></div><div><strong>{tag.employee?.name ?? 'Sin asignar'}</strong><small>{tag.employee?.identification ?? 'Disponible para asignación'}</small></div>
          <button className="secondary-action compact" type="button" onClick={() => { setEditingId(tag.id); setForm({ code: tag.code, employeeId: tag.employeeId ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{tag.employeeId ? 'Reasignar' : 'Asignar'}</button>
          {tag.employeeId && <button className="secondary-action compact" type="button" onClick={() => void unassign(tag)}>Liberar</button>}
          <button className={tag.active ? 'status-button active' : 'status-button'} type="button" disabled={!tag.employeeId} title={!tag.employeeId ? 'Asigne un funcionario antes de activar el TAG' : undefined} onClick={() => void toggle(tag)}>{tag.active ? 'Activo' : 'Inactivo'}</button>
          <button className="secondary-action compact" type="button" disabled={Boolean(tag.employeeId)} title={tag.employeeId ? 'Primero debe liberar el TAG' : 'Eliminar TAG'} onClick={() => void remove(tag)}>Eliminar</button>
        </article>)}
      </div>
    </div>
  </section>;
}
