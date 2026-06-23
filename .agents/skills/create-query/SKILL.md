---
name: create-query
description: Use when adding or modifying GraphQL queries.
---

# Create Query

1. Inspect similar queries first.
2. Use predictable names: `xById` or plural list names.
3. Add `@UseGuards(JwtAuthGuard)` if authenticated.
4. Use `@CurrentUser()` when user scope is needed.
5. Validate arguments.
6. Use Prisma `select` or selectors.
7. Enforce ownership and scope in the service.
8. Add pagination for lists that can grow.
9. Return GraphQL models, not raw sensitive records.
10. Document contract changes and Flutter impact.
