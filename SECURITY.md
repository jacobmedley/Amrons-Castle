# Report a security issue

Security fixes target the latest published `0.x` release. There is no long-term support branch or guaranteed response time.

Do not post credentials, tokens, private dashboard addresses, account records or exploit details in public issues. Use **Report a vulnerability** in the repository's Security tab when GitHub private reporting is available. If that option is unavailable, open an issue requesting a private reporting channel without describing the vulnerability or attaching sensitive data.

Include the affected version, impact, a minimal reproduction and any suggested mitigation through the private channel. If you exposed a real credential, revoke it through its provider; deleting a public comment does not undo disclosure.

The standalone Demo makes no model calls and needs no credentials. Optional integrations depend on the host's authentication and access controls. The Castle is an observation interface, not an execution or authorization boundary.
