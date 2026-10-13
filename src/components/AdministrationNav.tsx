import { NavLink } from 'react-router';

export function AdministrationNav() {
  return (
    <nav className="catalog-nav" aria-label="Catálogos administrativos">
      <NavLink to="/administracion" end>Usuarios y roles</NavLink>
      <NavLink to="/administracion/funcionarios">Funcionarios</NavLink>
      <NavLink to="/administracion/vehiculos-institucionales">Vehículos institucionales</NavLink>
      <NavLink to="/administracion/vehiculos-particulares">Vehículos particulares</NavLink>
    </nav>
  );
}
