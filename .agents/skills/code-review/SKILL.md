---
name: code-review
description: Use when reviewing backend changes before merge.
---

# Code Review

Check:

- Domain structure follows project pattern.
- Resolvers are thin.
- Services contain business logic.
- Prisma is not used directly in resolvers.
- Inputs have validation.
- Authenticated operations use guards.
- Ownership is enforced server-side.
- Sensitive fields are not exposed.
- Logs do not include secrets.
- GraphQL changes are documented.
- Flutter impact is mentioned.
- Migrations are safe.
- Tests or validation commands are present.

Return critical issues first, then improvements.
