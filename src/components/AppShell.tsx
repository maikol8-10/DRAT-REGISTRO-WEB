import { NavLink, Outlet } from 'react-router';

import { currentUser } from '../auth/session';
import { modules } from '../config/modules';

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span><strong>SICAF</strong><small>Panel administrativo</small></span>
        </div>
        <nav className="main-nav" aria-label="Navegación principal">
          {modules.map((module) => (
            <NavLink key={module.path} to={module.path} end={module.path === '/'}>
              <span className="nav-icon" aria-hidden="true">{module.shortLabel}</span>{module.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="avatar">AD</span>
          <span><strong>{currentUser.name}</strong><small>{currentUser.role}</small></span>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div><span className="environment-dot" /> Entorno de demostración</div>
          <div className="institution">DRAT · Control institucional</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
