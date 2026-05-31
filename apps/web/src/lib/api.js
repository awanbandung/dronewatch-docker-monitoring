const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function token() {
  return localStorage.getItem('dw_token')
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  login: (identifier, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  me: () => request('/auth/me'),
  drones: () => request('/drones'),
  drone: (id) => request(`/drones/${id}`),
}
