// API client for your backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

// In src/lib/api.js - FIXED VERSION
class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token) {
    console.log("✅ Setting token in localStorage");
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  // REMOVE or FIX clearToken method
  clearToken() {
    console.log("⚠️ Manual logout called");
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // DON'T automatically clear token on 401
      // Let the component handle it
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ========== AUTH ENDPOINTS ==========

  // Get current user
  getCurrentUser() {
    return this.request("/api/auth/me");
  }

  // Check GitHub connection status
  getGitHubStatus() {
    return this.request("/api/auth/github/status");
  }

  // Connect GitHub account
  connectGitHub() {
    // This will redirect to GitHub OAuth
    window.location.href = `${this.baseUrl}/api/auth/github/connect`;
  }

  // Disconnect GitHub
  disconnectGitHub() {
    return this.request("/api/auth/github/disconnect", {
      method: "POST",
    });
  }

  // Logout
  logout() {
    return this.request("/api/auth/logout", {
      method: "POST",
    }).finally(() => {
      this.clearToken();
    });
  }

  // ========== REPOSITORY ENDPOINTS ==========

  // Get user repositories
  getRepositories() {
    return this.request("/api/repositories");
  }

  // Sync single repository
  syncRepository(owner, repo) {
    return this.request(`/api/repositories/${owner}/${repo}/sync`, {
      method: "POST",
    });
  }

  // Update repository settings
  updateRepository(repoId, data) {
    return this.request(`/api/repositories/${repoId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // ========== ANALYSIS ENDPOINTS ==========

  // Analyze repository (to be implemented)
  analyzeRepository(repositoryId) {
    return this.request("/api/analysis/analyze", {
      method: "POST",
      body: JSON.stringify({ repositoryId }),
    });
  }

  // Get repository issues
  getRepositoryIssues(repositoryId) {
    return this.request(`/api/analysis/repositories/${repositoryId}/issues`);
  }

  // Generate fix for issue
  generateFix(issueId) {
    return this.request("/api/analysis/generate-fix", {
      method: "POST",
      body: JSON.stringify({ issueId }),
    });
  }

  // Create pull request
  createPullRequest(data) {
    return this.request("/api/analysis/create-pr", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
