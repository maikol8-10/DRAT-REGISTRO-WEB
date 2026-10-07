import { env } from '../config/env';
import type { AuthSession, Role } from '../types/auth';

interface ApiHealth {
  status: 'ok';
  service: string;
  timestamp: string;
}

export async function getApiHealth(signal?: AbortSignal): Promise<ApiHealth> {
  const response = await fetch(`${env.apiUrl}/health`, { signal });
  if (!response.ok) {
    throw new Error(`La API respondió con estado ${response.status}`);
  }
  return response.json() as Promise<ApiHealth>;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${env.apiUrl}${path}`, { ...init, headers });
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as { error?: string } & T;
  if (!response.ok) throw new Error(body.error ?? `La API respondió con estado ${response.status}`);
  return body;
}

export function login(email: string, password: string) {
  return apiRequest<AuthSession>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getUsers(token: string) {
  const response = await apiRequest<{ data: UserRecord[] }>('/api/v1/users', {}, token);
  return response.data;
}

export async function createUser(
  token: string,
  input: { name: string; email: string; password: string; role: Role },
) {
  const response = await apiRequest<{ data: UserRecord }>('/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function updateUser(token: string, id: string, input: Partial<Pick<UserRecord, 'role' | 'active'>>) {
  const response = await apiRequest<{ data: UserRecord }>(`/api/v1/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  }, token);
  return response.data;
}
