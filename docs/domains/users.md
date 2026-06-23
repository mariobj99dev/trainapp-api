# Users domain

`me` returns the authenticated user's public account and profile. `users` requires authentication and returns public user account data, including email, username, status, administrator flag, creation time, and optional profile.

The public contract does not expose credentials, authentication tokens, 2FA secrets, or recovery codes (except the one-time response from `confirmTwoFactorSetup`). There are no user update or administration mutations in the current GraphQL schema.
