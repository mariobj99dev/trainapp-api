# Error conventions

GraphQL failures are returned in the standard GraphQL `errors` array. User-facing messages are generally Spanish; applications should use an error code or operation context for control flow rather than relying only on message text.

Common categories are:

- `BAD_USER_INPUT` / bad request: input validation, an empty update, inaccessible equipment IDs, or an invalid 2FA setup code.
- `UNAUTHENTICATED`: missing, expired, invalid, or revoked session token; invalid credentials; invalid refresh token; or invalid 2FA challenge/code.
- `FORBIDDEN`: an authenticated user attempting to revoke another user's session.
- `NOT_FOUND`: an inaccessible or nonexistent equipment/exercise record. Ownership is intentionally not disclosed.
- `CONFLICT`: duplicate email or username, or attempting to start 2FA when it is already active.

Input validation removes unknown fields and rejects requests containing them. In production, detailed validation internals and server stack traces are not part of the public contract.
