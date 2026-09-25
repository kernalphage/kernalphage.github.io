# CLAUDE.md

## Globals / Config

Whenever possible, arbitrary tuning values should be defined in Globals. Nesting is fine.

## Globals / LazyLoaded fields

`src/Globals.ts` exports a singleton (`Globals`) with fields that are set once
at startup (e.g. `Spritesheet`, `activeCamera`) via `@LazyLoaded()` from
`src/lib/LazyLoaded.ts`.

Invariants:
- A `@LazyLoaded()` field throws if read before it is set — it never silently
  returns `null`/`undefined`. Do not add `if (!Globals.x)` guards around
  reads; if one throws, fix the initialization order instead of adding a guard.
- Each `@LazyLoaded()` field must be assigned exactly once, during startup
  (currently in `Game`'s constructor). Do not reassign after startup — these
  are "set once, read many" fields, not general mutable state.
- When adding a new field to `Globals` that is only available after some
  async/startup step, use `@LazyLoaded() accessor name!: T;` rather than
  `name: T | null` — keep `Globals` free of nullable fields.

