# Documentos LCC

Formulario público para que clientes de **La Caja Chica** dejen sus datos y documentos antes de operar. Es una app aparte de ProFlow OS, pensada para conectarse con él más adelante.

## Stack

Next.js 16 + React 19 + TypeScript + Tailwind CSS 4, con Server Actions que suben los archivos y guardan la solicitud directo en Supabase (mismo proyecto de ProFlow OS, tabla `operation_requests` + bucket `documentos-solicitudes`).

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con las credenciales de Supabase
npm run dev                  # http://localhost:3000
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (el mismo que usa ProFlow OS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — sólo se usa en el servidor (Server Actions), nunca se expone al navegador |

Antes de desplegar, correr en el SQL Editor de Supabase la migración `supabase/029_operation_requests.sql` del repo de ProFlow OS (crea la tabla `operation_requests` y el bucket privado `documentos-solicitudes`).

## Deploy (Easypanel)

App tipo Node/Next.js, build automático (`npm run build`, `npm run start`). Configurar las mismas dos variables de entorno de la tabla anterior en el servicio de Easypanel.
