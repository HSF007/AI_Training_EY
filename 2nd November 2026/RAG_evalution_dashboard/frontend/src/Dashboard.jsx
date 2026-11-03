import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import { summarize, countQuestions, latencyTrend } from './log'

const COLORS = [
  '#646cff', '#2f9e66', '#e5484d', '#f5a524', '#0ea5e9',
  '#a855f7', '#ec4899', '#14b8a6', '#84cc16', '#f97316',
]
const FEEDBACK_COLORS = { correct: '#2f9e66', incorrect: '#e5484d', notRated: '#9ca3af', errors: '#f5a524' }

const fmt = (n, digits = 2) => (n === null || n === undefined ? '—' : Number(n).toFixed(digits))
const pct = (v) => (v === null || v === undefined ? '—' : `${Math.round(v * 100)}%`)
const shorten = (text, max = 60) => (text.length > max ? `${text.slice(0, max)}…` : text)

// Shared chart styling; Canvas/CanvasText follow Vite's light/dark color-scheme.
const axisProps = { tick: { fill: 'currentColor', fontSize: 12 }, stroke: 'currentColor', strokeOpacity: 0.3 }
const tooltipProps = {
  contentStyle: {
    background: 'Canvas',
    color: 'CanvasText',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 13,
  },
  labelStyle: { color: 'CanvasText', fontWeight: 600 },
}
const barCursor = { fill: 'currentColor', fillOpacity: 0.06 }

function Kpi({ title, value, detail }) {
  return (
    <div className="kpi">
      <span className="kpi-title">{title}</span>
      <span className="kpi-value">{value}</span>
      <span className="muted kpi-detail">{detail}</span>
    </div>
  )
}

function ChartCard({ title, children, wide = false }) {
  return (
    <div className={wide ? 'chart-card wide' : 'chart-card'}>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export default function Dashboard({ log, onExport, onClear }) {
  if (log.length === 0) {
    return (
      <section className="card">
        <h2>Dashboard</h2>
        <p className="muted">Ask a question on the Compare tab to start collecting results.</p>
      </section>
    )
  }

  const stats = summarize(log)
  const colorOf = Object.fromEntries(stats.map((s, i) => [s.label, COLORS[i % COLORS.length]]))

  // ----- overall numbers -----
  const totalQuestions = countQuestions(log)
  const rated = stats.reduce((n, s) => n + s.rated, 0)
  const correct = stats.reduce((n, s) => n + s.correct, 0)
  const errors = stats.reduce((n, s) => n + s.errors, 0)
  const okRows = log.filter((r) => !r.error)
  const overallAvg = okRows.length
    ? okRows.reduce((sum, r) => sum + Number(r.total_seconds), 0) / okRows.length
    : null

  const withAccuracy = stats.filter((s) => s.accuracy !== null)
  const best = withAccuracy.length
    ? withAccuracy.reduce((a, b) =>
        b.accuracy > a.accuracy || (b.accuracy === a.accuracy && b.rated > a.rated) ? b : a,
      )
    : null
  const timed = stats.filter((s) => s.avgSeconds !== null)
  const fastest = timed.length ? timed.reduce((a, b) => (b.avgSeconds < a.avgSeconds ? b : a)) : null

  // ----- chart data -----
  const chartData = stats.map((s) => ({
    label: s.label,
    accuracy: s.accuracy === null ? null : Math.round(s.accuracy * 1000) / 10,
    avg: s.avgSeconds === null ? null : Number(s.avgSeconds.toFixed(2)),
    median: s.medianSeconds === null ? null : Number(s.medianSeconds.toFixed(2)),
    correct: s.correct,
    incorrect: s.incorrect,
    notRated: s.notRated,
    errors: s.errors,
  }))
  const trend = latencyTrend(log)

  // Ranking: best accuracy first, then fastest average.
  const ranked = [...stats].sort(
    (a, b) =>
      (b.accuracy ?? -1) - (a.accuracy ?? -1) ||
      (a.avgSeconds ?? Infinity) - (b.avgSeconds ?? Infinity),
  )

  return (
    <>
      <section className="card">
        <div className="topbar">
          <h2>Dashboard</h2>
          <div className="row">
            <button type="button" onClick={onExport}>
              Export CSV
            </button>
            <button type="button" className="danger" onClick={onClear}>
              Clear history
            </button>
          </div>
        </div>

        <div className="kpis">
          <Kpi
            title="Best accuracy"
            value={best ? pct(best.accuracy) : '—'}
            detail={best ? `${best.label}, ${best.correct} of ${best.rated} rated correct` : 'Rate answers to see this'}
          />
          <Kpi
            title="Fastest avg. latency"
            value={fastest ? `${fmt(fastest.avgSeconds)} s` : '—'}
            detail={fastest ? fastest.label : 'No successful answers yet'}
          />
          <Kpi
            title="Total questions"
            value={totalQuestions}
            detail={`${log.length} answers from ${stats.length} models`}
          />
          <Kpi
            title="Overall accuracy"
            value={rated ? pct(correct / rated) : '—'}
            detail={`${rated} of ${log.length} answers rated`}
          />
          <Kpi
            title="Avg. latency, all models"
            value={overallAvg === null ? '—' : `${fmt(overallAvg)} s`}
            detail={errors ? `${errors} failed calls` : 'No failed calls'}
          />
        </div>
      </section>

      <section className="charts">
        <ChartCard title="Accuracy by model (%)">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis domain={[0, 100]} {...axisProps} />
            <Tooltip {...tooltipProps} cursor={barCursor} formatter={(v) => [v === null ? 'Not rated' : `${v}%`, 'Accuracy']} />
            <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
              {chartData.map((d) => (
                <Cell key={d.label} fill={colorOf[d.label]} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Response time by model (seconds)">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipProps} cursor={barCursor} formatter={(v, name) => [`${v} s`, name]} />
            <Legend />
            <Bar dataKey="avg" name="Average" fill="#646cff" radius={[6, 6, 0, 0]} />
            <Bar dataKey="median" name="Median" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Feedback per model">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip {...tooltipProps} cursor={barCursor} />
            <Legend />
            <Bar dataKey="correct" name="Correct" stackId="f" fill={FEEDBACK_COLORS.correct} />
            <Bar dataKey="incorrect" name="Incorrect" stackId="f" fill={FEEDBACK_COLORS.incorrect} />
            <Bar dataKey="notRated" name="Not rated" stackId="f" fill={FEEDBACK_COLORS.notRated} />
            <Bar dataKey="errors" name="Errors" stackId="e" fill={FEEDBACK_COLORS.errors} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Response time per question (seconds)">
          <LineChart data={trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="run" tickFormatter={(r) => `Q${r}`} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              {...tooltipProps}
              labelFormatter={(run, payload) => {
                const q = payload?.[0]?.payload?.question
                return q ? `Q${run}: ${shorten(q)}` : `Q${run}`
              }}
              formatter={(v, name) => [`${v} s`, name]}
            />
            <Legend />
            {stats.map((s) => (
              <Line
                key={s.label}
                type="monotone"
                dataKey={s.label}
                stroke={colorOf[s.label]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ChartCard>
      </section>

      <section className="card">
        <h2>Model comparison</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="num">Rank</th>
                <th>Label</th>
                <th>Model</th>
                <th className="num">Answers</th>
                <th className="num">Correct</th>
                <th className="num">Incorrect</th>
                <th className="num">Not rated</th>
                <th className="num">Accuracy</th>
                <th className="num">Avg (s)</th>
                <th className="num">Median (s)</th>
                <th className="num">Fastest (s)</th>
                <th className="num">Slowest (s)</th>
                <th className="num">Errors</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s, i) => (
                <tr key={s.label}>
                  <td className="num">{i + 1}</td>
                  <td>
                    <span className="swatch" style={{ background: colorOf[s.label] }} />
                    {s.label}
                  </td>
                  <td>
                    <code>{s.model}</code>
                  </td>
                  <td className="num">{s.runs}</td>
                  <td className="num">{s.correct}</td>
                  <td className="num">{s.incorrect}</td>
                  <td className="num">{s.notRated}</td>
                  <td className={`num ${best && s.label === best.label ? 'best' : ''}`}>{pct(s.accuracy)}</td>
                  <td className={`num ${fastest && s.label === fastest.label ? 'best' : ''}`}>{fmt(s.avgSeconds)}</td>
                  <td className="num">{fmt(s.medianSeconds)}</td>
                  <td className="num">{fmt(s.minSeconds)}</td>
                  <td className="num">{fmt(s.maxSeconds)}</td>
                  <td className="num">
                    {s.errors} ({pct(s.errorRate)})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">
          Ranked by accuracy, then average time. Accuracy counts rated answers only, so rate more
          answers for a fairer comparison.
        </p>

        <details>
          <summary>All logged runs ({log.length})</summary>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Label</th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Chunks</th>
                  <th className="num">Best distance</th>
                  <th className="num">Seconds</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {[...log].reverse().map((r) => (
                  <tr key={r.id}>
                    <td>{r.timestamp}</td>
                    <td>{r.label}</td>
                    <td className="clip" title={r.question}>
                      {r.question}
                    </td>
                    <td className="clip" title={r.error || r.answer}>
                      {r.error ? `Error: ${r.error}` : r.answer}
                    </td>
                    <td>{r.retrieved_chunk_ids}</td>
                    <td className="num">{fmt(r.best_distance, 4)}</td>
                    <td className="num">{fmt(r.total_seconds)}</td>
                    <td>{r.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </>
  )
}
