import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useAuth } from '../auth/AuthContext';
import { AdministrationNav } from '../components/AdministrationNav';
import {
  createPrivateVehicle,
  getEmployees,
  getPrivateVehicles,
  updatePrivateVehicle,
  type EmployeeRecord,
  type PrivateVehicleRecord,
} from '../services/api';

const emptyForm = { plate: '', brand: '', model: '', color: '', ownerEmployeeId: '' };

export function PrivateVehiclesPage() {
  const { session } = useAuth();
  const token = session?.token ?? '';
  const [vehicles, setVehicles] = useState<PrivateVehicleRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const activeEmployees = employees.filter((employee) => employee.active);
  const loadVehicles = useCallback(async (query = '') => {
    try { setVehicles(await getPrivateVehicles(token, query)); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible cargar los vehículos particulares'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    Promise.all([getPrivateVehicles(token), getEmployees(token)])
      .then(([vehicleData, employeeData]) => { setVehicles(vehicleData); setEmployees(employeeData); setError(''); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar el catálogo'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(''); setMessage('');
    const input = { brand: form.brand, model: form.model, color: form.color, ownerEmployeeId: form.ownerEmployeeId };
    try {
      if (editingId) {
        await updatePrivateVehicle(token, editingId, input);
        setMessage('Vehículo particular actualizado correctamente.');
      } else {
        await createPrivateVehicle(token, { plate: form.plate, ...input });
        setMessage('Vehículo particular asociado correctamente.');
      }
      setForm(emptyForm); setEditingId(null); await loadVehicles(search);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible guardar el vehículo'); }
  }

  function startEditing(vehicle: PrivateVehicleRecord) {
    setEditingId(vehicle.id);
    setForm({ plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, color: vehicle.color, ownerEmployeeId: vehicle.ownerEmployeeId });
    setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function toggleActive(vehicle: PrivateVehicleRecord) {
    setError('');
    try {
      const updated = await updatePrivateVehicle(token, vehicle.id, { active: !vehicle.active });
      setVehicles((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible actualizar el vehículo'); }
  }

  return (
    <section className="page employees-page">
      <AdministrationNav />
      <p className="eyebrow">CATÁLOGOS DEL SISTEMA</p>
      <h1>Vehículos particulares</h1>
      <p>Asocie uno o varios vehículos particulares con su funcionario propietario habitual.</p>
      <div className="users-layout">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar vehículo particular' : 'Asociar vehículo particular'}</h2>
          <label>Placa<input value={form.plate} onChange={(event) => setForm({ ...form, plate: event.target.value })} minLength={3} maxLength={15} disabled={editingId !== null} required /></label>
          {editingId && <small>La placa es única y no puede modificarse.</small>}
          <label>Marca<input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} minLength={2} required /></label>
          <label>Modelo<input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} required /></label>
          <label>Color<input value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} minLength={2} required /></label>
          <label>Propietario habitual<select value={form.ownerEmployeeId} onChange={(event) => setForm({ ...form, ownerEmployeeId: event.target.value })} required><option value="">Seleccione un funcionario activo</option>{activeEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.identification}</option>)}</select></label>
          {activeEmployees.length === 0 && <p className="form-error">Debe existir al menos un funcionario activo.</p>}
          <button className="primary-action" type="submit" disabled={activeEmployees.length === 0}>{editingId ? 'Guardar cambios' : 'Asociar vehículo'}</button>
          {editingId && <button className="secondary-action" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar edición</button>}
          {message && <p className="form-success">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}
        </form>
        <div className="panel employees-panel">
          <div className="panel-heading"><div><p className="eyebrow">VEHÍCULOS ASOCIADOS</p><h2>Vehículos particulares</h2></div><span className="demo-badge">{vehicles.length} TOTAL</span></div>
          <form className="catalog-search" onSubmit={(event) => { event.preventDefault(); setLoading(true); void loadVehicles(search); }}><input aria-label="Buscar vehículos particulares" placeholder="Buscar por placa, marca, modelo o propietario" value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit">Buscar</button></form>
          {loading ? <p>Cargando vehículos…</p> : vehicles.length === 0 ? <p className="empty-list">No hay vehículos particulares que mostrar.</p> : vehicles.map((vehicle) => (
            <article className="vehicle-row" key={vehicle.id}>
              <div><strong>{vehicle.plate}</strong><small>{vehicle.brand} {vehicle.model} · {vehicle.color}</small></div>
              <div><strong>{vehicle.owner?.name ?? 'Propietario no disponible'}</strong><small>{vehicle.owner?.identification ?? ''}</small></div>
              <span className="type-badge private">Particular</span>
              <button className="secondary-action compact" type="button" onClick={() => startEditing(vehicle)}>Editar</button>
              <button className={vehicle.active ? 'status-button active' : 'status-button'} type="button" onClick={() => void toggleActive(vehicle)}>{vehicle.active ? 'Activo' : 'Inactivo'}</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
