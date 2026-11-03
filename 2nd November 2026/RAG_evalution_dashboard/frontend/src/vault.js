// Encrypted vault for model settings + API keys, kept in localStorage.
// AES-256-GCM, key derived from your passphrase with PBKDF2-SHA256.
// The passphrase is never stored; the derived key lives only in memory
// until you lock the app or close the tab.

const VAULT_KEY = 'rag-ui:vault'
const ITERATIONS = 600_000
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function toB64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function fromB64(text) {
  return Uint8Array.from(atob(text), (c) => c.charCodeAt(0))
}

async function deriveKey(passphrase, salt) {
  const base = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable: JS can use it but cannot read it
    ['encrypt', 'decrypt'],
  )
}

export function vaultExists() {
  return localStorage.getItem(VAULT_KEY) !== null
}

export async function saveVault(session, data) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    session.key,
    encoder.encode(JSON.stringify(data)),
  )
  localStorage.setItem(
    VAULT_KEY,
    JSON.stringify({ v: 1, salt: toB64(session.salt), iv: toB64(iv), data: toB64(cipher) }),
  )
}

export async function createVault(passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const session = { key: await deriveKey(passphrase, salt), salt }
  await saveVault(session, { models: [] })
  return session
}

export async function unlockVault(passphrase) {
  const stored = JSON.parse(localStorage.getItem(VAULT_KEY))
  const salt = fromB64(stored.salt)
  const key = await deriveKey(passphrase, salt)
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromB64(stored.iv) },
      key,
      fromB64(stored.data),
    )
    return { session: { key, salt }, data: JSON.parse(decoder.decode(plain)) }
  } catch {
    throw new Error('Wrong passphrase.')
  }
}

export function resetVault() {
  localStorage.removeItem(VAULT_KEY)
}
