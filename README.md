# dsh-plugin-checkpoint

**Save the session position, workspace diff and open plan so an interrupted task can resume or fork from the last safe point.**

This is one of 14 read-only observability plugins for the DSH agent lifecycle (theme: **Checkpoint & Resume**). It reads only metadata from session events — never prompts, tool bodies, or file contents — and makes no network calls.

## Install

```powershell
dsh plugin --profile web add dsh-plugin-checkpoint
```

Requires Node `^22.19.0 || >=24` and DSH `>=0.2.0-rc.2 <0.3.0`.

## 30-second demo

1. Use DSH normally for a few turns.
2. In any session, type `/checkpoint`.
3. You get a compact, read-only report; use `/checkpoint --json` for machine-readable output.

```text
[checkpoint] 4 safe point(s) · resume from #8 · open plan after last checkpoint
  resume: jump to the last safe step
  fork: available (multiple safe points)
  restore: session position + workspace diff + unfinished plan
```

## What it reads

Session event metadata only: event types, tool names, token counts, and route names. Credential-looking values are redacted before display. No file contents or prompts are read, stored, or transmitted.

## License

MIT — SSHOOTING.
