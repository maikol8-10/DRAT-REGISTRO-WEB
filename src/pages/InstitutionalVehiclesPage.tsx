import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useAuth } from '../auth/AuthContext';
import { AdministrationNav } from '../components/AdministrationNav';
import {
  createInstitutionalVehicle,
  getInstitutionalVehicles,
  updateInstitutionalVehicle,
  type FuelType,
  type InstitutionalVehicleRecord,
} from '../services/api';

const emptyForm = { plate: '', assetCode: '', brand: '', model: '', year: String(new Date().getFullYear()), fuelType: 'DIESEL' as FuelType };

export function InstitutionalVehiclesPage() {
  const { session } = useAuth();
  const token = session?.token ?? '';
  const [vehicles, setVehicles] = useState<InstitutionalVehicleRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadVehicles = useCallback(async (query = '') => {
    try {
      setVehicles(await getInstitutionalVehicles(token, query));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible cargar los vehículos');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    getInstitutionalVehicles(token)
      .then((data) => { setVehicles(data); setError(''); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar los vehículos'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    const input = { assetCode: form.assetCode, brand: form.brand, model: form.model, year: Number(form.year), fuelType: form.fuelType };
    try {
      if (editingId) {
        await updateInstitutionalVehicle(token, editingId, input);
        setMessage('Vehículo institucional actualizado correctamente.');
      } else {
        await createInstitutionalVehicle(token, { plate: form.plate, ...input });
        setMessage('Vehículo institucional creado correctamente.');
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadVehicles(search);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible guardar el vehículo');
    }
  }

  function startEditing(vehicle: InstitutionalVehicleRecord) {
    setEditingId(vehicle.id);
    setForm({ plate: vehicle.plate, assetCode: vehicle.assetCode, brand: vehicle.brand, model: vehicle.model, year: String(vehicle.year), fuelType: vehicle.fuelType });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function toggleActive(vehicle: InstitutionalVehicleRecord) {
    setError('');
    try {
      const updated = await updateInstitutionalVehicle(token, vehicle.id, { active: !vehicle.active });
      setVehicles((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible actualizar el vehículo');
    }
  }

  return (
    <section className="page employees-page">
      <AdministrationNav />
      <p className="eyebrow">CATÁLOGOS DEL SISTEMA</p>
      <h1>Vehículos institucionales</h1>
      <p>Administre la información operativa de la flotilla institucional.</p>
      <div className="users-layout">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar vehículo' : 'Registrar vehículo'}</h2>
          <label>Placa<input value={form.plate} onChange={(event) => setForm({ ...form, plate: event.target.value })} minLength={3} maxLength={15} disabled={editingId !== null} required /></label>
          {editingId && <small>La placa es única y no puede modificarse.</small>}
          <label>Número de activo<input value={form.assetCode} onChange={(event) => setForm({ ...form, assetCode: event.target.value })} minLength={2} maxLength={40} required /></label>
          <label>Marca<input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} minLength={2} required /></label>
          <label>Modelo<input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} required /></label>
          <label>Año<input type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} min="1900" max="2100" required /></label>
          <label>Combustible<select value={form.fuelType} onChange={(event) => setForm({ ...form, fuelType: event.target.value as FuelType })}><option value="GASOLINA">Gasolina</option><option value="DIESEL">Diésel</option><option value="ELECTRICO">Eléctrico</option><option value="HIBRIDO">Híbrido</option><option value="OTRO">Otro</option></select></label>
          <button className="primary-action" type="submit">{editingId ? 'Guardar cambios' : 'Registrar vehículo'}</button>
          {editingId && <button className="secondary-action" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar edición</button>}
          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
        <div className="panel employees-panel">
          <div className="panel-heading"><div><p className="eyebrow">FLOTILLA REGISTRADA</p><h2>Vehículos institucionales</h2></div><span className="demo-badge">{vehicles.length} TOTAL</span></div>
          <form className="catalog-search" onSubmit={(event) => { event.preventDefault(); setLoading(true); void loadVehicles(search); }}>
            <input aria-label="Buscar vehículos" placeholder="Buscar por placa, número de activo, marca o modelo" value={search} onChange={(event) => setSearch(event.target.value)} />
            <button type="submit">Buscar</button>
          </form>
          {loading ? <p>Cargando vehículos…</p> : vehicles.length === 0 ? <p className="empty-list">No hay vehículos institucionales que mostrar.</p> : vehicles.map((vehicle) => (
            <article className="vehicle-row" key={vehicle.id}>
              <div><strong>{vehicle.plate}</strong><small>{vehicle.assetCode}</small></div>
              <div><strong>{vehicle.brand} {vehicle.model}</strong><small>{vehicle.year} · {vehicle.fuelType}</small></div>
              <span className="type-badge">Institucional</span>
              <button className="secondary-action compact" type="button" onClick={() => startEditing(vehicle)}>Editar</button>
              <button className={vehicle.active ? 'status-button active' : 'status-button'} type="button" onClick={() => void toggleActive(vehicle)}>{vehicle.active ? 'Activo' : 'Inactivo'}</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
