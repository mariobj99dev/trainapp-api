# AGENTS.md - TrainApp API

## Context
TrainApp API backend. Stack: NestJS, GraphQL, Prisma, PostgreSQL, Redis, Pino, JWT and 2FA.

The API is consumed by the TrainApp Flutter app. Any GraphQL contract change must consider mobile compatibility.

## Goal
Help agents code consistently in this API without overengineering.

Prefer clear code, small changes, explicit validation, secure defaults, consistent GraphQL contracts and Flutter compatibility.

Avoid clever abstractions, unrelated refactors, broad formatting changes and new patterns without clear benefit.

## Package manager
Use `pnpm`.

Common commands:

```bash
pnpm install
pnpm run start:dev
pnpm run build
pnpm run lint
pnpm run test
```

Do not mix `npm`, `pnpm` and `yarn`.

## Project structure
The API is organized by business domains.

Current domains: `auth/`, `users/`, `equipment/`, `exercises/`.

Future domains are expected, for example `workouts/`, `routines/`, `statistics/`, `nutrition/`, `notifications/`, `social/`, `payments/` or `admin/`.

Create a new top-level folder only when it represents a real business domain.

Shared infrastructure belongs in `common/`, `config/` and `prisma/`.

Avoid generic folders like `helpers`, `utils`, `misc`, `temp` or `new`.

## Domain pattern
A normal domain should follow this structure:

```text
src/<domain>/
  dto/
  models/
  selectors/
  types/
  <domain>.module.ts
  <domain>.resolver.ts
  <domain>.service.ts
```

Optional folders are allowed only when useful: `guards/`, `repositories/`, `mappers/`, `validators/`, `events/`, `strategies/`, `constants/`, `interfaces/`.

Responsibilities:

- Resolver: GraphQL entry point, guards, arguments and current user injection.
- DTO/Input: GraphQL input shape and validation decorators.
- Model: GraphQL output type.
- Service: business logic, authorization checks, Prisma operations and mapping.
- Selector: reusable Prisma projections.
- Repository: optional persistence abstraction when a service grows too much.
- Mapper: optional conversion between Prisma records and GraphQL models.

Rules:

- Keep resolvers thin.
- Do not put business logic in resolvers.
- Do not access Prisma directly from resolvers.
- Do not create god services.
- Split logic when it improves clarity.

## GraphQL rules
Use NestJS decorators and generated GraphQL schema.

Always use `@InputType()` for inputs, `@ObjectType()` for outputs, `@UseGuards(JwtAuthGuard)` for authenticated operations and `@CurrentUser()` for authenticated user context.

Never accept `userId` from client input when it comes from the token.

Never expose passwords, tokens, secrets, recovery codes or internal fields.

Do not hand-edit `src/schema.gql`.

Prefer additive contract changes. Do not make breaking schema changes without a migration plan.

Recommended naming: queries use `xById` or plural list names; mutations use `createX`, `updateX`, `deleteX`, `enableX`, `disableX`.

## Prisma rules
Prisma schema lives in `src/prisma/schema.prisma`.

Use UUID strings for primary IDs, DB columns in snake_case with `@map` when needed, and Prisma fields in camelCase.

Use explicit relations, intentional indexes and intentional cascade behavior.

Use Prisma `select` for public projections and avoid returning full records when unnecessary.

Do not edit generated Prisma client files.

## Security and ownership
Protected resolvers must use `JwtAuthGuard`.

User identity must come from `@CurrentUser()`.

Never trust `userId`, `sessionId`, `isAdmin` or ownership flags from input.

Enforce ownership in the service layer.

Do not duplicate authentication logic across domains.

Do not log secrets or sensitive payloads.

For scoped resources:

```ts
// Read
OR: [{ scope: 'SYSTEM' }, { scope: 'USER', userId }]

// Update/delete
{ id, scope: 'USER', userId }
```

Users must not modify `SYSTEM` resources unless an explicit admin feature exists.

## Validation and errors
DTOs must use `class-validator` decorators.

Use `@IsOptional()` for optional fields and validate string lengths, IDs, arrays and enums.

Use Nest exceptions consistently: `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`.

Prefer Spanish user-facing messages when consistent with the current API.

Do not leak internal implementation details in errors.

## Logging
The API uses Pino logging, request logging middleware and a global exception filter.

Log useful operational events and unexpected errors.

Never log passwords, tokens, authorization headers, cookies, 2FA secrets, recovery codes, raw session tokens or sensitive personal data.

## API documentation
This project is GraphQL-only and uses SpectaQL as the only official API documentation generator.

`src/schema.gql` is the source of truth for the public GraphQL contract.

Always document new or changed public contracts: queries, mutations, inputs, outputs, enums, auth/session behavior, error formats, environment requirements, important domain rules and Flutter integration notes.

When GraphQL contracts change:

1. Add or update GraphQL descriptions in code when useful.
2. Regenerate `src/schema.gql`.
3. Regenerate SpectaQL HTML documentation.
4. Update Markdown docs in `docs/` when business behavior changes.

Do not introduce Swagger, OpenAPI, Apollo Sandbox, GraphiQL, GraphQL Voyager or another API documentation system unless explicitly requested.

Use the `api-documentation` skill for detailed documentation work.

## Git and versioning
Use focused branches, meaningful commits, semantic versions and Git tags for releases.

Mention Flutter impact in release notes when the API contract changes.

Use the `git-versioning` skill for detailed branch, tag and release workflows.

## Testing and validation
Prefer validating changes with:

```bash
pnpm run lint
pnpm run build
pnpm run test
```

For GraphQL changes, verify that the generated schema reflects the intended contract.

If tests are missing for the touched area, state it clearly.

## Files to avoid editing manually
Do not manually edit `dist/`, `node_modules/`, `coverage/`, `src/prisma/generated/prisma/` or `src/schema.gql` unless explicitly requested.

Do not commit `.env`, logs, local IDE folders or temporary files.

## Agent workflow
When implementing a change:

1. Inspect similar existing code.
2. Follow the current domain pattern.
3. Keep the change focused.
4. Add/update DTOs and models if GraphQL changes.
5. Add guards and ownership checks when needed.
6. Update Prisma schema and migrations if storage changes.
7. Document API contract changes.
8. Consider Flutter impact.
9. Run or recommend validation commands.
10. Summarize what changed, why, validation and risks.
