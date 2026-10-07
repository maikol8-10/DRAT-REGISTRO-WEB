import { Navigate, Route, Routes } from 'react-router';

import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { modules } from './config/modules';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { DashboardPage } from './pages/DashboardPage';
import { ModulePage } from './pages/ModulePage';
import { LoginPage } from './pages/LoginPage';
import { UsersPage } from './pages/UsersPage';

const pageContent = {
  '/administracion': ['CATÁLOGOS DEL SISTEMA', 'Administración', 'Gestión de usuarios, funcionarios, vehículos y configuraciones generales.'],
  '/consultas': ['BÚSQUEDA OPERATIVA', 'Consultas', 'Consulta centralizada de personas, placas y movimientos registrados.'],
  '/aprobaciones': ['CONTROL ADMINISTRATIVO', 'Aprobaciones', 'Revisión y resolución de movimientos que requieren autorización.'],
  '/reportes': ['INFORMACIÓN Y CONTROL', 'Reportes', 'Generación de reportes operativos por placa, persona y periodo.'],
} as const;

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route index element={<ProtectedRoute allowedRoles={modules[0].allowedRoles}><DashboardPage /></ProtectedRoute>} />
        <Route path="/administracion" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><UsersPage /></ProtectedRoute>} />
        {modules.slice(2).map((module) => {
          const [eyebrow, title, description] = pageContent[module.path as keyof typeof pageContent];
          return <Route key={module.path} path={module.path} element={<ProtectedRoute allowedRoles={module.allowedRoles}><ModulePage eyebrow={eyebrow} title={title} description={description} /></ProtectedRoute>} />;
        })}
      </Route>
      <Route path="/sin-acceso" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
