---
name: create-domain
description: Use when adding a new business domain or top-level module.
---

# Create Domain

1. Confirm the feature is a real business domain.
2. Create `src/<domain>/`.
3. Add module, resolver and service.
4. Add `dto/`, `models/`, `selectors/` and `types/` only as needed.
5. Keep resolver thin.
6. Put business logic and authorization in service.
7. Use `@CurrentUser()` for authenticated context.
8. Add Prisma schema/migration if persistence is needed.
9. Add GraphQL DTOs/models.
10. Validate inputs.
11. Document API contract changes.
12. Mention Flutter impact.
