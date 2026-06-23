# Authorization and ownership

Protected GraphQL operations require a valid access JWT and a still-active server-side session. The API derives the user and session identity from that token; clients must never send ownership identifiers as a substitute.

Equipment and exercises are scoped:

- `SYSTEM` records are readable by authenticated users and are catalog data.
- `USER` records are readable only by their owner.
- Creation always creates a `USER` record for the authenticated user.
- Updating is allowed only for the owner's `USER` record. System records cannot be updated through the public API.

An exercise may reference only equipment that is accessible to its owner (system equipment or the same user's equipment). Updating `equipmentIds` replaces the complete association list.

Sessions are owned by the token user. `sessions` exposes only that user's sessions, and `revokeSession` rejects another user's session identifier.
