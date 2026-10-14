import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { createMovementContingency, getEmployees, getInstitutionalTrips, getPrivateVehicles, type EmployeeRecord, type InstitutionalTripRecord, type PrivateVehicleRecord } from '../services/api';

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('es-CR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Pendiente';

export function InstitutionalTripsPage() {
  const { session } = useAuth();
  const [trips, setTrips] = useState<InstitutionalTripRecord[]>([]);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]); const [vehicles, setVehicles] = useState<PrivateVehicleRecord[]>([]);
  const [entityType, setEntityType] = useState<'FUNCIONARIO' | 'VEHICULO_PARTICULAR'>('FUNCIONARIO'); const [entityId, setEntityId] = useState('');
  const [movementType, setMovementType] = useState<'INGRESO' | 'SALIDA'>('INGRESO'); const [reason, setReason] = useState(''); const [message, setMessage] = useState('');
  useEffect(() => { getInstitutionalTrips(session?.token ?? '').then(setTrips).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar el historial')).finally(() => setLoading(false)); }, [session?.token]);
  useEffect(() => { if (session?.user.role !== 'ADMINISTRADOR') return; Promise.all([getEmployees(session.token), getPrivateVehicles(session.token)]).then(([people, cars]) => { setEmployees(people.filter((item) => item.active)); setVehicles(cars.filter((item) => item.active)); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar las opciones de contingencia')); }, [session]);
  async function submitContingency(event: FormEvent) { event.preventDefault(); setError(''); setMessage(''); try { await createMovementContingency(session?.token ?? '', { entityType, entityId, movementType, reason }); setMessage('Contingencia autorizada y registrada en la auditoría.'); setEntityId(''); setReason(''); } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible registrar la contingencia'); } }
  return <section className="page"><p className="eyebrow">HISTORIAL OPERATIVO</p><h1>Movimientos institucionales</h1><p>Salidas e ingresos vinculados por su boleta SOIN.</p>
    {session?.user.role === 'ADMINISTRADOR' && <form className="panel form-grid contingency-form" onSubmit={submitContingency}><p className="eyebrow">RUTA AUTORIZADA</p><h2>Resolver inconsistencia</h2><p>Utilice esta opción únicamente después de confirmar que se omitió o duplicó un movimiento. La corrección conserva usuario, motivo y estado anterior.</p>
      <label>Tipo de registro<select value={entityType} onChange={(event) => { setEntityType(event.target.value as typeof entityType); setEntityId(''); }}><option value="FUNCIONARIO">Funcionario</option><option value="VEHICULO_PARTICULAR">Vehículo particular</option></select></label>
      <label>{entityType === 'FUNCIONARIO' ? 'Funcionario' : 'Vehículo'}<select value={entityId} onChange={(event) => setEntityId(event.target.value)} required><option value="">Seleccione…</option>{entityType === 'FUNCIONARIO' ? employees.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.identification}</option>) : vehicles.map((item) => <option key={item.id} value={item.id}>{item.plate} · {item.brand} {item.model}</option>)}</select></label>
      <label>Movimiento correctivo<select value={movementType} onChange={(event) => setMovementType(event.target.value as typeof movementType)}><option value="INGRESO">Ingreso</option><option value="SALIDA">Salida</option></select></label>
      <label>Motivo<textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} maxLength={500} required /></label><button className="primary-action" type="submit">Autorizar contingencia</button>{message && <p className="form-success">{message}</p>}
    </form>}
    <div className="panel trips-panel"><div className="panel-heading"><div><p className="eyebrow">VIAJES REGISTRADOS</p><h2>Historial de flotilla</h2></div><span className="demo-badge">{trips.length} TOTAL</span></div>
      {error && <p className="form-error" role="alert">{error}</p>}{loading ? <p>Cargando historial…</p> : trips.length === 0 ? <p className="empty-list">No hay movimientos institucionales registrados.</p> : trips.map((trip) => <article className="trip-row" key={trip.id}>
        <div><strong>{trip.soinNumber}</strong><small>{trip.vehicle.plate} · {trip.vehicle.brand} {trip.vehicle.model}</small></div>
        <div><strong>{trip.driver.name}</strong><small>{trip.destination} · {trip.occupants.length} acompañantes</small></div>
        <div><strong>Salida: {trip.departureMileage} km · {trip.departureFuel}%</strong><small>{formatDate(trip.departureAt)}</small></div>
        <div><strong>{trip.returnAt ? `Ingreso: ${trip.returnMileage} km · ${trip.returnFuel}%` : 'Viaje abierto'}</strong><small>{formatDate(trip.returnAt)}</small></div>
        <span className={trip.returnAt ? 'type-badge' : 'demo-badge'}>{trip.returnAt ? 'Completado' : 'En curso'}</span>
      </article>)}
    </div>
  </section>;
}
