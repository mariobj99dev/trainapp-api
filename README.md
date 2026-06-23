# TrainApp API

API NestJS con GraphQL, Prisma y Redis.

## Configuracion

La aplicacion se configura exclusivamente mediante variables de entorno. Copia `.env.example` para entornos locales o define las mismas variables en tu plataforma de despliegue.

```env
PORT=3000
NODE_ENV=production

DATABASE_URL=

JWT_ACCESS_SECRET=

REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
```

`DATABASE_URL`, `JWT_ACCESS_SECRET`, `REDIS_HOST`, `PORT`, `NODE_ENV` y `REDIS_PORT` son obligatorias. `REDIS_PASSWORD` puede quedar vacia cuando Redis no requiere autenticacion.

En Docker y Coolify define estas variables desde el entorno del servicio. La imagen no fija valores de configuracion internos.

## Instalacion

```bash
corepack enable
pnpm install
```

## Desarrollo

```bash
npm run start:dev
```

## Produccion

```bash
npm run build
npm run start:prod
```

## Prisma

Prisma usa `DATABASE_URL` desde el entorno para migraciones y generacion del cliente.

## Logs y Coolify

La API usa Pino. Los logs siempre se escriben primero en `stdout` para que Coolify los capture. En `development` son legibles, incluyen el `requestId`, metadatos HTTP y body/query/params saneados; en `production` son JSON estructurado y no incluyen payloads ni cabeceras completas.

| Variable | Development | Production |
| --- | --- | --- |
| `NODE_ENV` | `development` | `production` |
| `LOG_LEVEL` | `debug` | `info` |
| `LOG_TO_FILE` | `false` | `false` |
| `LOG_DIR` | opcional | `/app/logs` solo con volumen persistente |

Ejemplo local:

```env
NODE_ENV=development
LOG_LEVEL=debug
LOG_TO_FILE=false
```

Ejemplo Coolify:

```env
NODE_ENV=production
LOG_LEVEL=info
LOG_TO_FILE=false
```

La alternativa de archivo es opcional: configura `LOG_TO_FILE=true`, `LOG_DIR=/app/logs` y monta `/app/logs` como volumen persistente en Coolify. Sin volumen, esos archivos se pierden al redeplegar; por eso `stdout` es la recomendación principal.

Se redactan automáticamente `password`, `passwordHash`, `token`, `accessToken`, `refreshToken`, `authorization`, `cookie`, `secret` y `apiKey` (sin distinguir mayúsculas). Registra identificadores, cambios de estado y fallos operativos; no registres secretos, tokens, cabeceras completas, datos personales ni payloads completos en producción.
