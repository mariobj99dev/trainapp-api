# Flutter integration

Generate Flutter GraphQL types from the schema or from the operations used by the app; do not hand-maintain a second copy of API types. Regenerate client code after pulling a schema/documentation update.

Store access and refresh tokens in platform secure storage. Attach the access token as a Bearer header, serialize refreshes so only one request rotates a refresh token at a time, then retry the original operation once. If refresh fails, clear local authentication state and return to sign-in.

The `login` result is a union-like nullable response: branch on `requiresTwoFactor`. Only read tokens and `user` when it is false; only navigate to code entry when it is true. Treat recovery codes and 2FA setup fields as sensitive UI data.

`scope` is currently a string in the GraphQL contract. Render `SYSTEM` resources as read-only and avoid assuming additional values will be writable. Use nullable fields deliberately: omitted optional input fields leave values unchanged on updates, while `description: null` clears the description.
