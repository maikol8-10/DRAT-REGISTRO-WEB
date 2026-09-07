# DRAT-REGISTRO-WEB

Panel web administrativo del sistema SICAF para el DRAT.

## Tecnologías

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Vitest

## Instalación

```powershell
npm.cmd install
```

## Ejecución local

```powershell
npm.cmd run dev
```

Abra la dirección que muestra Vite, normalmente `http://localhost:5173`.

## Validaciones

```powershell
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## Arquitectura inicial

```text
src/
  auth/          Sesión simulada y reglas de autorización
  components/    Estructura visual y componentes reutilizables
  config/        Definición de módulos y navegación
  pages/         Pantallas asociadas a las rutas
```

La sesión actual es ficticia y utiliza el rol `ADMINISTRADOR`. El componente `ProtectedRoute` y la función `canAccess` dejan preparada la incorporación de autenticación y permisos reales en el Entregable 3.

## Alcance de la base web

- Navegación entre Inicio, Administración, Consultas, Aprobaciones y Reportes.
- Diseño institucional adaptable a escritorio y pantallas pequeñas.
- Pantalla inicial con resumen operativo ficticio.
- Rutas preparadas para restringirse por rol.
- Páginas provisionales sin adelantar la implementación de los módulos posteriores.

## Evidencia de validación

El 7 de septiembre de 2026 se verificó la base web con los siguientes resultados:

- ESLint completado sin errores mediante `npm.cmd run lint`.
- Dos pruebas automatizadas de autorización aprobadas mediante `npm.cmd run test`.
- TypeScript y compilación de producción completados mediante `npm.cmd run build`.
- Navegación comprobada en el navegador para Administración, Consultas, Aprobaciones y Reportes.
- Consola del navegador comprobada sin errores ni advertencias.

El desarrollo se realiza en la rama `dev`; `main` se reserva para versiones estables.
