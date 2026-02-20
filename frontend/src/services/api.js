// Minimal fetch-based API client for Expo
let AUTH_TOKEN = null;

export function setAuthToken(token) {
  AUTH_TOKEN = token || null;
}

function baseUrl() {
  // Segurança: exija EXPO_PUBLIC_API_URL no ambiente.
  const raw = process.env.EXPO_PUBLIC_API_URL;
  if (!raw) {
    throw new Error('EXPO_PUBLIC_API_URL não definida. Configure a URL da API nas variáveis do Expo.');
  }
  const trimmed = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  return `${trimmed}/api`;
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const url = `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const finalHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  };
  if (AUTH_TOKEN) {
    finalHeaders.Authorization = `Bearer ${AUTH_TOKEN}`;
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = { ok: false, message: 'Invalid JSON response', raw: text };
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const AuthAPI = {
  register: (payload) => api('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => api('/auth/login', { method: 'POST', body: payload }),
  me: () => api('/auth/me'),
  logout: () => api('/auth/logout', { method: 'POST' }),
  updateAddress: (payload) => api('/auth/update-address', { method: 'PUT', body: payload }),
};

export const MaterialsAPI = {
  list: () => api('/materials'),
};

export const SchedulesAPI = {
  list: (status) => api(`/schedules${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  mySchedules: () => api('/schedules/me'),
  myCollections: () => api('/schedules/my-collections'),
  create: (payload) => api('/schedules', { method: 'POST', body: payload }),
  accept: (id) => api(`/schedules/${id}/accept`, { method: 'POST' }),
  updateStatus: (id, status) => api(`/schedules/${id}/status`, { method: 'POST', body: { status } }),
  onRoute: (id) => api(`/schedules/${id}/on-route`, { method: 'PUT' }),
  arrived: (id) => api(`/schedules/${id}/arrived`, { method: 'PUT' }),
  confirmCollection: (id) => api(`/schedules/${id}/confirm-collection`, { method: 'PUT' }),
  sendLocation: (id, payload) => api(`/schedules/${id}/location`, { method: 'POST', body: payload }),
  track: (id) => api(`/schedules/${id}/track`),
  collected: (id) => api(`/schedules/${id}/status`, { method: 'POST', body: { status: 'collected' } }),
  cancel: (id) => api(`/schedules/${id}/status`, { method: 'POST', body: { status: 'canceled' } }),
};
