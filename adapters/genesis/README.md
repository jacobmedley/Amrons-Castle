# Optional Genesis adapter

The standalone Castle needs no backend. The existing Genesis integration is a read-only host adapter that can serve the same static application.

Build the independent repository with `npm run build`, then copy `dist/client` into the host’s `pipeline/src/genesis_pipeline/web/castle` directory. The convenience command is:

```sh
node scripts/install-dashboard.mjs /absolute/path/to/genesis/pipeline/src/genesis_pipeline/web/castle
```

This copies assets before the entry point and writes a hash manifest. It does not restart services or change authentication. The host must already implement the versioned `/api/castle` endpoint and its existing authenticated run-detail routes. This repository does not package a Genesis server, database or private configuration.

Open `/castle/index.html?mode=live` on that host. The Demo link opens `/castle/index.html?demo=1&dashboard=1`. Without `mode=live`, the app starts its local simulation and never requests the endpoint. Public static hosting should use the default URL; manually choosing live mode without a compatible host displays an unavailable observation.

## Snapshot contract

The parser and types are in `src/live.ts`. The host supplies schema version 1, an observation time in Unix seconds, current role configuration, run summaries, and partial-read issues. A minimal empty response is:

```json
{"schema_version":1,"observed_at":1791324000,"roles":{},"runs":[],"issues":[]}
```

Use a current observation timestamp, not the example value. Roles expose `requested_model`, `requested_effort`, `accepted_model:null`, `accepted_effort:null`, and `source:"current_configuration"`. These configured requests do not establish what an older run used.

Runs require unique `thread` strings and string `task`, `state`, `stage` fields. Optional `status` and `updated` are strings; `gate` is an object or null. `busy` must be null or contain a verified positive integer process ID. The host must verify ownership; a fabricated ID or a running label alone is not evidence of work.

Research maps to Orin, design to Liora, frontend to Borin, copywriter to Quill, and waiting reviews to Amron. Completed runs have no current character owner. Mira and Flint have no separate automatic pipeline role in this adapter. Unknown stages remain unassigned.

Snapshots and their read issues must come from the same scan. Failed database enumeration must report failure rather than an empty success. The client polls while visible, retains labeled last-known records on failure, and stops motion for stale or partial observations. Review links return to `/#/run/<encoded-thread>`; the Castle sends no mutations.
