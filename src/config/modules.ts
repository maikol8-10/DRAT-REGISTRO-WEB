import type { Role } from '../types/auth';

export interface AppModule {
  path: string;
  label: string;
  shortLabel: string;
  description: string;
  allowedRoles: readonly Role[];
}

export const modules: readonly AppModule[] = [
  { path: '/', label: 'Inicio', shortLabel: 'IN', description: 'Resumen operativo del plantel', allowedRoles: ['ADMINISTRADOR', 'GUARDA'] },
  { path: '/administracion', label: 'Administración', shortLabel: 'AD', description: 'Usuarios, funcionarios y catálogos', allowedRoles: ['ADMINISTRADOR'] },
  { path: '/consultas', label: 'Consultas', shortLabel: 'CO', description: 'Búsqueda de personas y vehículos', allowedRoles: ['ADMINISTRADOR', 'GUARDA'] },
  { path: '/aprobaciones', label: 'Aprobaciones', shortLabel: 'AP', description: 'Movimientos pendientes de revisión', allowedRoles: ['ADMINISTRADOR'] },
  { path: '/reportes', label: 'Reportes', shortLabel: 'RE', description: 'Informes por placa y persona', allowedRoles: ['ADMINISTRADOR'] },
] as const;
