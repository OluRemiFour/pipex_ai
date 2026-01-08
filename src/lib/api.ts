const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://pipex-ai-backend.onrender.com";

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = this.getTokenFromStorage();
  }

  // Get token from localStorage
  getTokenFromStorage() {
    // Check localStorage first
    const token = localStorage.getItem("auth_token");

    // Also check URL params (for OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    if (urlToken) {
      this.setToken(urlToken);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return urlToken;
    }

    return token;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  // Remove token (logout)
  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  // Generic request method - FIXED TOKEN SENDING
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Default headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add Authorization header if we have a token
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
      // console.log("🔑 Adding Authorization header with token");
    } else {
      console.warn("⚠️ No token available for request to:", endpoint);
    }

    const config = {
      ...options,
      headers,
    };

    // Add body if present
    if (options.body && typeof options.body !== "string") {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle unauthorized (token expired)
      if (response.status === 401) {
        console.error("❌ 401 Unauthorized - Token may be expired");
        this.clearToken();

        // Don't redirect if we're already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?error=session_expired";
        }

        throw new Error("Session expired. Please login again.");
      }

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ API Error Response:", {
          status: response.status,
          endpoint,
          error: data.error,
        });
        throw new Error(data.error || `API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ API request failed: ${endpoint}`, error);
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

  // Connect GitHub account - UPDATED
  connectGitHub() {
    if (!this.token) {
      console.error("No token available for GitHub connect");
      window.location.href = "/login";
      return;
    }

    console.log(
      "🔗 Connecting GitHub with token:",
      this.token.substring(0, 20) + "..."
    );

    // Method 1: Use simple endpoint (recommended)
    window.location.href = `${this.baseUrl}/api/auth/github/connect/simple`;
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

  // Sync all repositories from GitHub
  syncRepositories() {
    return this.request("/api/repositories/sync", {
      method: "POST",
    });
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
      body: data,
    });
  }

  // Delete repository
  deleteRepository(repoId) {
    return this.request(`/api/repositories/${repoId}`, {
      method: "DELETE",
    });
  }

  // ========== ISSUES ENDPOINTS ==========

  // Analyze repository
  analyzeRepository(repositoryId) {
    return this.request(`/api/issues/analyze/${repositoryId}`, {
      method: "POST",
    });
  }

  // Get all issues
  getIssues(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/issues${query ? `?${query}` : ""}`);
  }

  // Get single issue
  getIssue(issueId) {
    return this.request(`/api/issues/${issueId}`);
  }

  // Fix issue (generate fix and create PR)
  fixIssue(issueId) {
    return this.request(`/api/issues/${issueId}/fix`, {
      method: "POST",
    });
  }

  // Update issue status
  updateIssue(issueId, data) {
    return this.request(`/api/issues/${issueId}`, {
      method: "PATCH",
      body: data,
    });
  }

  // Get issue stats
  getIssueStats(repositoryId) {
    return this.request(`/api/issues/stats/${repositoryId}`);
  }

  // ========== PULL REQUESTS ENDPOINTS ==========

  // Get all pull requests
  getPullRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/pull-requests${query ? `?${query}` : ""}`);
  }

  // Get single PR
  getPullRequest(prId) {
    return this.request(`/api/pull-requests/${prId}`);
  }

  // Get PR stats
  getPRStats(repositoryId) {
    return this.request(`/api/pull-requests/stats/${repositoryId}`);
  }

  // ========== AUDIT LOGS ENDPOINTS ==========

  // Get audit logs
  getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/audit${query ? `?${query}` : ""}`);
  }

  // Get audit stats
  getAuditStats(repositoryId) {
    const query = repositoryId ? `?repositoryId=${repositoryId}` : "";
    return this.request(`/api/audit/stats${query}`);
  }

  // Get single audit log
  getAuditLog(logId) {
    return this.request(`/api/audit/${logId}`);
  }

  getUpdatedPullRequests(repositoryId) {
    return this.request(`/api/stats/${repositoryId}`);
  }
  // ========== DEBUG ENDPOINTS ==========

  // Debug GitHub connection
  debugGitHubConnection() {
    return this.request("/api/auth/github/debug");
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
