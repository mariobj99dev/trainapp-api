---
name: create-mutation
description: Use when adding or modifying GraphQL mutations.
---

# Create Mutation

1. Inspect similar mutations first.
2. Use predictable names: `createX`, `updateX`, `deleteX`, `enableX`, `disableX`.
3. Create/update `@InputType()` DTOs.
4. Add `class-validator` decorators.
5. Protect authenticated mutations with `JwtAuthGuard`.
6. Use `@CurrentUser()` instead of accepting `userId`.
7. Enforce ownership in the service.
8. Update `updatedAt` when modifying records.
9. Use transactions when multiple writes must succeed together.
10. Log useful events without sensitive data.
11. Document contract changes and Flutter impact.
