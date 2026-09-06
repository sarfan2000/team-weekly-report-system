// REST API Client for Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper to make authenticated API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      if (typeof data.errors[0] === 'string') {
        throw new Error(data.errors[0]);
      } else if (data.errors[0].message) {
        throw new Error(data.errors.map((e: any) => e.message).join(', '));
      }
    }
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// API methods
export const api = {
  // ==================== AUTH ====================
  async register(name: string, email: string, password?: string, role?: string, phoneNumber?: string) {
    return apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: password || undefined, role, phoneNumber }),
    });
  },

  async login(email: string, password: string) {
    const response = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Save token to localStorage
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }

    return response;
  },

  async getMe() {
    return apiRequest<any>('/auth/me');
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  // ==================== REPORTS ====================
  async getMyReports(params?: { page?: number; limit?: number; status?: string; weekStartDate?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<any>(`/reports/my-history${query ? `?${query}` : ''}`);
  },

  async getReport(id: string) {
    return apiRequest<any>(`/reports/${id}`);
  },

  async createReport(data: { projectId: string; weekStartDate: string; weekEndDate: string }) {
    return apiRequest<any>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateReport(id: string, data: any) {
    return apiRequest<any>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async submitReport(id: string) {
    return apiRequest<any>(`/reports/${id}/submit`, {
      method: 'POST',
    });
  },

  async deleteReport(id: string) {
    return apiRequest<any>(`/reports/${id}`, {
      method: 'DELETE',
    });
  },

  async getReportVersions(id: string) {
    return apiRequest<any>(`/reports/${id}/versions`);
  },

  async getReportVersion(id: string, versionNum: number) {
    return apiRequest<any>(`/reports/${id}/versions/${versionNum}`);
  },

  // ==================== MANAGER ====================
  async getTeamReports(params?: any) {
    const query = new URLSearchParams(params).toString();
    return apiRequest<any>(`/manager/reports${query ? `?${query}` : ''}`);
  },

  async reviewReport(id: string, action: string, comment: string) {
    return apiRequest<any>(`/manager/reports/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, comment }),
    });
  },

  async getAnalyticsSummary() {
    return apiRequest<any>('/manager/analytics/summary');
  },

  async getAnalyticsCharts() {
    return apiRequest<any>('/manager/analytics/charts');
  },

  // ==================== PROJECTS ====================
  async getProjects() {
    return apiRequest<any>('/projects');
  },

  async getProject(id: string) {
    return apiRequest<any>(`/projects/${id}`);
  },

  async createProject(data: { name: string; description?: string; status?: string; color?: string }) {
    return apiRequest<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: string, data: { name?: string; description?: string; status?: string; color?: string }) {
    return apiRequest<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProject(id: string) {
    return apiRequest<any>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // ==================== USERS ====================
  async getUsers() {
    return apiRequest<any>('/users');
  },

  async updateUser(id: string, updates: any) {
    return apiRequest<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteUser(id: string) {
    return apiRequest<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // ==================== AI ASSISTANT ====================
  async chatWithAI(query: string) {
    return apiRequest<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },
};
