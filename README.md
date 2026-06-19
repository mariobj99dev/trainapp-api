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
npm install
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
