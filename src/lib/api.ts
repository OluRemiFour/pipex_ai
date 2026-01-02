// API client for your backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://pipex-ai-backend.onrender.com";

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token) {
    console.log("🔐 Setting token:", token ? "Present" : "Null");
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    }
  }

  clearToken() {
    console.log("🔐 Clearing token");
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

    console.log("🌐 API Request:", {
      endpoint,
      method: options.method || "GET",
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000),
      });

      console.log("📡 API Response:", {
        endpoint,
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }

        // Don't clear token on network errors, only on 401
        if (response.status === 401) {
          this.clearToken();
          throw new Error("Session expired");
        }

        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("💥 API Request Failed:", {
        endpoint,
        error: error.message,
        url,
      });

      // Don't clear token on network errors
      if (
        error.name === "TimeoutError" ||
        error.message.includes("Failed to fetch")
      ) {
        throw new Error("Network error: Cannot connect to server");
      }

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
