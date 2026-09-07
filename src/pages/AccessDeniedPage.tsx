import { Link } from 'react-router';

export function AccessDeniedPage() {
  return <main className="standalone"><div className="empty-state"><h1>Acceso restringido</h1><p>Su rol no tiene permiso para consultar este módulo.</p><Link className="primary-button" to="/">Volver al inicio</Link></div></main>;
}
