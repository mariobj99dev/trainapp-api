---
name: api-documentation
description: Use when GraphQL queries, mutations, DTOs, models, public contracts, domain rules, auth behavior, error formats or Flutter integration notes change.
---

# API Documentation with SpectaQL

## Goal

Keep TrainApp GraphQL documentation accurate, useful and easy to maintain.

This API is GraphQL-only. SpectaQL is the only official generated API documentation tool.

Do not introduce Swagger, OpenAPI, Apollo Sandbox, GraphiQL, GraphQL Voyager or another API documentation system unless the user explicitly requests it.

## Source of truth

The documentation flow is:

```text
NestJS GraphQL decorators
        ↓
src/schema.gql
        ↓
SpectaQL
        ↓
docs/generated/graphql/
```

`src/schema.gql` is generated output and the source used by SpectaQL.

Do not hand-edit `src/schema.gql`.

## What to document

Document useful API behavior, not only operation names.

Document changes or important behavior related to:

- GraphQL queries and mutations.
- Input DTOs and output models.
- Enums and status values.
- Authentication, sessions, JWT and 2FA flows.
- Authorization and ownership rules.
- Error formats and common error cases.
- Pagination, filters and sorting.
- Environment variables required by API behavior.
- Redis/cache behavior when relevant.
- Prisma/domain model relationships when relevant.
- Breaking changes and migration notes.
- Flutter integration notes.

## GraphQL descriptions

Prefer code-level GraphQL descriptions for information that belongs in the schema.

Use descriptions on:

- `@Query(..., { description: '...' })`
- `@Mutation(..., { description: '...' })`
- `@ObjectType({ description: '...' })`
- `@InputType({ description: '...' })`
- `@Field(..., { description: '...' })`

Add descriptions when:

- the operation has ownership rules
- authentication is required
- the result includes both `SYSTEM` and `USER` resources
- nullability has business meaning
- enum values need explanation
- the operation has side effects
- a field is deprecated
- Flutter compatibility matters

Avoid noisy descriptions for obvious fields.

## SpectaQL rules

SpectaQL must generate static HTML documentation from `src/schema.gql`.

Preferred output:

```text
docs/generated/graphql/
```

Preferred config file:

```text
spectaql.yml
```

Preferred command:

```bash
pnpm run docs:graphql
```

If SpectaQL is not installed yet, propose adding it as a dev dependency and adding the docs command.

Expected package script:

```json
{
  "scripts": {
    "docs:graphql": "spectaql spectaql.yml"
  }
}
```

Do not choose another tool unless explicitly requested.

## Markdown documentation

Use Markdown docs for behavior that cannot be understood from the schema alone.

Suggested structure:

```text
docs/
  api/
    README.md
    auth.md
    errors.md
    pagination.md
    flutter-integration.md
  domains/
    equipment.md
    exercises.md
    users.md
  operations/
    examples.md
  generated/
    graphql/
```

Do not duplicate the entire schema manually in Markdown.

Use Markdown for:

- flows
- examples
- domain rules
- error conventions
- Flutter integration notes
- migration notes
- security and ownership explanations

## When API changes

1. Identify changed queries, mutations, inputs, outputs, enums or domain behavior.
2. Mark whether the change is breaking or non-breaking.
3. Add or update GraphQL descriptions in code when useful.
4. Regenerate `src/schema.gql`.
5. Regenerate SpectaQL documentation.
6. Update Markdown docs if business behavior changed.
7. Include operation examples when useful.
8. Mention Flutter impact.
9. Include migration notes for breaking changes.
10. Mention validation, authorization and ownership behavior when relevant.

## Documentation style

Keep documentation practical and concise.

Prefer:

- what it does
- who can use it
- authentication requirements
- inputs
- outputs
- errors
- examples
- ownership rules
- Flutter impact

Avoid:

- documenting implementation details that do not help users or maintainers
- duplicating generated schema content manually
- adding extra documentation tools
