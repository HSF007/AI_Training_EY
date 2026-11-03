// Run history (same fields as rag_feedback.csv) kept in localStorage.
// Contains no API keys, so it is stored as plain JSON.

const LOG_KEY = 'rag-ui:log'

const CSV_COLUMNS = [
  'timestamp',
  'label',
  'model',
  'question',
  'answer',
  'retrieved_chunk_ids',
  'best_distance',
  'total_seconds',
  'feedback',
  'error',
]

export function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY)) ?? []
  } catch {
    return []
  }
}

export function saveLog(rows) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(rows))
  } catch (err) {
    alert('Could not save history (localStorage may be full). Export CSV and clear history.')
    console.error(err)
  }
}

// Same format as Python's datetime.now().isoformat(timespec="seconds")
export function localTimestamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function csvCell(value) {
  let text = String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}` // stop spreadsheet formula injection
  return `"${text.replace(/"/g, '""')}"`
}

export function downloadCsv(rows) {
  const lines = [CSV_COLUMNS.join(',')]
  for (const row of rows) lines.push(CSV_COLUMNS.map((c) => csvCell(row[c])).join(','))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rag_feedback_${localTimestamp().replace(/:/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// One "question" = one Compare click. Older rows have no runId, so fall back.
const runKey = (r) => r.runId ?? `${r.timestamp}|${r.question}`

export function countQuestions(rows) {
  return new Set(rows.map(runKey)).size
}

// One row per model label with timing and feedback stats.
export function summarize(rows) {
  const byLabel = new Map()
  for (const r of rows) {
    const s = byLabel.get(r.label) ?? {
      label: r.label,
      model: r.model,
      runs: 0,
      times: [],
      correct: 0,
      incorrect: 0,
      notRated: 0,
      errors: 0,
    }
    s.runs += 1
    if (r.error) s.errors += 1
    else s.times.push(Number(r.total_seconds))
    if (r.feedback === 'Correct') s.correct += 1
    else if (r.feedback === 'Incorrect') s.incorrect += 1
    else s.notRated += 1
    byLabel.set(r.label, s)
  }

  return [...byLabel.values()].map(({ times, ...s }) => {
    const sorted = [...times].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const rated = s.correct + s.incorrect
    return {
      ...s,
      rated,
      avgSeconds: sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : null,
      medianSeconds: sorted.length
        ? sorted.length % 2
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2
        : null,
      minSeconds: sorted.length ? sorted[0] : null,
      maxSeconds: sorted.length ? sorted[sorted.length - 1] : null,
      accuracy: rated ? s.correct / rated : null,
      errorRate: s.runs ? s.errors / s.runs : 0,
    }
  })
}

// Response time per question, one key per model label (for the line chart).
export function latencyTrend(rows) {
  const runs = new Map()
  for (const r of rows) {
    const key = runKey(r)
    if (!runs.has(key)) runs.set(key, { question: r.question })
    if (!r.error) runs.get(key)[r.label] = Number(r.total_seconds)
  }
  return [...runs.values()].map((point, i) => ({ run: i + 1, ...point }))
}
