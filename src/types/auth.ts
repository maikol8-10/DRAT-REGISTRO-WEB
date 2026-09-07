export type Role = 'ADMINISTRADOR' | 'GUARDA';

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
}
