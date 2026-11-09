async function requestJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload.error || payload.message || `Error HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function fetchCurrentUser() {
  try {
    const result = await requestJson('/api/auth/me');
    return result.usuario;
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export function login(credentials) {
  return requestJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
}

export function logout() {
  return requestJson('/api/auth/logout', { method: 'POST' });
}

export async function fetchMaterials() {
  const result = await requestJson('/api/materiales');
  return result.data;
}

export async function fetchAlerts() {
  const result = await requestJson('/api/alertas/reorden');
  return result.datos;
}

export async function fetchPossibleDuplicates() {
  const result = await requestJson('/api/ordenes/posibles-duplicados');
  return result.data;
}

export function createMovement(payload) {
  return requestJson('/api/movimientos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
