// src/services/api.js
//
// Mirrors the pattern your POS app's services/api.js already uses:
// auto-attach a fresh Firebase ID token, auto-retry once on 401 with a
// force-refreshed token. Kept as a thin class so call sites read like
// `api.get('/admin/businesses')` rather than juggling fetch() everywhere.

import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getToken(forceRefresh = false) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken(forceRefresh);
  }

  async request(method, endpoint, body = null, { retryCount = 0 } = {}) {
    const token = await this.getToken(false);

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    if (res.status === 401 && retryCount < 1) {
      // Force-refresh the token once and retry — handles the case where
      // the token expired mid-session.
      await this.getToken(true);
      return this.request(method, endpoint, body, { retryCount: retryCount + 1 });
    }

    if (res.status === 403) {
      throw new Error(
        typeof data === 'object' && data?.error
          ? data.error
          : 'You do not have admin access for this action.'
      );
    }

    if (!res.ok) {
      const message = (typeof data === 'object' && (data?.error || data?.message)) || `Request failed (${res.status})`;
      throw new Error(message);
    }

    return data;
  }

  get(endpoint) { return this.request('GET', endpoint); }
  post(endpoint, body) { return this.request('POST', endpoint, body); }
  put(endpoint, body) { return this.request('PUT', endpoint, body); }
  delete(endpoint) { return this.request('DELETE', endpoint); }
}

export const api = new ApiService();
export default api;
