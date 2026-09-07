import { describe, expect, it } from 'vitest';

import { canAccess } from './authorization';

describe('canAccess', () => {
  it('permite a un administrador entrar a módulos administrativos', () => {
    expect(canAccess('ADMINISTRADOR', ['ADMINISTRADOR'])).toBe(true);
  });

  it('rechaza un rol que no está autorizado', () => {
    expect(canAccess('GUARDA', ['ADMINISTRADOR'])).toBe(false);
  });
});
