export type Role = 'ADMINISTRADOR' | 'GUARDA';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthSession {
  token: string;
  user: SessionUser;
}
