# Authentication, sessions and 2FA

Unauthenticated operations are `register`, `login`, `verifyTwoFactorLogin`, and `refreshToken`. All other current operations require an `Authorization: Bearer <accessToken>` header.

## Account and session flow

1. Call `register` with account data and a stable `deviceId`, or call `login` with existing credentials.
2. When `login.requiresTwoFactor` is `false`, store the returned `accessToken` and `refreshToken` with the returned user.
3. When `login.requiresTwoFactor` is `true`, do not treat the login as complete. Send its `twoFactorChallengeToken`, a TOTP or recovery code, and device data to `verifyTwoFactorLogin`.
4. Use the access token for protected operations. On expiry, call `refreshToken`; it invalidates the submitted refresh token and returns a replacement pair.
5. Call `logout` to revoke the current session. `revokeSession` may revoke only a session belonging to the authenticated user.

One active session is retained per user and `deviceId`; signing in again from the same device replaces its earlier session. A revoked session makes its access token unusable even before JWT expiry.

Treat both token types as secrets. Do not put them in logs, analytics events, screenshots, or source control.

## Two-factor authentication

`startTwoFactorSetup` returns a QR data URL, an `otpauth` URI, and a manual secret. These values are setup secrets and should be displayed only while the user is enrolling an authenticator.

Confirm setup with `confirmTwoFactorSetup(code)`. Its recovery codes are returned once only; require the user to store them securely. A six-digit TOTP code or an unused recovery code can complete a future login and can disable 2FA through `disableTwoFactor`.

Login challenges are short-lived and have limited attempts. The client should restart with `login` when the challenge expires or is rejected.
