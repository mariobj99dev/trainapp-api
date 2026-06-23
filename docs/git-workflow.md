# Flujo Git y versionado

## Ramas

`main` será la rama principal cuando se complete la migración desde `master`. Debe permanecer desplegable y aceptar cambios únicamente mediante pull request con las validaciones requeridas.

Las ramas de trabajo nacen de `main`, deben ser cortas y usar uno de estos prefijos:

- `feature/<tema>` para funcionalidad compatible nueva.
- `fix/<tema>` para correcciones.
- `refactor/<tema>` para cambios estructurales sin cambio de comportamiento.
- `docs/<tema>` para documentación.
- `chore/<tema>` para mantenimiento.
- `release/vX.Y.Z` para estabilizar una versión.
- `hotfix/vX.Y.Z` para una corrección urgente desde un tag productivo.

No se usa una rama `develop`: el proyecto adopta un flujo trunk-based ligero.

## Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add exercises domain
fix: reject revoked sessions
docs: document GraphQL authentication flow
refactor: split session token handling
chore: update pnpm lockfile
```

Mantener cada commit enfocado, validable y sin mezclar cambios no relacionados. Los cambios del contrato GraphQL incluyen la actualización de `src/schema.gql`, SpectaQL y documentación de Flutter cuando aplique.

## Semantic Versioning

La API sigue `MAJOR.MINOR.PATCH`.

- `PATCH`: correcciones compatibles, mantenimiento interno y documentación.
- `MINOR`: funcionalidad o contrato GraphQL aditivo compatible.
- `MAJOR`: eliminación o renombrado de operaciones/campos, cambios incompatibles de tipos/nullability o cambios de autenticación que obliguen a actualizar Flutter.

Antes de `1.0.0`, mantener la misma disciplina: documentar siempre los cambios incompatibles y coordinar su despliegue con Flutter.

## Releases y tags

Para una release normal, crear `release/vX.Y.Z` desde `main`, actualizar `package.json`, `pnpm-lock.yaml` y `CHANGELOG.md`, y abrir un pull request. Tras fusionarlo y validar el despliegue, crear un tag anotado sobre el commit de `main`:

```bash
git tag -a vX.Y.Z -m "TrainApp API vX.Y.Z"
git push origin vX.Y.Z
```

Las notas de release deben incluir resumen, cambios GraphQL, migraciones de Prisma, impacto en Flutter y requisitos de despliegue.

## Hotfixes

Crear `hotfix/vX.Y.Z` desde el último tag productivo. Aplicar la corrección mínima, incrementar `PATCH`, actualizar el changelog y abrir un pull request hacia `main`. Tras la fusión, crear el tag de la versión corregida.

## Impacto en Flutter

Los cambios GraphQL aditivos deben desplegarse antes de que Flutter los consuma. Tras cada cambio de contrato, regenerar los tipos/operaciones del cliente y comprobar compatibilidad con la versión de app publicada.

Para cambios incompatibles, definir una ventana de migración: mantener el contrato antiguo durante la adopción de Flutter o publicar una versión `MAJOR` con instrucciones claras de actualización. Nunca depender solo de mensajes de error para controlar flujos del cliente.

## Migración pendiente de master a main

La migración se hará cuando el árbol esté limpio, los cambios actuales estén integrados mediante pull request y CI/CD esté preparado. Primero se publicará `main`, se configurará como rama predeterminada y se actualizarán los consumidores. `master` no se borrará hasta una decisión explícita posterior.
