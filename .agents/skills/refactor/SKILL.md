---
name: refactor
description: Use when improving code structure without changing behavior.
---

# Refactor

1. Preserve behavior and GraphQL contracts.
2. Keep changes focused.
3. Prefer extracting small private methods before creating new abstractions.
4. Introduce repositories or mappers only when they reduce complexity.
5. Do not move code across domains unless ownership becomes clearer.
6. Run lint/build/tests when possible.
7. Explain what stayed functionally unchanged.
