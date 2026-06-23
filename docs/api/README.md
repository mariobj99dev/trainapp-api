# API Documentation

TrainApp API is GraphQL-only.

The official generated API documentation tool is **SpectaQL**.

Documentation flow:

```text
src/schema.gql
  ↓
SpectaQL
  ↓
docs/generated/graphql/
```

Use this folder for practical API documentation that complements the generated SpectaQL HTML documentation:

- [Authentication, JWT sessions and 2FA](auth.md)
- [Authorization and ownership](authorization.md)
- [Errors](errors.md)
- [Pagination and filters](pagination.md)
- [Flutter integration](flutter-integration.md)
- Domain rules: [equipment](../domains/equipment.md), [exercises](../domains/exercises.md) and [users](../domains/users.md)

Generate the static reference with `pnpm run docs:graphql`. The output is written to `docs/generated/graphql/`.

Do not use Swagger, OpenAPI, Apollo Sandbox, GraphiQL, GraphQL Voyager or another API documentation system unless explicitly requested.
