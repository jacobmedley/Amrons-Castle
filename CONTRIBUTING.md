# Contribute to Amron's Castle

Start with [the backlog](BACKLOG.md) or an existing [issue](https://github.com/jacobmedley/Amrons-Castle/issues). Discuss larger changes before implementing them so the scope and acceptance criteria are clear. Read [the code of conduct](CODE_OF_CONDUCT.md).

## Set up a checkout

Use Node.js 24 or later. Fork and clone the repository, create a branch, and run these commands from its root:

```sh
npm ci
npm run dev
```

Open the address printed by Vite. The default Demo needs no account, backend or model service. Use fictional tasks to reproduce behavior.

## Report a bug or suggest an enhancement

- Use the [bug form](https://github.com/jacobmedley/Amrons-Castle/issues/new?template=bug_report.yml) for failures. Include the version/commit, mode, environment, reproduction steps and expected/actual behavior.
- Use the [enhancement form](https://github.com/jacobmedley/Amrons-Castle/issues/new?template=enhancement_request.yml) for ideas. Explain the user problem and acceptance criteria; link a backlog ID when applicable.
- Search existing issues first. Attach public-safe screenshots and relevant, redacted errors. Never post credentials, raw private run records or account telemetry.
- Follow [security reporting guidance](SECURITY.md) for vulnerabilities instead of posting exploit details publicly.

## Preserve the product boundaries

Keep agent IDs and roles stable when tasks or model assignments change. Amron's default identity remains independent of a model release. Proposed display-name customization must preserve stable IDs and offer restoration of the canonical defaults.

Keep Demo state visibly fictional. Missing, stale or partially read observations remain uncertain. Requested model settings do not establish runtime acceptance. Cache reuse, account allowance, cost and measured savings are different quantities.

Keep the scene independent of adapters. Integration credentials and execution belong on the host, never in this repository or browser bundle. Observation code must not run providers or approve work.

Use original or appropriately licensed artwork and record its provenance. Retain dependency notices. Do not add source game screenshots or extracted game sprites. Keep ambient events independent of task and model activity.

## Verify a change

Run the repository checks:

```sh
npm run typecheck
npm test
npm run build
```

For visual changes, inspect desktop and phone layouts, keyboard access, focused camera behavior, disclosures, pause and reduced motion. Add focused tests for changed behavior; avoid tests that only duplicate the implementation. Save public-safe evidence and describe untested cases.

## Submit a pull request

Describe the problem, resulting behavior, issue/backlog ID, checks and material limits. Update relevant docs, the `Unreleased` changelog and the enhancement ledger when shipping a feature. Keep build output, local configuration, secrets and private evidence out of the diff.

GitHub Actions checks types, tests and the build. A passing workflow does not replace visual inspection. Maintainers follow [the release procedure](docs/RELEASING.md) when preparing a version.
