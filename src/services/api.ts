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

export interface EmployeeRecord {
  id: string;
  identification: string;
  name: string;
  department: string;
  position: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FuelType = 'GASOLINA' | 'DIESEL' | 'ELECTRICO' | 'HIBRIDO' | 'OTRO';

export interface InstitutionalVehicleRecord {
  id: string;
  plate: string;
  assetCode: string;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  ownershipType: 'INSTITUCIONAL';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrivateVehicleRecord {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  ownerEmployeeId: string;
  ownershipType: 'PARTICULAR';
  active: boolean;
  owner: Pick<EmployeeRecord, 'id' | 'identification' | 'name' | 'department' | 'active'>;
  createdAt: string;
  updatedAt: string;
}

export interface NfcTagRecord {
  id: string;
  code: string;
  employeeId: string;
  active: boolean;
  employee: Pick<EmployeeRecord, 'id' | 'identification' | 'name' | 'department' | 'position' | 'active'>;
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

export async function getEmployees(token: string, search = '') {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  const response = await apiRequest<{ data: EmployeeRecord[] }>(`/api/v1/catalogs/employees${query}`, {}, token);
  return response.data;
}

export async function createEmployee(
  token: string,
  input: Pick<EmployeeRecord, 'identification' | 'name' | 'department' | 'position'>,
) {
  const response = await apiRequest<{ data: EmployeeRecord }>('/api/v1/catalogs/employees', {
    method: 'POST',
    body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function updateEmployee(
  token: string,
  id: string,
  input: Partial<Pick<EmployeeRecord, 'name' | 'department' | 'position' | 'active'>>,
) {
  const response = await apiRequest<{ data: EmployeeRecord }>(`/api/v1/catalogs/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function getInstitutionalVehicles(token: string, search = '') {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  const response = await apiRequest<{ data: InstitutionalVehicleRecord[] }>(`/api/v1/catalogs/institutional-vehicles${query}`, {}, token);
  return response.data;
}

export async function createInstitutionalVehicle(
  token: string,
  input: Pick<InstitutionalVehicleRecord, 'plate' | 'assetCode' | 'brand' | 'model' | 'year' | 'fuelType'>,
) {
  const response = await apiRequest<{ data: InstitutionalVehicleRecord }>('/api/v1/catalogs/institutional-vehicles', {
    method: 'POST', body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function updateInstitutionalVehicle(
  token: string,
  id: string,
  input: Partial<Pick<InstitutionalVehicleRecord, 'assetCode' | 'brand' | 'model' | 'year' | 'fuelType' | 'active'>>,
) {
  const response = await apiRequest<{ data: InstitutionalVehicleRecord }>(`/api/v1/catalogs/institutional-vehicles/${id}`, {
    method: 'PATCH', body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function getPrivateVehicles(token: string, search = '') {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  const response = await apiRequest<{ data: PrivateVehicleRecord[] }>(`/api/v1/catalogs/private-vehicles${query}`, {}, token);
  return response.data;
}

export async function createPrivateVehicle(
  token: string,
  input: Pick<PrivateVehicleRecord, 'plate' | 'brand' | 'model' | 'color' | 'ownerEmployeeId'>,
) {
  const response = await apiRequest<{ data: PrivateVehicleRecord }>('/api/v1/catalogs/private-vehicles', {
    method: 'POST', body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function updatePrivateVehicle(
  token: string,
  id: string,
  input: Partial<Pick<PrivateVehicleRecord, 'brand' | 'model' | 'color' | 'ownerEmployeeId' | 'active'>>,
) {
  const response = await apiRequest<{ data: PrivateVehicleRecord }>(`/api/v1/catalogs/private-vehicles/${id}`, {
    method: 'PATCH', body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function getNfcTags(token: string) {
  const response = await apiRequest<{ data: NfcTagRecord[] }>('/api/v1/catalogs/nfc-tags', {}, token);
  return response.data;
}

export async function createNfcTag(token: string, input: { code: string; employeeId: string }) {
  const response = await apiRequest<{ data: NfcTagRecord }>('/api/v1/catalogs/nfc-tags', { method: 'POST', body: JSON.stringify(input) }, token);
  return response.data;
}

export async function updateNfcTag(token: string, id: string, input: { employeeId?: string; active?: boolean }) {
  const response = await apiRequest<{ data: NfcTagRecord }>(`/api/v1/catalogs/nfc-tags/${id}`, { method: 'PATCH', body: JSON.stringify(input) }, token);
  return response.data;
}
