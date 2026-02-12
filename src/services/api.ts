import { User, UserCreate, UserLogin, TokenResponse, SubscriptionPackage } from '../types/user';

// Use relative URL for proxy (Vite will proxy /api requests to backend)
const API_BASE_URL = '';
// For production: const API_BASE_URL = 'https://powerlitfastapi-production.up.railway.app';
// For local backend direct: const API_BASE_URL = 'http://0.0.0.0:8000';

// API Error types
export interface ApiError extends Error {
  statusCode: number;
  userFriendlyMessage: string;
  isRetryable: boolean;
  type: 'network' | 'timeout' | 'file' | 'server' | 'validation' | 'unauthorized' | 'generic';
}

// Helper to create API errors
function createApiError(
  message: string,
  statusCode: number = 0,
  type: ApiError['type'] = 'generic',
  isRetryable: boolean = false
): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.type = type;
  error.isRetryable = isRetryable;
  
  // User-friendly messages
  switch (type) {
    case 'network':
      error.userFriendlyMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      break;
    case 'timeout':
      error.userFriendlyMessage = 'The request took too long. Please try again later.';
      break;
    case 'file':
      error.userFriendlyMessage = message;
      break;
    case 'server':
      error.userFriendlyMessage = 'Our servers are experiencing high demand. Please try again in a few moments.';
      break;
    case 'validation':
      error.userFriendlyMessage = message;
      break;
    case 'unauthorized':
      error.userFriendlyMessage = 'Your session has expired. Please log in again.';
      break;
    default:
      error.userFriendlyMessage = message || 'An unexpected error occurred. Please try again.';
  }
  
  return error;
}

// Generic fetch with auth and error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Extract error message from various formats
      let errorMessage = 'Request failed';
      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        // Pydantic validation error format
        const firstError = errorData.detail[0];
        if (typeof firstError === 'object' && firstError.msg) {
          errorMessage = firstError.msg;
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      if (response.status === 401) {
        throw createApiError(errorMessage, response.status, 'unauthorized', false);
      }
      if (response.status === 422) {
        throw createApiError(errorMessage, response.status, 'validation', false);
      }
      if (response.status >= 500) {
        throw createApiError(errorMessage, response.status, 'server', true);
      }
      
      throw createApiError(errorMessage, response.status, 'generic', response.status < 500);
    }
    
    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  } catch (error: any) {
    if (error.type) {
      throw error; // Already an ApiError
    }
    
    // Network errors
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
      throw createApiError('Network error', 0, 'network', true);
    }
    
    throw createApiError(error.message || 'Request failed', 0, 'generic', true);
  }
}

// AUTH API
export const authApi = {
  // Register new user
  async register(userData: UserCreate): Promise<User> {
    const response = await apiFetch<TokenResponse & { user: User }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store tokens
    localStorage.setItem('powerlit_access_token', response.access_token);
    localStorage.setItem('powerlit_refresh_token', response.refresh_token);
    
    return response.user;
  },
  
  // Login user
  async login(credentials: UserLogin): Promise<User> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw createApiError('Incorrect email or password', response.status, 'unauthorized', false);
      }
      throw createApiError(errorData.detail || 'Login failed', response.status, 'generic', false);
    }
    
    const data: TokenResponse = await response.json();
    
    // Store tokens
    localStorage.setItem('powerlit_access_token', data.access_token);
    localStorage.setItem('powerlit_refresh_token', data.refresh_token);
    
    // Get user profile
    return await this.getProfile(data.access_token);
  },
  
  // Get user profile
  async getProfile(token?: string): Promise<User> {
    const accessToken = token || localStorage.getItem('powerlit_access_token');
    if (!accessToken) {
      throw createApiError('No access token', 401, 'unauthorized', false);
    }
    
    return await apiFetch<User>('/api/v1/auth/me', {}, accessToken);
  },
  
  // Refresh token
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = localStorage.getItem('powerlit_refresh_token');
    if (!refreshToken) {
      throw createApiError('No refresh token', 401, 'unauthorized', false);
    }
    
    const response = await apiFetch<TokenResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    // Store new tokens
    localStorage.setItem('powerlit_access_token', response.access_token);
    localStorage.setItem('powerlit_refresh_token', response.refresh_token);
    
    return response;
  },
  
  // Logout user
  async logout(): Promise<void> {
    const token = localStorage.getItem('powerlit_access_token');
    
    try {
      if (token) {
        await apiFetch('/api/v1/auth/logout', {
          method: 'POST',
        }, token);
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear tokens
      localStorage.removeItem('powerlit_access_token');
      localStorage.removeItem('powerlit_refresh_token');
    }
  },
  
  // Get stored access token
  getAccessToken(): string | null {
    return localStorage.getItem('powerlit_access_token');
  },
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('powerlit_access_token');
  },
};

// ANALYSIS API
export const analysisApi = {
  // Analyze single blueprint
  async analyze(
    blueprintFile: File,
    legendFile: File | null,
    buildingType: 'residential' | 'commercial' | 'industrial',
    _projectName: string = '',
    onProgress?: (step: string, progress: number) => void
  ): Promise<BackendAnalysisResponse> {
    const token = authApi.getAccessToken();
    
    onProgress?.('Preparing files...', 10);
    
    const formData = new FormData();
    formData.append('building_type', buildingType);
    
    // Backend expects 'files' as the field name (list of files)
    formData.append('files', blueprintFile);
    
    // Legend file is not supported by current backend, but we keep the param for API compatibility
    // If provided, we'll send it as an additional file
    if (legendFile) {
      formData.append('files', legendFile);
    }
    
    onProgress?.('Uploading to backend...', 30);
    
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      onProgress?.('Analyzing blueprint...', 50);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/analysis/analyze`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Extract error message from various formats
        let errorMessage = 'Analysis failed';
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          // Pydantic validation error format
          const firstError = errorData.detail[0];
          if (typeof firstError === 'object' && firstError.msg) {
            errorMessage = firstError.msg;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        if (response.status === 413) {
          throw createApiError('File size too large. Maximum file size is 50MB.', response.status, 'file', false);
        }
        if (response.status === 422) {
          throw createApiError(errorMessage, response.status, 'file', false);
        }
        if (response.status === 429) {
          throw createApiError('Analysis limit reached. Please upgrade your subscription.', response.status, 'validation', false);
        }
        if (response.status >= 500) {
          throw createApiError('Server error during analysis', response.status, 'server', true);
        }
        
        throw createApiError(errorMessage, response.status, 'generic', true);
      }
      
      onProgress?.('Processing results...', 80);
      
      const data: BackendAnalysisResponse = await response.json();
      
      onProgress?.('Analysis complete!', 100);
      
      return data;
    } catch (error: any) {
      if (error.type) {
        throw error;
      }
      
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        throw createApiError('Unable to connect to the server. Please check your internet connection.', 0, 'network', true);
      }
      
      throw createApiError(error.message || 'Analysis failed', 0, 'generic', true);
    }
  },
  
  // Analyze batch of files
  async analyzeBatch(
    files: File[],
    buildingType: 'residential' | 'commercial' | 'industrial',
    _projectName: string = '',
    onProgress?: (step: string, progress: number) => void
  ): Promise<BackendBatchResponse> {
    const token = authApi.getAccessToken();
    
    onProgress?.('Preparing files for batch analysis...', 10);
    
    const formData = new FormData();
    formData.append('building_type', buildingType);
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    onProgress?.('Uploading files...', 30);
    
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      onProgress?.('Analyzing blueprints in batch...', 50);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/analysis/analyze-batch`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Extract error message from various formats
        let errorMessage = 'Batch analysis failed';
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          // Pydantic validation error format
          const firstError = errorData.detail[0];
          if (typeof firstError === 'object' && firstError.msg) {
            errorMessage = firstError.msg;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        if (response.status === 413) {
          throw createApiError('Total file size too large. Maximum total size is 50MB.', response.status, 'file', false);
        }
        if (response.status === 429) {
          throw createApiError('Analysis limit reached. Please upgrade your subscription.', response.status, 'validation', false);
        }
        if (response.status >= 500) {
          throw createApiError('Server error during batch analysis', response.status, 'server', true);
        }
        
        throw createApiError(errorMessage, response.status, 'generic', true);
      }
      
      onProgress?.('Processing batch results...', 80);
      
      const data: BackendBatchResponse = await response.json();
      
      onProgress?.('Batch analysis complete!', 100);
      
      return data;
    } catch (error: any) {
      if (error.type) {
        throw error;
      }
      
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        throw createApiError('Unable to connect to the server.', 0, 'network', true);
      }
      
      throw createApiError(error.message || 'Batch analysis failed', 0, 'generic', true);
    }
  },
  
  // Get diversity factors
  async getDiversityFactors(): Promise<Record<string, number>> {
    return await apiFetch<Record<string, number>>('/api/v1/analysis/diversity-factors');
  },
  
  // Get analysis history
  async getAnalysisHistory(): Promise<BackendAnalysisResponse[]> {
    const token = authApi.getAccessToken();
    if (!token) {
      throw createApiError('Authentication required', 401, 'unauthorized', false);
    }
    
    return await apiFetch<BackendAnalysisResponse[]>('/api/v1/analysis/history', {}, token);
  },
};

// PAYMENTS API
export const paymentsApi = {
  // Get subscription packages
  async getPackages(): Promise<SubscriptionPackage[]> {
    return await apiFetch<SubscriptionPackage[]>('/api/v1/payments/packages');
  },
  
  // Initialize subscription payment
  async initializePayment(tier: string, email: string): Promise<{ authorization_url: string; reference: string; access_code: string }> {
    const token = authApi.getAccessToken();
    
    return await apiFetch('/api/v1/payments/subscribe', {
      method: 'POST',
      body: JSON.stringify({ tier, email }),
    }, token || undefined);
  },
  
  // Verify payment
  async verifyPayment(reference: string): Promise<{ status: string; subscription_tier: string }> {
    const token = authApi.getAccessToken();
    
    return await apiFetch(`/api/v1/payments/verify/${reference}`, {}, token || undefined);
  },
};

// HEALTH CHECK
export const healthApi = {
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};

// Backend response types
export interface BackendComponent {
  name: string;
  quantity: number;
  rating_watts: number;
  total_watts: number;
}

export interface BackendLoadCalculation {
  total_connected_load: number;
  diversity_factor: number;
  maximum_demand: number;
  building_type: 'residential' | 'commercial' | 'industrial';
}

export interface BackendComplianceAudit {
  standard_clause: string;
  description: string;
  compliance_status: 'compliant' | 'non_compliant' | 'review_required';
}

export interface BackendRecommendation {
  source: 'grid' | 'solar' | 'generator' | 'hybrid';
  percentage: number;
  capacity_kw: number;
  reasoning: string;
}

export interface BackendAnalysisResponse {
  id?: string;
  inventory: BackendComponent[];
  calculations: BackendLoadCalculation;
  compliance_audit: BackendComplianceAudit[];
  recommendations: BackendRecommendation[];
  processing_time_ms: number;
  created_at?: string;
  file_name?: string;
}

export interface BackendBatchResponse {
  status: string;
  files_processed: number;
  legends_detected: number;
  blueprint_results: Array<{
    filename: string;
    components_found: number;
    total_watts: number;
  }>;
  analysis: BackendAnalysisResponse;
}

// Export all APIs
export const api = {
  auth: authApi,
  analysis: analysisApi,
  payments: paymentsApi,
  health: healthApi,
};

export default api;
