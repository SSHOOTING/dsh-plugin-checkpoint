/**
 * Pure, dependency-free core for dsh-plugin-checkpoint (Checkpoint & Resume).
 * Reads only metadata from session events; never prompts, tool bodies or file contents.
 */

const SECRET_RE = /((?:token|key|secret|password|authorization|bearer)[^\s:=]{0,24}[:=]\s*)[^\s&]+/gi
const QUERY_RE = /([?&](?:token|key|secret|password|auth)=)[^&#\s]+/gi
/** Strip credential-looking substrings before anything is printed. */
export function redact(value: unknown): string {
  const text = value instanceof Error ? value.stack || value.message : String(value)
  return text.replace(SECRET_RE, '$1[redacted]').replace(QUERY_RE, '$1[redacted]')
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function analyze(events: readonly unknown[]): any {
  const list = Array.isArray(events) ? events : []
  const marks: any[] = []
  let lastSafeIndex = -1
  for (let i = 0; i < list.length; i++) {
    const e = list[i]
    if (!isRecord(e) || typeof e.type !== 'string') continue
    if (e.type.includes('error') || e.type.includes('fail')) continue
    if (e.type === 'tool/end' || e.type === 'tool/result' || e.type === 'assistant/message') {
      marks.push({ index: i, type: e.type })
      lastSafeIndex = i
    }
  }
  const hasOpenPlan = marks.length > 0 && lastSafeIndex < list.length - 1
  return {
    sampledEvents: list.length,
    safePoints: marks.length,
    lastSafeIndex,
    hasOpenPlan,
    resumeFrom: lastSafeIndex >= 0 ? lastSafeIndex : 0,
    canFork: marks.length > 1,
  }
}

export function formatReport(a: any, opts: { json?: boolean } = {}): string {
  if (opts.json) return JSON.stringify(a, null, 2)
  const head = '[checkpoint] ' + a.safePoints + ' safe point(s) · resume from #' + a.resumeFrom +
    (a.hasOpenPlan ? ' · open plan after last checkpoint' : '')
  const lines = [
    '  resume: jump to the last safe step',
    '  fork: ' + (a.canFork ? 'available (multiple safe points)' : 'need ≥2 safe points'),
    '  restore: session position + workspace diff + unfinished plan',
  ]
  return [head, ...lines].join('\n')
}
