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
Copy-Item .env.example .env
npm.cmd run dev
```

Abra la dirección que muestra Vite, normalmente `http://localhost:5173`. Si no existe una sesión
activa, el panel redirige a `/login`.

## Autenticación y usuarios

- El inicio de sesión utiliza `POST /api/v1/auth/login`.
- El token JWT se conserva solo durante la sesión de la pestaña mediante `sessionStorage`.
- Cerrar sesión elimina el token local.
- Administración permite crear usuarios, asignar los roles `ADMINISTRADOR` y `GUARDA`, y activar
  o desactivar cuentas.
- Un administrador no puede desactivar su propia cuenta ni retirar su propio rol.

La API y PostgreSQL deben estar en ejecución antes de iniciar sesión.

## Validaciones

```powershell
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## Arquitectura inicial

```text
src/
  auth/          Sesión JWT y reglas de autorización
  components/    Estructura visual y componentes reutilizables
  config/        Definición de módulos y navegación
  pages/         Pantallas asociadas a las rutas
```

El componente `ProtectedRoute` verifica la sesión y el rol antes de mostrar cada módulo.

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

## Comunicación con el backend

La variable `VITE_API_URL` define la dirección del backend y utiliza `http://localhost:3000` en desarrollo. La pantalla inicial consulta `GET /health` y muestra el estado de la API. El archivo `.env` está excluido de Git y `.env.example` no contiene secretos.

La arquitectura completa y las comunicaciones se encuentran en el repositorio `DRAT-REGISTRO-API`, dentro de `docs/architecture.md`, y en el [diagrama editable de FigJam](https://www.figma.com/board/JniN3acMMwkc28n4GDimNq).

El 7 de septiembre de 2026 se verificaron ESLint, pruebas y compilación de producción después de incorporar la comunicación con el backend.
