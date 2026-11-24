/**
 * SchemeSaathi API Client
 * All calls go to the FastAPI backend. Keys are never stored on the frontend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ss_token');
}

function setToken(token: string, refreshToken: string) {
  localStorage.setItem('ss_token', token);
  localStorage.setItem('ss_refresh', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('ss_token');
  localStorage.removeItem('ss_refresh');
  localStorage.removeItem('ss_user');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      errorMsg = err.detail || err.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  if (res.headers.get('content-type')?.includes('application/pdf')) {
    return res.blob() as unknown as T;
  }

  return res.json();
}

// ============================================================
// Auth
// ============================================================
export const auth = {
  async signup(email: string, password: string, fullName: string) {
    return request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    }, true);
  },

  async login(email: string, password: string) {
    const data: any = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, true);
    setToken(data.access_token, data.refresh_token);
    localStorage.setItem('ss_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    clearTokens();
  },

  getUser() {
    if (typeof window === 'undefined') return null;
    const u = localStorage.getItem('ss_user');
    return u ? JSON.parse(u) : null;
  },

  isLoggedIn() {
    return !!getToken();
  },
};

// ============================================================
// Profile
// ============================================================
export const profile = {
  async get() { return request('/api/profiles/me'); },
  async update(data: Record<string, unknown>) {
    return request('/api/profiles/me', { method: 'PUT', body: JSON.stringify(data) });
  },
};

// ============================================================
// Family
// ============================================================
export const family = {
  async list() { return request('/api/family/'); },
  async add(member: Record<string, unknown>) {
    return request('/api/family/', { method: 'POST', body: JSON.stringify(member) });
  },
  async update(id: string, member: Record<string, unknown>) {
    return request(`/api/family/${id}`, { method: 'PUT', body: JSON.stringify(member) });
  },
  async remove(id: string) {
    return request(`/api/family/${id}`, { method: 'DELETE' });
  },
  async seedDemo() {
    return request('/api/family/seed-demo', { method: 'POST' });
  },
};

// ============================================================
// Schemes
// ============================================================
export const schemes = {
  async list(params?: { state?: string; search?: string }) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/api/schemes/${qs ? '?' + qs : ''}`);
  },
  async get(key: string) { return request(`/api/schemes/${key}`); },
  async matchForUser() { return request('/api/schemes/match', { method: 'POST' }); },
  async familyBenefitFinder() {
    return request('/api/schemes/family-benefit-finder', { method: 'POST' });
  },
};

// ============================================================
// Eligibility
// ============================================================
export const eligibility = {
  async check(data: Record<string, unknown>) {
    return request('/api/eligibility/check', { method: 'POST', body: JSON.stringify(data) });
  },
  async supportedSchemes() { return request('/api/eligibility/schemes/supported'); },
};

// ============================================================
// AI Agent
// ============================================================
export const agent = {
  async chat(data: Record<string, unknown>) {
    return request('/api/agent/chat', { method: 'POST', body: JSON.stringify(data) });
  },
  async getHistory(conversationId: string) {
    return request(`/api/agent/history/${conversationId}`);
  },
  async listConversations() { return request('/api/agent/conversations'); },
};

// ============================================================
// Scam Shield
// ============================================================
export const scam = {
  async analyze(formData: FormData) {
    return request('/api/scam/analyze', { method: 'POST', body: formData });
  },
  async getReports() { return request('/api/scam/reports'); },
};

// ============================================================
// PDF Simplifier
// ============================================================
export const simplifier = {
  async simplify(file: File, language = 'en') {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('language', language);
    return request('/api/simplifier/simplify', { method: 'POST', body: fd });
  },
  async qa(documentId: string, question: string, language = 'en') {
    return request(
      `/api/simplifier/qa?document_id=${documentId}&question=${encodeURIComponent(question)}&language=${language}`,
      { method: 'POST' }
    );
  },
};

// ============================================================
// Documents
// ============================================================
export const documents = {
  async analyze(files: File[], schemeKey?: string) {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    if (schemeKey) fd.append('scheme_key', schemeKey);
    return request('/api/documents/analyze', { method: 'POST', body: fd });
  },
  async list() { return request('/api/documents/my-documents'); },
  async remove(id: string) { return request(`/api/documents/${id}`, { method: 'DELETE' }); },
};

// ============================================================
// Journey
// ============================================================
export const journey = {
  async list() { return request('/api/journey/'); },
  async create(data: Record<string, unknown>) {
    return request('/api/journey/', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateStage(id: string, stage: string, notes?: string, confirmed = false) {
    return request(`/api/journey/${id}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage, notes, user_confirmed: confirmed }),
    });
  },
  async getHistory(id: string) { return request(`/api/journey/${id}/history`); },
  async remove(id: string) { return request(`/api/journey/${id}`, { method: 'DELETE' }); },
  async stages() { return request('/api/journey/stages/list'); },
};

// ============================================================
// Conflicts
// ============================================================
export const conflicts = {
  async list(schemeKey?: string) {
    return request(`/api/conflicts/${schemeKey ? '?scheme_key=' + schemeKey : ''}`);
  },
  async report(data: Record<string, unknown>) {
    return request('/api/conflicts/report', { method: 'POST', body: JSON.stringify(data) });
  },
};

// ============================================================
// Monitor
// ============================================================
export const monitor = {
  async getChanges(schemeKey?: string) {
    return request(`/api/monitor/${schemeKey ? '?scheme_key=' + schemeKey : ''}`);
  },
};

// ============================================================
// Reports
// ============================================================
export const reports = {
  async generate() { return request('/api/reports/generate', { method: 'POST' }); },
  async list() { return request('/api/reports/my-reports'); },
};

// ============================================================
// Admin
// ============================================================
export const admin = {
  async stats() { return request('/api/admin/stats'); },
  async users() { return request('/api/admin/users'); },
  async createScheme(data: Record<string, unknown>) {
    return request('/api/admin/schemes', { method: 'POST', body: JSON.stringify(data) });
  },
  async resolveConflict(id: string, resolution: string) {
    return request(`/api/admin/conflicts/${id}/resolve`, {
      method: 'POST', body: JSON.stringify({ conflict_id: id, resolution }),
    });
  },
  async logs() { return request('/api/admin/logs'); },
};
