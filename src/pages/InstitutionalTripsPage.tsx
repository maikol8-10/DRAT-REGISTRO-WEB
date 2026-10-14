import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getInstitutionalTrips, type InstitutionalTripRecord } from '../services/api';

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('es-CR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Pendiente';

export function InstitutionalTripsPage() {
  const { session } = useAuth();
  const [trips, setTrips] = useState<InstitutionalTripRecord[]>([]);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { getInstitutionalTrips(session?.token ?? '').then(setTrips).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar el historial')).finally(() => setLoading(false)); }, [session?.token]);
  return <section className="page"><p className="eyebrow">HISTORIAL OPERATIVO</p><h1>Movimientos institucionales</h1><p>Salidas e ingresos vinculados por su boleta SOIN.</p>
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
