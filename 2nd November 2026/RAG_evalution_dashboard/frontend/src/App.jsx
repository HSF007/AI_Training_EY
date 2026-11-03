import { useState } from 'react'
import './App.css'
import Dashboard from './Dashboard'
import { vaultExists, createVault, unlockVault, saveVault, resetVault } from './vault'
import { loadLog, saveLog, downloadCsv, localTimestamp } from './log'

const EMPTY_FORM = { label: '', model: '', baseUrl: '', apiKey: '' }

const maskKey = (key) => (key ? `••••${key.slice(-4)}` : '—')
const fmt = (n, digits = 2) => (n === null || n === undefined ? '—' : Number(n).toFixed(digits))

function App() {
  // vault / lock state
  const [hasVault, setHasVault] = useState(vaultExists)
  const [session, setSession] = useState(null)
  const [passphrase, setPassphrase] = useState('')
  const [lockError, setLockError] = useState('')
  const [busy, setBusy] = useState(false)

  // navigation
  const [tab, setTab] = useState('compare')

  // models
  const [models, setModels] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')

  // questions + results
  const [question, setQuestion] = useState('')
  const [topK, setTopK] = useState(3)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')
  const [lastRun, setLastRun] = useState(null)
  const [log, setLog] = useState(loadLog)

  /* ---------- vault ---------- */

  async function handleUnlock(e) {
    e.preventDefault()
    setLockError('')
    if (!hasVault && passphrase.length < 8) {
      setLockError('Use at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      if (hasVault) {
        const { session, data } = await unlockVault(passphrase)
        setSession(session)
        setModels(data.models ?? [])
      } else {
        setSession(await createVault(passphrase))
        setHasVault(true)
        setModels([])
      }
      setPassphrase('')
    } catch (err) {
      setLockError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function lock() {
    setSession(null)
    setModels([])
    setForm(EMPTY_FORM)
    setEditingId(null)
    setLastRun(null)
  }

  function handleReset() {
    if (!confirm('Delete all saved models and API keys? Run history is kept.')) return
    resetVault()
    setHasVault(false)
    setLockError('')
    lock()
  }

  /* ---------- models ---------- */

  async function persist(next) {
    setModels(next)
    await saveVault(session, { models: next })
  }

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))

  async function handleSaveModel(e) {
    e.preventDefault()
    setFormError('')
    const model = form.model.trim()
    const label = form.label.trim() || model
    const baseUrl = form.baseUrl.trim()
    let apiKey = form.apiKey.trim()

    if (!model) return setFormError('Enter a model name, for example gpt-4o-mini.')
    if (baseUrl && !/^https?:\/\//i.test(baseUrl))
      return setFormError('Base URL must start with http:// or https://')
    if (models.some((m) => m.label === label && m.id !== editingId))
      return setFormError('Another model already uses this label. Pick a different label.')

    const existing = models.find((m) => m.id === editingId)
    if (!apiKey) apiKey = existing?.apiKey ?? models.find((m) => m.baseUrl === baseUrl)?.apiKey ?? ''
    if (!apiKey) return setFormError('Enter an API key for this base URL.')

    const entry = {
      id: editingId ?? crypto.randomUUID(),
      label,
      model,
      baseUrl,
      apiKey,
      enabled: existing?.enabled ?? true,
    }
    await persist(editingId ? models.map((m) => (m.id === editingId ? entry : m)) : [...models, entry])
    setForm({ ...EMPTY_FORM, baseUrl }) // keep base URL to add more models quickly
    setEditingId(null)
  }

  function startEdit(m) {
    setEditingId(m.id)
    setForm({ label: m.label, model: m.model, baseUrl: m.baseUrl, apiKey: '' })
    setFormError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  async function deleteModel(id) {
    if (!confirm('Delete this model and its saved key?')) return
    if (editingId === id) cancelEdit()
    await persist(models.filter((m) => m.id !== id))
  }

  async function toggleModel(id) {
    await persist(models.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)))
  }

  /* ---------- asking + logging ---------- */

  function updateLog(next) {
    setLog(next)
    saveLog(next)
  }

  async function handleAsk(e) {
    e.preventDefault()
    const q = question.trim()
    const enabled = models.filter((m) => m.enabled)
    if (!q || enabled.length === 0) return

    setRunning(true)
    setRunError('')
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          top_k: topK,
          models: enabled.map((m) => ({
            id: m.id,
            label: m.label,
            model: m.model,
            base_url: m.baseUrl || null,
            api_key: m.apiKey,
          })),
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body) {
        const detail = body?.detail
        throw new Error(
          typeof detail === 'string'
            ? detail
            : detail
              ? JSON.stringify(detail)
              : `Backend returned ${res.status}. Check that uvicorn is running on port 8000.`,
        )
      }

      const timestamp = localTimestamp()
      const runId = crypto.randomUUID() // groups all model answers for one question
      const rows = body.results.map((r) => ({
        id: crypto.randomUUID(),
        runId,
        timestamp,
        label: r.label,
        model: r.model,
        question: q,
        answer: r.answer,
        retrieved_chunk_ids: body.retrieved_chunk_ids.join(', '),
        best_distance: body.best_distance,
        total_seconds: r.total_seconds,
        feedback: 'Not rated',
        error: r.error ?? '',
      }))
      updateLog([...log, ...rows])
      setLastRun({ ...body, question: q, rowIds: rows.map((r) => r.id) })
    } catch (err) {
      setRunError(err.message)
    } finally {
      setRunning(false)
    }
  }

  function setFeedback(id, value) {
    updateLog(
      log.map((r) => (r.id === id ? { ...r, feedback: r.feedback === value ? 'Not rated' : value } : r)),
    )
  }

  function clearLog() {
    if (!confirm('Delete all logged runs from this browser?')) return
    updateLog([])
    setLastRun(null)
  }

  /* ---------- locked screen ---------- */

  if (!session) {
    return (
      <main className="app">
        <h1>RAG model compare</h1>
        <section className="card narrow">
          <h2>{hasVault ? 'Unlock saved models' : 'Create a passphrase'}</h2>
          <p className="muted">
            {hasVault
              ? 'Your models and API keys are encrypted in this browser. Enter your passphrase to use them.'
              : 'API keys are encrypted (AES-256-GCM) before they are saved in this browser. The passphrase itself is never saved.'}
          </p>
          <form className="row" onSubmit={handleUnlock}>
            <input
              className="grow"
              type="password"
              autoFocus
              autoComplete={hasVault ? 'current-password' : 'new-password'}
              placeholder="Passphrase (at least 8 characters)"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
            <button type="submit" disabled={busy || !passphrase}>
              {busy ? 'Working…' : hasVault ? 'Unlock' : 'Create vault'}
            </button>
          </form>
          {lockError && <p className="error">{lockError}</p>}
          {hasVault && (
            <button type="button" className="link" onClick={handleReset}>
              Forgot it? Reset saved models
            </button>
          )}
        </section>
      </main>
    )
  }

  /* ---------- main screen ---------- */

  const enabledCount = models.filter((m) => m.enabled).length
  const lastRows = lastRun ? lastRun.rowIds.map((id) => log.find((r) => r.id === id)).filter(Boolean) : []

  return (
    <main className="app">
      <header className="topbar">
        <h1>RAG model compare</h1>
        <button type="button" onClick={lock}>
          Lock
        </button>
      </header>

      <nav className="tabs" aria-label="Sections">
        <button
          type="button"
          className={tab === 'compare' ? 'tab active' : 'tab'}
          aria-current={tab === 'compare' ? 'page' : undefined}
          onClick={() => setTab('compare')}
        >
          Compare
        </button>
        <button
          type="button"
          className={tab === 'dashboard' ? 'tab active' : 'tab'}
          aria-current={tab === 'dashboard' ? 'page' : undefined}
          onClick={() => setTab('dashboard')}
        >
          Dashboard
        </button>
      </nav>

      {tab === 'dashboard' ? (
        <Dashboard log={log} onExport={() => downloadCsv(log)} onClear={clearLog} />
      ) : (
        <>
          <section className="card">
            <h2>Models</h2>
            <form className="model-form" onSubmit={handleSaveModel}>
              <label>
                Label
                <input value={form.label} onChange={setField('label')} placeholder="Groq Qwen" />
              </label>
              <label>
                Model name
                <input value={form.model} onChange={setField('model')} placeholder="qwen/qwen3-32b" />
              </label>
              <label>
                Base URL
                <input value={form.baseUrl} onChange={setField('baseUrl')} placeholder="Blank = OpenAI" />
              </label>
              <label>
                API key
                <input
                  type="password"
                  autoComplete="off"
                  value={form.apiKey}
                  onChange={setField('apiKey')}
                  placeholder={editingId ? 'Blank = keep current key' : 'Blank = reuse key of same base URL'}
                />
              </label>
              <div className="row">
                <button type="submit">{editingId ? 'Save changes' : 'Add model'}</button>
                {editingId && (
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {formError && <p className="error">{formError}</p>}

            {models.length === 0 ? (
              <p className="muted">Add your first model above to start comparing.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Use</th>
                      <th>Label</th>
                      <th>Model</th>
                      <th>Base URL</th>
                      <th>Key</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={m.enabled}
                            onChange={() => toggleModel(m.id)}
                            aria-label={`Use ${m.label}`}
                          />
                        </td>
                        <td>{m.label}</td>
                        <td>
                          <code>{m.model}</code>
                        </td>
                        <td className="muted">{m.baseUrl || 'OpenAI default'}</td>
                        <td>{maskKey(m.apiKey)}</td>
                        <td className="actions">
                          <button type="button" onClick={() => startEdit(m)}>
                            Edit
                          </button>
                          <button type="button" className="danger" onClick={() => deleteModel(m.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card">
            <h2>Ask all selected models ({enabledCount})</h2>
            <form className="row" onSubmit={handleAsk}>
              <input
                className="grow"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="How many vacation days do new employees get?"
              />
              <label className="inline">
                Chunks
                <input
                  className="small"
                  type="number"
                  min="1"
                  max="10"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value) || 3)}
                />
              </label>
              <button type="submit" disabled={running || !question.trim() || enabledCount === 0}>
                {running ? 'Comparing…' : 'Compare'}
              </button>
            </form>
            {enabledCount === 0 && models.length > 0 && (
              <p className="muted">Tick at least one model in the table above.</p>
            )}
            {runError && <p className="error">{runError}</p>}
          </section>

          {lastRun && (
            <section className="card">
              <h2>Latest answers</h2>
              <p>
                <strong>{lastRun.question}</strong>
              </p>
              <p className="muted">
                Retrieved in {fmt(lastRun.retrieval_seconds)} s:{' '}
                {lastRun.chunks.length
                  ? lastRun.chunks.map((c) => `${c.id} (distance ${fmt(c.distance, 4)})`).join(', ')
                  : 'no chunks'}
              </p>
              <div className="grid">
                {lastRows.map((r) => (
                  <article key={r.id} className="result">
                    <header>
                      <strong>{r.label}</strong>
                      <span className="muted">{fmt(r.total_seconds)} s</span>
                    </header>
                    {r.error ? <p className="error">{r.error}</p> : <p className="answer">{r.answer}</p>}
                    <div className="row">
                      <span className="muted">Was this correct?</span>
                      <button
                        type="button"
                        className={r.feedback === 'Correct' ? 'good active' : 'good'}
                        onClick={() => setFeedback(r.id, 'Correct')}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={r.feedback === 'Incorrect' ? 'bad active' : 'bad'}
                        onClick={() => setFeedback(r.id, 'Incorrect')}
                      >
                        No
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <p className="muted">
                Your ratings feed the accuracy numbers on the{' '}
                <button type="button" className="link inline-link" onClick={() => setTab('dashboard')}>
                  Dashboard
                </button>
                .
              </p>
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default App
