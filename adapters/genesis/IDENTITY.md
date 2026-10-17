# Optional ChatGPT identity observation

The Castle's live view can read a separate, authenticated `GET /api/castle/identity` endpoint. The current Genesis adapter does **not** implement this endpoint. This document defines the client contract for a future host connection; deploying the static build alone does not connect ChatGPT pets or dots.

The host must authenticate the viewer, obtain explicit authorization for any ChatGPT account data, check ownership, and return `Cache-Control: no-store`. It must report unavailable data as unavailable rather than inventing a selection. Keep credentials, upstream pet URLs and raw private records on the host. Do not put these values in the static build, committed fixtures or query parameters.

Example with fictional values:

```json
{
  "schema_version": 1,
  "source": "chatgpt_work",
  "observed_at": 1792000000,
  "pet": {
    "availability": "available",
    "selected": { "id": "sample-pet", "name": "Sample pet", "artwork_revision": "revision-1" }
  },
  "dot": {
    "availability": "available",
    "selected": {
      "id": "sample-dot", "name": "Sample dot",
      "tasks": [ { "id": "sample-task", "title": "Sample task", "state": "waiting" } ]
    }
  }
}
```

`observed_at` is the host's Unix-seconds observation time. The Castle regards an observation as current for 30 seconds, checks while visible about every 15 seconds, and falls back when the request fails or becomes stale. Each of `pet` and `dot` independently reports `availability: "unavailable"` with no `selected` field, or `availability: "available"` with `selected: null` when the host verified there is no selection.

The `id` is a stable opaque account identity, never the display name. `artwork_revision` changes whenever the selected pet's artwork changes. When a pet is selected, the host also serves `GET /api/castle/companion-artwork` on the same authenticated origin as a transparent PNG or WebP image, at most 4 MB and 1024 × 1024 pixels, with `Cache-Control: no-store`. The host resolves and refreshes any expiring upstream URLs. The Castle reads the image as a bitmap and draws it in the Royal War Room, or shows bundled LOKI if loading fails. This artwork is decorative and follows the Castle's Pause motion and reduced-motion controls.

Dot tasks are a bounded, current host observation with unique opaque IDs, titles and states `working`, `waiting`, `complete` or `unknown`. The host must derive states from its own authoritative task source; an empty array means no delegated tasks in that observation. The Castle displays these records read-only. It never delegates, approves or changes agent permissions. Reviews remain in ChatGPT. The local **Use Dot for the coordinator** name setting is independent of the reported dot identity.

No public ChatGPT pet or dot endpoint is assumed by this contract. Integrating a host requires an authorized source and server implementation, followed by real account and selection-change verification.
