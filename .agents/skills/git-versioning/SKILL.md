---
name: git-versioning
description: Use when creating branches, commits, tags, releases or versioning API changes.
---

# Git Versioning

## Branches
Use focused branches.

Recommended names:

- `feature/<short-name>`
- `fix/<short-name>`
- `refactor/<short-name>`
- `chore/<short-name>`
- `docs/<short-name>`
- `release/vX.Y.Z`
- `hotfix/vX.Y.Z`

Examples:

- `feature/workout-domain`
- `fix/session-expiration`
- `docs/graphql-contracts`

## Commits
Use small meaningful commits.

Recommended style:

- `feat: add workout domain`
- `fix: validate exercise ownership`
- `refactor: split auth service session logic`
- `docs: document equipment mutations`
- `chore: update dependencies`

## Semantic versioning
Use `MAJOR.MINOR.PATCH`.

- MAJOR: breaking API contract or incompatible app changes.
- MINOR: new backward-compatible features.
- PATCH: bug fixes and internal improvements.

## Tags
Create release tags as:

```bash
git tag -a vX.Y.Z -m "TrainApp API vX.Y.Z"
git push origin vX.Y.Z
```

## Release notes
Include:

1. Summary.
2. Added/changed/fixed.
3. GraphQL contract changes.
4. Database migrations.
5. Flutter impact.
6. Deployment notes.
