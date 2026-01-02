// // API client for your backend
// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "https://pipex-ai-backend.onrender.com";

// class ApiClient {
//   constructor() {
//     this.baseUrl = API_BASE_URL;
//     this.token = localStorage.getItem("auth_token");
//   }

//   setToken(token) {
//     console.log("🔐 Setting token:", token ? "Present" : "Null");
//     this.token = token;
//     if (token) {
//       localStorage.setItem("auth_token", token);
//     }
//   }

//   clearToken() {
//     console.log("🔐 Clearing token");
//     this.token = null;
//     localStorage.removeItem("auth_token");
//   }

//   async request(endpoint, options = {}) {
//     const url = `${this.baseUrl}${endpoint}`;

//     const headers = {
//       "Content-Type": "application/json",
//       ...options.headers,
//     };

//     if (this.token) {
//       headers["Authorization"] = `Bearer ${this.token}`;
//     }

//     // console.log("🌐 API Request:", {
//     //   endpoint,
//     //   method: options.method || "GET",
//     // });

//     try {
//       const response = await fetch(url, {
//         ...options,
//         headers,
//         // Add timeout to prevent hanging requests
//         signal: AbortSignal.timeout(10000),
//       });

//       // console.log("📡 API Response:", {
//       //   endpoint,
//       //   status: response.status,
//       //   ok: response.ok,
//       // });

//       if (!response.ok) {
//         const errorText = await response.text();
//         let errorData;
//         try {
//           errorData = JSON.parse(errorText);
//         } catch {
//           errorData = { error: errorText || `HTTP ${response.status}` };
//         }

//         // Don't clear token on network errors, only on 401
//         if (response.status === 401) {
//           this.clearToken();
//           throw new Error("Session expired");
//         }

//         throw new Error(errorData.error || `API error: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error("💥 API Request Failed:", {
//         endpoint,
//         error: error.message,
//         url,
//       });

//       // Don't clear token on network errors
//       if (
//         error.name === "TimeoutError" ||
//         error.message.includes("Failed to fetch")
//       ) {
//         throw new Error("Network error: Cannot connect to server");
//       }

//       throw error;
//     }
//   }
//   // ========== AUTH ENDPOINTS ==========

//   // Get current user
//   getCurrentUser() {
//     return this.request("/api/auth/me");
//   }

//   // Check GitHub connection status
//   getGitHubStatus() {
//     return this.request("/api/auth/github/status");
//   }

//   // Connect GitHub account
//   // In api.js - FIXED connectGitHub method
//   connectGitHub() {
//     // Get token from localStorage (not just this.token)
//     const token = localStorage.getItem("auth_token");

//     console.log("🔗 connectGitHub called");
//     console.log("🔗 Token available:", !!token);
//     console.log("🔗 this.token:", this.token ? "Set" : "Not set");
//     console.log("🔗 localStorage token:", token ? "Present" : "Missing");

//     if (!token) {
//       console.error("❌ No auth token found for GitHub connection");
//       showToast("error", "Please login first"); // You need to define showToast or handle this
//       window.location.href = "/";
//       return;
//     }

//     console.log("🔗 Token length:", token.length);
//     console.log("🔗 Token preview:", token.substring(0, 30) + "...");

//     // Encode the token properly
//     const encodedToken = encodeURIComponent(token);
//     const githubUrl = `${this.baseUrl}/api/auth/github/connect?token=${encodedToken}`;

//     console.log("🔗 GitHub OAuth URL:", githubUrl);

//     // Redirect to GitHub OAuth
//     window.location.href = githubUrl;
//   }
//   // Disconnect GitHub
//   disconnectGitHub() {
//     return this.request("/api/auth/github/disconnect", {
//       method: "POST",
//     });
//   }

//   // Logout
//   logout() {
//     return this.request("/api/auth/logout", {
//       method: "POST",
//     }).finally(() => {
//       this.clearToken();
//     });
//   }

//   // ========== REPOSITORY ENDPOINTS ==========

//   // Get user repositories
//   getRepositories() {
//     return this.request("/api/repositories");
//   }

//   // Sync single repository
//   syncRepository(owner, repo) {
//     return this.request(`/api/repositories/${owner}/${repo}/sync`, {
//       method: "POST",
//     });
//   }

//   // Update repository settings
//   updateRepository(repoId, data) {
//     return this.request(`/api/repositories/${repoId}`, {
//       method: "PATCH",
//       body: JSON.stringify(data),
//     });
//   }

//   // ========== ANALYSIS ENDPOINTS ==========

//   // Analyze repository (to be implemented)
//   analyzeRepository(repositoryId) {
//     return this.request("/api/analysis/analyze", {
//       method: "POST",
//       body: JSON.stringify({ repositoryId }),
//     });
//   }

//   // Get repository issues
//   getRepositoryIssues(repositoryId) {
//     return this.request(`/api/analysis/repositories/${repositoryId}/issues`);
//   }

//   // Generate fix for issue
//   generateFix(issueId) {
//     return this.request("/api/analysis/generate-fix", {
//       method: "POST",
//       body: JSON.stringify({ issueId }),
//     });
//   }

//   // Create pull request
//   createPullRequest(data) {
//     return this.request("/api/analysis/create-pr", {
//       method: "POST",
//       body: JSON.stringify(data),
//     });
//   }
// }

// // Create singleton instance
// const apiClient = new ApiClient();

// export default apiClient;

// src/lib/api.js - UPDATED VERSION


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
      console.log("🔑 Adding Authorization header with token");
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

      console.log("✅ API Success:", endpoint);
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

  // ========== DEBUG ENDPOINTS ==========

  // Test if backend is accessible
  testBackend() {
    return this.request("/health");
  }

  // Test auth endpoint
  testAuth() {
    return this.request("/api/auth/me");
  }

  // Get debug config
  getDebugConfig() {
    return this.request("/api/auth/debug/config");
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
