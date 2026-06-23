const SENSITIVE_KEY = /(password|token|authorization|cookie|secret|api[-_]?key)/i
const REDACTED = '[REDACTED]'

/** Creates a safe, serializable copy suitable for application logs. */
export function sanitizeForLog(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined || typeof value !== 'object') {
    return value
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack
    }
  }

  if (seen.has(value)) {
    return '[Circular]'
  }
  seen.add(value)

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item, seen))
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? REDACTED : sanitizeForLog(item, seen)
    ])
  )
}
