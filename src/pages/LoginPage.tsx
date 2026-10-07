import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { useAuth } from '../auth/AuthContext';
import { login } from '../services/api';

export function LoginPage() {
  const { session, setAuthenticatedSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const nextSession = await login(email, password);
      setAuthenticatedSession(nextSession);
      const destination = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(destination, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <span className="brand-mark large">S</span>
        <p className="eyebrow">DRAT · CONTROL INSTITUCIONAL</p>
        <h1>Ingresar a SICAF</h1>
        <p>Utilice las credenciales asignadas por la administración.</p>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label>
          <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-action" type="submit" disabled={loading}>{loading ? 'Ingresando…' : 'Iniciar sesión'}</button>
        </form>
      </section>
    </main>
  );
}
