import { ApiStatus } from '../components/ApiStatus';

const stats = [
  { value: '38', label: 'Personas presentes', tone: 'blue' },
  { value: '12', label: 'Vehículos dentro', tone: 'green' },
  { value: '3', label: 'Visitas activas', tone: 'amber' },
  { value: '0', label: 'Alertas críticas', tone: 'neutral' },
];

export function DashboardPage() {
  return (
    <section className="page">
      <div className="page-heading">
        <div><p className="eyebrow">RESUMEN GENERAL</p><h1>Buenos días, Administrador</h1><p>Estado actual de la garita principal del DRAT.</p></div>
        <ApiStatus />
      </div>
      <div className="stats-grid">
        {stats.map((stat) => <article className={`stat-card ${stat.tone} transition-shadow hover:shadow-lg`} key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></article>)}
      </div>
      <div className="dashboard-grid">
        <article className="panel transition-shadow hover:shadow-lg">
          <div className="panel-heading"><div><p className="eyebrow">ACTIVIDAD RECIENTE</p><h2>Últimos movimientos</h2></div><span className="demo-badge">Demostración</span></div>
          <div className="activity-row"><span className="activity-icon">IN</span><div><strong>Ingreso de funcionario</strong><small>María Rodríguez · Vehículo ABC-123</small></div><time>08:42</time></div>
          <div className="activity-row"><span className="activity-icon out">SA</span><div><strong>Salida institucional</strong><small>Unidad 02 · Destino San José</small></div><time>08:31</time></div>
          <div className="activity-row"><span className="activity-icon visit">VI</span><div><strong>Visitante registrado</strong><small>Carlos Méndez · Gafete 014</small></div><time>08:20</time></div>
        </article>
        <article className="panel quick-panel transition-shadow hover:shadow-lg">
          <p className="eyebrow">ACCESOS RÁPIDOS</p><h2>Gestión administrativa</h2>
          <p>Utilice el menú lateral para ingresar a los módulos disponibles según su rol.</p>
          <div className="role-note"><strong>Estructura protegida</strong><span>Rol activo: ADMINISTRADOR</span></div>
        </article>
      </div>
    </section>
  );
}
