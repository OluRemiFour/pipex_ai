import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileQuestion,
  GitBranch,
  GitPullRequest,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import apiClient from "../lib/api";

// Types (keep your existing interfaces)
interface Repository {
  _id: string;
  repoName: string;
  repoOwner: string;
  repoUrl: string;
  platform: string;
  framework?: string;
  language?: string;
  isActive: boolean;
  lastAnalyzedAt?: string;
  createdAt: string;
}

interface Issue {
  _id: string;
  repositoryId: string;
  title: string;
  issueType: string;
  severity: string;
  status: string;
  description: string;
  createdAt: string;
  aiConfidence?: number;
  filePath?: string;
  lineNumber?: number;
}

interface PullRequest {
  _id: string;
  repositoryId: string;
  prNumber: number;
  title: string;
  status: string;
  reviewStatus: string;
  prUrl: string;
  branch: string;
  filesChanged?: number;
  createdAt: string;
}

interface AuditLog {
  _id: string;
  agentName: string;
  action: string;
  riskLevel: string;
  approved: boolean;
  timestamp: string;
  details?: unknown;
}

export default function DashboardPage() {
  const [user, setUser] = useState<unknown>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "repos" | "issues" | "prs" | "audit"
  >("overview");
  const [fixingIssue, setFixingIssue] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [toasts, setToasts] = useState<
    Array<{ id: string; type: "success" | "error" | "info"; message: string }>
  >([]);
  const [issueSearch, setIssueSearch] = useState("");
  const [issueSeverityFilter, setIssueSeverityFilter] = useState<string>("all");
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  // ==================== 2. UTILITY FUNCTIONS ====================
  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "HIGH":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "LOW":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-cyan-400";
      case "merged":
        return "text-green-400";
      case "closed":
        return "text-gray-400";
      case "approved":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "changes-requested":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  // ==================== 3. DATA FETCHING FUNCTIONS ====================
  const fetchAllData = async () => {
    try {
      console.log("🔄 Fetching all data...");

      // Fetch repositories
      const reposData = await apiClient.getRepositories();
      setRepositories(reposData.repositories);
      console.log(`✅ Fetched ${reposData.repositories.length} repositories`);

      // Fetch issues
      const issuesData = await apiClient.getIssues();
      setIssues(issuesData.issues || []);
      console.log(`✅ Fetched ${issuesData.issues?.length || 0} issues`);

      // Fetch pull requests
      const prsData = await apiClient.getPullRequests();
      setPullRequests(prsData.pullRequests || []);
      console.log(
        `✅ Fetched ${prsData.pullRequests?.length || 0} pull requests`
      );

      // Fetch audit logs
      const auditData = await apiClient.getAuditLogs({ limit: 50 });
      setAuditLogs(auditData.logs || []);
      console.log(`✅ Fetched ${auditData.logs?.length || 0} audit logs`);

      return reposData.repositories.length;
    } catch (error: any) {
      console.error("❌ Failed to fetch data:", error);
      throw error;
    }
  };

  // ==================== 4. EVENT HANDLERS ====================
  const handleConnectGitHub = async () => {
    console.log("🔄 Starting GitHub connection...");
    setConnecting(true);

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        console.error("❌ No auth token found in localStorage");
        showToast("error", "Please login first");
        window.location.href = "/";
        return;
      }

      console.log("✅ Token found, initiating GitHub OAuth");

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL ||
        "https://pipex-ai-backend.onrender.com";
      const encodedToken = encodeURIComponent(token);
      const githubUrl = `${apiBaseUrl}/api/auth/github/connect?token=${encodedToken}`;

      console.log("🌐 Redirecting to:", githubUrl);
      window.location.href = githubUrl;
    } catch (error: any) {
      console.error("❌ Failed to connect GitHub:", error);
      showToast("error", error.message || "Failed to connect GitHub");
      setConnecting(false);
    }
  };

  const handleSyncGitHub = async () => {
    console.log("🔄 Starting GitHub sync...");
    setSyncing(true);

    try {
      if (!githubConnected) {
        console.log("⚠️ GitHub not connected, checking connection status...");

        // Debug: Check actual connection status
        try {
          const debugInfo = await apiClient.debugGitHubConnection();
          console.log("🔍 GitHub connection debug:", debugInfo.debug);

          if (!debugInfo.debug.isGitHubConnected) {
            showToast("error", "Please connect GitHub first");
            setSyncing(false);
            return;
          } else {
            // Connection exists but state is wrong, update it
            console.log("✅ GitHub is connected, updating state");
            setGithubConnected(true);
          }
        } catch (debugError) {
          console.error("❌ Debug failed:", debugError);
          showToast("error", "Please connect GitHub first");
          setSyncing(false);
          return;
        }
      }

      console.log("🔄 Calling sync endpoint...");

      // Call the sync endpoint
      const result = await apiClient.syncRepositories();

      console.log("✅ Sync result:", result);

      // Update local state
      if (result.repositories) {
        setRepositories(result.repositories);
      }

      const syncCount = result.synced || result.repositories?.length || 0;

      if (syncCount === 0) {
        showToast("info", "No repositories found in your GitHub account");
      } else {
        showToast(
          "success",
          `Successfully synced ${syncCount} repositories from GitHub!`
        );
      }

      // Show warning if there were errors
      if (result.errors && result.errors.length > 0) {
        console.warn("⚠️ Some repos had sync errors:", result.errors);
        showToast(
          "info",
          `${result.errors.length} repositories had sync issues`
        );
      }
    } catch (error: any) {
      console.error("❌ Failed to sync GitHub:", error);

      if (
        error.message.includes("401") ||
        error.message.includes("Session expired")
      ) {
        showToast("error", "Session expired. Please login again.");
        localStorage.removeItem("auth_token");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else if (error.message.includes("GitHub not connected")) {
        showToast("error", "GitHub connection lost. Please reconnect.");
        setGithubConnected(false);
      } else if (
        error.message.includes("Network") ||
        error.message.includes("Failed to fetch")
      ) {
        showToast("error", "Network error. Please check your connection.");
      } else {
        showToast("error", error.message || "Failed to sync repositories");
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleAnalyzeRepo = async (repoId: string, repoName: string) => {
    console.log("🔍 Analyzing repository:", repoName);
    setAnalyzing(repoId);

    try {
      showToast("info", `Starting analysis of ${repoName}...`);

      // Call analysis endpoint
      const result = await apiClient.analyzeRepository(repoId);

      console.log("✅ Analysis result:", result);

      if (result.issuesFound === 0) {
        showToast(
          "info",
          `Analysis complete! No issues found in ${repoName}. This could mean the code is clean or the AI needs more context.`
        );
      } else {
        showToast(
          "success",
          `Analysis complete! Found ${result.issuesFound} issues (${result.critical} critical)`
        );
      }

      // Refresh all data to show new issues and audit logs
      await fetchAllData();
    } catch (error: any) {
      console.error("❌ Failed to analyze repository:", error);
      showToast("error", error.message || "Failed to analyze repository");
    } finally {
      setAnalyzing(null);
    }
  };

  const handleFixIssue = async (issue: Issue) => {
    console.log("🔧 Fixing issue:", issue.title);
    setFixingIssue(issue._id);

    try {
      showToast("info", "Generating fix and creating pull request...");

      // Call fix endpoint
      const result = await apiClient.fixIssue(issue._id);

      // console.log("✅ Fix result:", result);

      showToast(
        "success",
        `Fix created! PR #${result.prNumber} is ready for review`
      );

      // Refresh data to update issue, PR lists, and audit logs
      await fetchAllData();

      // Switch to PRs tab to show the new PR
      setActiveTab("prs");
    } catch (error: any) {
      console.error("❌ Failed to fix issue:", error);
      showToast("error", error.message || "Failed to generate fix");
    } finally {
      setFixingIssue(null);
    }
  };

  const handleSignOut = async () => {
    console.log("👋 Signing out...");

    try {
      await apiClient.logout();
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      window.location.href = "/";
    }
  };

  // ==================== 6. EFFECTS ====================
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
          console.log("📥 Dashboard: Found token in URL, storing...");
          apiClient.setToken(token);
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("token");
          window.history.replaceState(
            {},
            document.title,
            newUrl.pathname + newUrl.search
          );
        }

        const githubConnectedParam = urlParams.get("github_connected");
        const githubUsername = urlParams.get("username");

        if (githubConnectedParam === "true") {
          console.log("✅ GitHub connected successfully:", githubUsername);
          showToast("success", `GitHub connected as @${githubUsername}!`);
          setGithubConnected(true);

          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("github_connected");
          newUrl.searchParams.delete("username");
          window.history.replaceState(
            {},
            document.title,
            newUrl.pathname + newUrl.search
          );
        }

        const error = urlParams.get("error");
        if (error) {
          const errorMessage = urlParams.get("message") || error;
          console.error("❌ Callback error:", errorMessage);
          showToast("error", `Error: ${errorMessage.replace(/_/g, " ")}`);

          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("error");
          newUrl.searchParams.delete("message");
          window.history.replaceState(
            {},
            document.title,
            newUrl.pathname + newUrl.search
          );
        }

        const storedToken = localStorage.getItem("auth_token");
        if (!storedToken) {
          console.error("❌ No auth token found");
          window.location.href = "/";
          return;
        }

        console.log("🔐 Dashboard: Token exists, fetching user...");

        const { user } = await apiClient.getCurrentUser();
        console.log("✅ User fetched:", user.email);
        setUser(user);

        try {
          const { isConnected } = await apiClient.getGitHubStatus();
          setGithubConnected(isConnected);
          console.log("✅ GitHub connection status:", isConnected);
        } catch (error) {
          console.log("ℹ️ GitHub not connected yet");
        }

        await fetchAllData();
      } catch (error: any) {
        console.error("❌ Dashboard initialization failed:", error);

        if (
          error.message.includes("Network error") ||
          error.message.includes("Failed to fetch")
        ) {
          showToast("error", "Cannot connect to server. Please try again.");
        } else if (
          error.message.includes("Session expired") ||
          error.message.includes("401")
        ) {
          localStorage.removeItem("auth_token");
          window.location.href = "/";
        } else {
          showToast("error", error.message || "Failed to load dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);
  // ==================== STATS CALCULATION ====================
  const stats = {
    totalRepos: repositories.length,
    activeRepos: repositories.filter((r) => r.isActive).length,
    openIssues: issues.filter(
      (i) => i.status !== "resolved" && i.status !== "ignored"
    ).length,
    openPRs: pullRequests.filter((pr) => pr.status === "open").length,
    criticalIssues: issues.filter(
      (i) => i.severity === "CRITICAL" && i.status !== "resolved"
    ).length,
  };

  // ==================== RENDER LOGIC ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-20 left-1/2 z-50 max-w-md w-full"
          >
            <div
              className={`mx-4 p-4 rounded-lg shadow-2xl border ${
                toast.type === "success"
                  ? "bg-emerald-900/90 border-emerald-500 text-emerald-100"
                  : toast.type === "error"
                  ? "bg-red-900/90 border-red-500 text-red-100"
                  : "bg-cyan-900/90 border-cyan-500 text-cyan-100"
              } backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3">
                {toast.type === "success" && (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                )}
                {toast.type === "error" && (
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                )}
                {toast.type === "info" && (
                  <Info className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Dashboard
                </h1>
                <p className="text-slate-400">
                  Welcome back, {user?.name || user?.email || "Developer"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {!githubConnected ? (
                  <button
                    onClick={handleConnectGitHub}
                    disabled={connecting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {connecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <GitBranch className="w-4 h-4" />
                    )}
                    {connecting ? "Connecting..." : "Connect GitHub"}
                  </button>
                ) : (
                  <button
                    onClick={handleSyncGitHub}
                    disabled={syncing}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {syncing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <GitBranch className="w-4 h-4" />
                    )}
                    {syncing ? "Syncing..." : "Sync GitHub"}
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <GitBranch className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stats.totalRepos}
                </div>
                <div className="text-sm text-slate-400">Total Repos</div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <CheckCircle2 className="w-6 h-6 text-green-400 mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stats.activeRepos}
                </div>
                <div className="text-sm text-slate-400">Active Monitoring</div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stats.openIssues}
                </div>
                <div className="text-sm text-slate-400">Open Issues</div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <GitPullRequest className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stats.openPRs}
                </div>
                <div className="text-sm text-slate-400">Open PRs</div>
              </div>
              <div className="bg-slate-800 border border-red-500/50 rounded-xl p-4">
                <XCircle className="w-6 h-6 text-red-400 mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stats.criticalIssues}
                </div>
                <div className="text-sm text-slate-400">Critical</div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
            {["overview", "repos", "issues", "prs", "audit"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "text-cyan-400 border-b-2 border-cyan-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "prs" ? "Pull Requests" : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Recent Issues */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Recent Issues
                  </h3>
                  {issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileQuestion className="w-16 h-16 text-slate-600 mb-4" />
                      <p className="text-slate-400 mb-2">
                        No issues detected yet
                      </p>
                      <p className="text-sm text-slate-500">
                        Analyze a repository to detect issues
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {issues.slice(0, 5).map((issue) => (
                        <div
                          key={issue._id}
                          className="flex items-start gap-4 p-3 bg-slate-900 rounded-lg"
                        >
                          <div
                            className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(
                              issue.severity
                            )}`}
                          >
                            {issue.severity}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {issue.title}
                            </div>
                            <div className="text-sm text-slate-400">
                              {issue.issueType}
                            </div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent PRs */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Recent Pull Requests
                  </h3>
                  <div className="space-y-3">
                    {pullRequests.slice(0, 5).map((pr) => (
                      <div
                        key={pr._id}
                        className="flex items-start gap-4 p-3 bg-slate-900 rounded-lg"
                      >
                        <GitPullRequest
                          className={`w-5 h-5 ${getStatusColor(pr.status)}`}
                        />
                        <div className="flex-1">
                          <a
                            href={pr.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-medium hover:text-cyan-400"
                          >
                            #{pr.prNumber} {pr.title}
                          </a>
                          <div className="text-sm text-slate-400">
                            {pr.branch}
                          </div>
                        </div>
                        <div
                          className={`text-xs font-semibold ${getStatusColor(
                            pr.status
                          )}`}
                        >
                          {pr.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "repos" && (
              <div className="space-y-4">
                {repositories.length === 0 ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <GitBranch className="w-20 h-20 text-slate-600 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">
                        No Repositories Connected
                      </h3>
                      <p className="text-slate-400 mb-6 max-w-md">
                        Connect your GitHub account and sync repositories to
                        start AI-powered DevOps monitoring
                      </p>
                      {!githubConnected ? (
                        <button
                          onClick={handleConnectGitHub}
                          disabled={connecting}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {connecting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <GitBranch className="w-5 h-5" />
                          )}
                          {connecting ? "Connecting..." : "Connect GitHub"}
                        </button>
                      ) : (
                        <button
                          onClick={handleSyncGitHub}
                          disabled={syncing}
                          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {syncing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <GitBranch className="w-5 h-5" />
                          )}
                          {syncing ? "Syncing..." : "Sync Repositories"}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  repositories.map((repo) => (
                    <div
                      key={repo._id}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {repo.repoOwner}/{repo.repoName}
                          </h3>
                          <a
                            href={repo.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-cyan-400 hover:underline"
                          >
                            {repo.repoUrl}
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleAnalyzeRepo(repo._id, repo.repoName)
                            }
                            disabled={analyzing === repo._id}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {analyzing === repo._id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Activity className="w-4 h-4" />
                                Analyze
                              </>
                            )}
                          </button>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              repo.isActive
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {repo.isActive ? "Active" : "Paused"}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Platform:</span>
                          <span className="text-white ml-2">
                            {repo.platform}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Language:</span>
                          <span className="text-white ml-2">
                            {repo.language || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Framework:</span>
                          <span className="text-white ml-2">
                            {repo.framework || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Last Analyzed:</span>
                          <span className="text-white ml-2">
                            {repo.lastAnalyzedAt
                              ? new Date(
                                  repo.lastAnalyzedAt
                                ).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "issues" && (
              <div className="space-y-4">
                {/* Issue Filters */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search issues by title, type, or file path..."
                        value={issueSearch}
                        onChange={(e) => setIssueSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <select
                      value={issueSeverityFilter}
                      onChange={(e) => setIssueSeverityFilter(e.target.value)}
                      className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="all">All Severities</option>
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>

                {issues.length === 0 ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <AlertTriangle className="w-20 h-20 text-slate-600 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">
                        No Issues Detected
                      </h3>
                      <p className="text-slate-400 mb-6 max-w-md">
                        Analyze your repositories to detect bugs, performance
                        issues, and code quality problems
                      </p>
                      <button
                        onClick={() => setActiveTab("repos")}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Activity className="w-5 h-5" />
                        Go to Repositories
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {issues
                      .filter((issue) => {
                        const matchesSearch =
                          !issueSearch ||
                          issue.title
                            .toLowerCase()
                            .includes(issueSearch.toLowerCase()) ||
                          issue.issueType
                            .toLowerCase()
                            .includes(issueSearch.toLowerCase()) ||
                          (issue.filePath &&
                            issue.filePath
                              .toLowerCase()
                              .includes(issueSearch.toLowerCase()));
                        const matchesSeverity =
                          issueSeverityFilter === "all" ||
                          issue.severity === issueSeverityFilter;
                        return matchesSearch && matchesSeverity;
                      })
                      .map((issue) => (
                        <div
                          key={issue._id}
                          className="bg-slate-800 border border-slate-700 rounded-xl p-6 cursor-pointer hover:border-cyan-500/50 transition-colors"
                          onClick={() =>
                            setExpandedIssue(
                              expandedIssue === issue._id ? null : issue._id
                            )
                          }
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(
                                    issue.severity
                                  )}`}
                                >
                                  {issue.severity}
                                </div>
                                <div className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs font-semibold">
                                  {issue.issueType}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {issue.aiConfidence &&
                                    `${Math.round(
                                      issue.aiConfidence * 100
                                    )}% confidence`}
                                </div>
                              </div>
                              <h3 className="text-lg font-bold text-white mb-2">
                                {issue.title}
                              </h3>
                              <p
                                className={`text-sm text-slate-400 mb-2 ${
                                  expandedIssue === issue._id
                                    ? ""
                                    : "line-clamp-2"
                                }`}
                              >
                                {issue.description}
                              </p>
                              {issue.filePath && (
                                <div className="text-xs text-slate-500 mb-1">
                                  📁 {issue.filePath}
                                  {issue.lineNumber
                                    ? `:${issue.lineNumber}`
                                    : ""}
                                </div>
                              )}
                              <div className="text-xs text-slate-500">
                                Detected{" "}
                                {new Date(issue.createdAt).toLocaleString()}
                              </div>
                              {expandedIssue === issue._id && (
                                <div className="mt-3 pt-3 border-t border-slate-700">
                                  <div className="text-sm text-slate-300 space-y-2">
                                    <div>
                                      <span className="font-semibold text-white">
                                        Repository ID:
                                      </span>{" "}
                                      {issue.repositoryId}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-white">
                                        Issue Type:
                                      </span>{" "}
                                      {issue.issueType}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-white">
                                        Severity:
                                      </span>{" "}
                                      {issue.severity}
                                    </div>
                                    {issue.aiConfidence && (
                                      <div>
                                        <span className="font-semibold text-white">
                                          AI Confidence:
                                        </span>{" "}
                                        {Math.round(issue.aiConfidence * 100)}%
                                      </div>
                                    )}
                                    {issue.filePath && (
                                      <div>
                                        <span className="font-semibold text-white">
                                          File:
                                        </span>{" "}
                                        {issue.filePath}
                                      </div>
                                    )}
                                    {issue.lineNumber && (
                                      <div>
                                        <span className="font-semibold text-white">
                                          Line:
                                        </span>{" "}
                                        {issue.lineNumber}
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-semibold text-white">
                                        Status:
                                      </span>{" "}
                                      {issue.status}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-white">
                                        Created:
                                      </span>{" "}
                                      {new Date(
                                        issue.createdAt
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  issue.status === "resolved"
                                    ? "bg-green-500/20 text-green-400"
                                    : issue.status === "pr-created"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {issue.status}
                              </div>
                              {issue.status === "detected" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFixIssue(issue);
                                  }}
                                  disabled={fixingIssue === issue._id}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {fixingIssue === issue._id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Fixing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4" />
                                      Fix Issue
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "prs" && (
              <div className="space-y-4">
                {pullRequests.length === 0 ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <GitPullRequest className="w-20 h-20 text-slate-600 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">
                        No Pull Requests Yet
                      </h3>
                      <p className="text-slate-400 mb-6 max-w-md">
                        AI-generated fixes will automatically create pull
                        requests here for your review
                      </p>
                      <button
                        onClick={() => setActiveTab("issues")}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        View Issues
                      </button>
                    </div>
                  </div>
                ) : (
                  pullRequests.map((pr) => (
                    <div
                      key={pr._id}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <GitPullRequest
                              className={`w-5 h-5 ${getStatusColor(pr.status)}`}
                            />
                            <a
                              href={pr.prUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xl font-bold text-white hover:text-cyan-400"
                            >
                              #{pr.prNumber}
                            </a>
                          </div>
                          <h3 className="text-lg text-white mb-2">
                            {pr.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>
                              Branch:{" "}
                              <span className="text-cyan-400">{pr.branch}</span>
                            </span>
                            {pr.filesChanged && (
                              <span>{pr.filesChanged} files changed</span>
                            )}
                            <span>
                              {new Date(pr.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              pr.status
                            )} bg-opacity-20`}
                          >
                            {pr.status}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              pr.reviewStatus
                            )} bg-opacity-20`}
                          >
                            {pr.reviewStatus}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "audit" && (
              <div className="space-y-3">
                {auditLogs.length === 0 ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Activity className="w-20 h-20 text-slate-600 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">
                        No Audit Logs
                      </h3>
                      <p className="text-slate-400 max-w-md">
                        All AI agent actions and approvals will be logged here
                        for transparency and security
                      </p>
                    </div>
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log._id}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`p-3 rounded-lg ${
                              log.approved
                                ? "bg-emerald-500/10"
                                : "bg-red-500/10"
                            }`}
                          >
                            {log.approved ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-bold text-white">
                                {log.agentName}
                              </h4>
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                                  log.riskLevel
                                )}`}
                              >
                                {log.riskLevel} Risk
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  log.approved
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {log.approved ? "Approved" : "Rejected"}
                              </div>
                            </div>
                            <p className="text-slate-300 mb-3">{log.action}</p>
                            {log.details && (
                              <div className="bg-slate-900 rounded-lg p-4 mb-3">
                                <div className="text-sm text-slate-400 mb-2 font-semibold">
                                  Details:
                                </div>
                                <div className="text-sm text-slate-300 font-mono">
                                  {typeof log.details === "string"
                                    ? log.details
                                    : JSON.stringify(log.details, null, 2)}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// REPLACE the entire DashboardPage.tsx with this fixed version

// import { AnimatePresence, motion } from "framer-motion";
// import {
//   Activity,
//   AlertTriangle,
//   CheckCircle2,
//   Clock,
//   FileQuestion,
//   GitBranch,
//   GitPullRequest,
//   Info,
//   Loader2,
//   XCircle,
// } from "lucide-react";
// import { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import apiClient from "../lib/api";

// // Types
// interface Repository {
//   _id: string;
//   repoName: string;
//   repoOwner: string;
//   repoUrl: string;
//   platform: string;
//   framework?: string;
//   language?: string;
//   isActive: boolean;
//   lastAnalyzedAt?: string;
//   createdAt: string;
// }

// interface Issue {
//   _id: string;
//   repositoryId: string | { _id: string; repoName: string; repoOwner: string }; // Can be populated
//   title: string;
//   issueType: string;
//   severity: string;
//   status: string;
//   description: string;
//   createdAt: string;
//   aiConfidence?: number;
//   filePath?: string;
//   lineNumber?: number;
//   codeSnippet?: string;
//   aiExplanation?: string;
//   suggestedFix?: string;
// }

// interface PullRequest {
//   _id: string;
//   repositoryId: string | { _id: string; repoName: string; repoOwner: string };
//   prNumber: number;
//   title: string;
//   status: string;
//   reviewStatus: string;
//   prUrl: string;
//   branch: string;
//   filesChanged?: number;
//   createdAt: string;
// }

// interface AuditLog {
//   _id: string;
//   agentName: string;
//   action: string;
//   riskLevel: string;
//   approved: boolean;
//   timestamp: string;
//   details?: any;
// }

// export default function DashboardPage() {
//   const [user, setUser] = useState<any>(null);
//   const [repositories, setRepositories] = useState<Repository[]>([]);
//   const [issues, setIssues] = useState<Issue[]>([]);
//   const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
//   const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [syncing, setSyncing] = useState(false);
//   const [connecting, setConnecting] = useState(false);
//   const [githubConnected, setGithubConnected] = useState(false);
//   const [activeTab, setActiveTab] = useState<
//     "overview" | "repos" | "issues" | "prs" | "audit"
//   >("overview");
//   const [fixingIssue, setFixingIssue] = useState<string | null>(null);
//   const [analyzing, setAnalyzing] = useState<string | null>(null);
//   const [toasts, setToasts] = useState<
//     Array<{ id: string; type: "success" | "error" | "info"; message: string }>
//   >([]);
//   const [issueSearch, setIssueSearch] = useState("");
//   const [issueSeverityFilter, setIssueSeverityFilter] = useState<string>("all");
//   const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

//   // Helper to get repository name from issue
//   const getRepoName = (issue: Issue) => {
//     if (typeof issue.repositoryId === "object") {
//       return `${issue.repositoryId.repoOwner}/${issue.repositoryId.repoName}`;
//     }
//     return issue.repositoryId;
//   };

//   // Utility functions
//   const showToast = (type: "success" | "error" | "info", message: string) => {
//     const id = Date.now().toString();
//     setToasts((prev) => [...prev, { id, type, message }]);
//     setTimeout(() => {
//       setToasts((prev) => prev.filter((t) => t.id !== id));
//     }, 5000);
//   };

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case "CRITICAL":
//         return "text-red-400 bg-red-500/10 border-red-500/30";
//       case "HIGH":
//         return "text-orange-400 bg-orange-500/10 border-orange-500/30";
//       case "MEDIUM":
//         return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
//       case "LOW":
//         return "text-blue-400 bg-blue-500/10 border-blue-500/30";
//       default:
//         return "text-gray-400 bg-gray-500/10 border-gray-500/30";
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "open":
//         return "text-cyan-400";
//       case "merged":
//         return "text-green-400";
//       case "closed":
//         return "text-gray-400";
//       case "approved":
//         return "text-green-400";
//       case "pending":
//         return "text-yellow-400";
//       case "changes-requested":
//         return "text-orange-400";
//       default:
//         return "text-gray-400";
//     }
//   };

//   // Data fetching
//   const fetchAllData = async () => {
//     try {
//       const [reposData, issuesData, prsData, auditData] = await Promise.all([
//         apiClient.getRepositories(),
//         apiClient.getIssues(),
//         apiClient.getPullRequests(),
//         apiClient.getAuditLogs({ limit: 50 }),
//       ]);

//       setRepositories(reposData.repositories || []);
//       setIssues(issuesData.issues || []);
//       setPullRequests(prsData.pullRequests || []);
//       setAuditLogs(auditData.logs || []);

//       return reposData.repositories?.length || 0;
//     } catch (error: any) {
//       console.error("❌ Failed to fetch data:", error);
//       throw error;
//     }
//   };

//   // Event handlers
//   const handleConnectGitHub = async () => {
//     setConnecting(true);
//     try {
//       const token = localStorage.getItem("auth_token");
//       if (!token) {
//         showToast("error", "Please login first");
//         window.location.href = "/";
//         return;
//       }

//       const apiBaseUrl =
//         import.meta.env.VITE_API_BASE_URL ||
//         "https://pipex-ai-backend.onrender.com";
//       window.location.href = `${apiBaseUrl}/api/auth/github/connect?token=${encodeURIComponent(
//         token
//       )}`;
//     } catch (error: any) {
//       showToast("error", error.message || "Failed to connect GitHub");
//       setConnecting(false);
//     }
//   };

//   const handleSyncGitHub = async () => {
//     setSyncing(true);
//     try {
//       const result = await apiClient.syncRepositories();
//       setRepositories(result.repositories || []);
//       const syncCount = result.synced || result.repositories?.length || 0;
//       showToast("success", `Successfully synced ${syncCount} repositories!`);
//     } catch (error: any) {
//       showToast("error", error.message || "Failed to sync repositories");
//     } finally {
//       setSyncing(false);
//     }
//   };

//   const handleAnalyzeRepo = async (repoId: string, repoName: string) => {
//     setAnalyzing(repoId);
//     try {
//       showToast("info", `Analyzing ${repoName}...`);
//       const result = await apiClient.analyzeRepository(repoId);

//       if (result.issuesFound === 0) {
//         showToast("info", `No issues found in ${repoName}`);
//       } else {
//         showToast(
//           "success",
//           `Found ${result.issuesFound} issues (${result.critical} critical)`
//         );
//       }
//       await fetchAllData();
//     } catch (error: any) {
//       showToast("error", error.message || "Analysis failed");
//     } finally {
//       setAnalyzing(null);
//     }
//   };

//   const handleFixIssue = async (issue: Issue) => {
//     setFixingIssue(issue._id);
//     try {
//       showToast("info", "Generating fix...");
//       const result = await apiClient.fixIssue(issue._id);
//       showToast("success", `PR #${result.prNumber} created!`);
//       await fetchAllData();
//       setActiveTab("prs");
//     } catch (error: any) {
//       showToast("error", error.message || "Fix generation failed");
//     } finally {
//       setFixingIssue(null);
//     }
//   };

//   const handleSignOut = async () => {
//     try {
//       await apiClient.logout();
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       localStorage.removeItem("auth_token");
//       window.location.href = "/";
//     }
//   };

//   // Initialize dashboard
//   useEffect(() => {
//     const init = async () => {
//       setLoading(true);
//       try {
//         const urlParams = new URLSearchParams(window.location.search);
//         const token = urlParams.get("token");

//         if (token) {
//           apiClient.setToken(token);
//           window.history.replaceState(
//             {},
//             document.title,
//             window.location.pathname
//           );
//         }

//         const githubConnectedParam = urlParams.get("github_connected");
//         if (githubConnectedParam === "true") {
//           const username = urlParams.get("username");
//           showToast("success", `GitHub connected as @${username}!`);
//           setGithubConnected(true);
//           window.history.replaceState(
//             {},
//             document.title,
//             window.location.pathname
//           );
//         }

//         const error = urlParams.get("error");
//         if (error) {
//           showToast("error", `Error: ${error.replace(/_/g, " ")}`);
//           window.history.replaceState(
//             {},
//             document.title,
//             window.location.pathname
//           );
//         }

//         const storedToken = localStorage.getItem("auth_token");
//         if (!storedToken) {
//           window.location.href = "/";
//           return;
//         }

//         const { user } = await apiClient.getCurrentUser();
//         setUser(user);

//         try {
//           const { isConnected } = await apiClient.getGitHubStatus();
//           setGithubConnected(isConnected);
//         } catch {}

//         await fetchAllData();
//       } catch (error: any) {
//         if (error.message.includes("401")) {
//           localStorage.removeItem("auth_token");
//           window.location.href = "/";
//         } else {
//           showToast("error", error.message || "Failed to load dashboard");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     init();
//   }, []);

//   const stats = {
//     totalRepos: repositories.length,
//     activeRepos: repositories.filter((r) => r.isActive).length,
//     openIssues: issues.filter(
//       (i) => i.status !== "resolved" && i.status !== "ignored"
//     ).length,
//     openPRs: pullRequests.filter((pr) => pr.status === "open").length,
//     criticalIssues: issues.filter(
//       (i) => i.severity === "CRITICAL" && i.status !== "resolved"
//     ).length,
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
//         <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
//       <Navbar />

//       {/* Toasts */}
//       <AnimatePresence>
//         {toasts.map((toast) => (
//           <motion.div
//             key={toast.id}
//             initial={{ opacity: 0, y: -50, x: "-50%" }}
//             animate={{ opacity: 1, y: 0, x: "-50%" }}
//             exit={{ opacity: 0, y: -50, x: "-50%" }}
//             className="fixed top-20 left-1/2 z-50 max-w-md w-full px-4"
//           >
//             <div
//               className={`p-4 rounded-lg shadow-2xl border backdrop-blur-sm ${
//                 toast.type === "success"
//                   ? "bg-emerald-900/90 border-emerald-500 text-emerald-100"
//                   : toast.type === "error"
//                   ? "bg-red-900/90 border-red-500 text-red-100"
//                   : "bg-cyan-900/90 border-cyan-500 text-cyan-100"
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 {toast.type === "success" && (
//                   <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
//                 )}
//                 {toast.type === "error" && (
//                   <XCircle className="w-5 h-5 flex-shrink-0" />
//                 )}
//                 {toast.type === "info" && (
//                   <Info className="w-5 h-5 flex-shrink-0" />
//                 )}
//                 <p className="text-sm font-medium">{toast.message}</p>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </AnimatePresence>

//       <div className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-8"
//           >
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//               <div>
//                 <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
//                   Dashboard
//                 </h1>
//                 <p className="text-slate-400 text-sm sm:text-base">
//                   Welcome back, {user?.name || user?.email || "Developer"}
//                 </p>
//               </div>
//               <div className="flex flex-wrap gap-3">
//                 {!githubConnected ? (
//                   <button
//                     onClick={handleConnectGitHub}
//                     disabled={connecting}
//                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base"
//                   >
//                     {connecting ? (
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                     ) : (
//                       <GitBranch className="w-4 h-4" />
//                     )}
//                     {connecting ? "Connecting..." : "Connect GitHub"}
//                   </button>
//                 ) : (
//                   <button
//                     onClick={handleSyncGitHub}
//                     disabled={syncing}
//                     className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base"
//                   >
//                     {syncing ? (
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                     ) : (
//                       <GitBranch className="w-4 h-4" />
//                     )}
//                     {syncing ? "Syncing..." : "Sync GitHub"}
//                   </button>
//                 )}
//                 <button
//                   onClick={handleSignOut}
//                   className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors text-sm sm:text-base"
//                 >
//                   Sign Out
//                 </button>
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
//               {[
//                 {
//                   icon: GitBranch,
//                   label: "Total Repos",
//                   value: stats.totalRepos,
//                   color: "text-cyan-400",
//                 },
//                 {
//                   icon: CheckCircle2,
//                   label: "Active",
//                   value: stats.activeRepos,
//                   color: "text-green-400",
//                 },
//                 {
//                   icon: AlertTriangle,
//                   label: "Open Issues",
//                   value: stats.openIssues,
//                   color: "text-yellow-400",
//                 },
//                 {
//                   icon: GitPullRequest,
//                   label: "Open PRs",
//                   value: stats.openPRs,
//                   color: "text-blue-400",
//                 },
//                 {
//                   icon: XCircle,
//                   label: "Critical",
//                   value: stats.criticalIssues,
//                   color: "text-red-400",
//                 },
//               ].map((stat, i) => (
//                 <div
//                   key={i}
//                   className="bg-slate-800 border border-slate-700 rounded-xl p-3 sm:p-4"
//                 >
//                   <stat.icon
//                     className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} mb-2`}
//                   />
//                   <div className="text-xl sm:text-2xl font-bold text-white">
//                     {stat.value}
//                   </div>
//                   <div className="text-xs sm:text-sm text-slate-400 truncate">
//                     {stat.label}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </motion.div>

//           {/* Tabs */}
//           <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto scrollbar-hide">
//             {["overview", "repos", "issues", "prs", "audit"].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab as any)}
//                 className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap ${
//                   activeTab === tab
//                     ? "text-cyan-400 border-b-2 border-cyan-400"
//                     : "text-slate-400 hover:text-white"
//                 }`}
//               >
//                 {tab === "prs" ? "Pull Requests" : tab}
//               </button>
//             ))}
//           </div>

//           {/* Tab Content */}
//           <motion.div
//             key={activeTab}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             {/* Issues Tab - FIXED */}
//             {activeTab === "issues" && (
//               <div className="space-y-4">
//                 <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
//                   <div className="flex flex-col sm:flex-row gap-4">
//                     <input
//                       type="text"
//                       placeholder="Search issues..."
//                       value={issueSearch}
//                       onChange={(e) => setIssueSearch(e.target.value)}
//                       className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
//                     />
//                     <select
//                       value={issueSeverityFilter}
//                       onChange={(e) => setIssueSeverityFilter(e.target.value)}
//                       className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
//                     >
//                       <option value="all">All Severities</option>
//                       <option value="CRITICAL">Critical</option>
//                       <option value="HIGH">High</option>
//                       <option value="MEDIUM">Medium</option>
//                       <option value="LOW">Low</option>
//                     </select>
//                   </div>
//                 </div>

//                 {issues.length === 0 ? (
//                   <div className="bg-slate-800 border border-slate-700 rounded-xl p-12">
//                     <div className="flex flex-col items-center justify-center text-center">
//                       <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 text-slate-600 mb-4" />
//                       <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
//                         No Issues Detected
//                       </h3>
//                       <p className="text-slate-400 mb-6 max-w-md text-sm sm:text-base">
//                         Analyze your repositories to detect bugs and issues
//                       </p>
//                       <button
//                         onClick={() => setActiveTab("repos")}
//                         className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-2"
//                       >
//                         <Activity className="w-5 h-5" />
//                         Go to Repositories
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {issues
//                       .filter((issue) => {
//                         const matchesSearch =
//                           !issueSearch ||
//                           issue.title
//                             .toLowerCase()
//                             .includes(issueSearch.toLowerCase()) ||
//                           issue.issueType
//                             .toLowerCase()
//                             .includes(issueSearch.toLowerCase()) ||
//                           (issue.filePath &&
//                             issue.filePath
//                               .toLowerCase()
//                               .includes(issueSearch.toLowerCase()));
//                         const matchesSeverity =
//                           issueSeverityFilter === "all" ||
//                           issue.severity === issueSeverityFilter;
//                         return matchesSearch && matchesSeverity;
//                       })
//                       .map((issue) => (
//                         <div
//                           key={issue._id}
//                           className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 cursor-pointer hover:border-cyan-500/50 transition-colors"
//                           onClick={() =>
//                             setExpandedIssue(
//                               expandedIssue === issue._id ? null : issue._id
//                             )
//                           }
//                         >
//                           <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
//                             <div className="flex-1 min-w-0">
//                               <div className="flex flex-wrap items-center gap-2 mb-2">
//                                 <div
//                                   className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(
//                                     issue.severity
//                                   )}`}
//                                 >
//                                   {issue.severity}
//                                 </div>
//                                 <div className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs font-semibold">
//                                   {issue.issueType}
//                                 </div>
//                                 {issue.aiConfidence && (
//                                   <div className="text-xs text-slate-500">
//                                     {Math.round(issue.aiConfidence * 100)}%
//                                     confidence
//                                   </div>
//                                 )}
//                               </div>
//                               <h3 className="text-base sm:text-lg font-bold text-white mb-2 break-words">
//                                 {issue.title}
//                               </h3>
//                               <p
//                                 className={`text-sm text-slate-400 mb-2 ${
//                                   expandedIssue === issue._id
//                                     ? ""
//                                     : "line-clamp-2"
//                                 }`}
//                               >
//                                 {issue.description}
//                               </p>
//                               {issue.filePath && (
//                                 <div className="text-xs text-slate-500 mb-1 break-all">
//                                   📁 {issue.filePath}
//                                   {issue.lineNumber
//                                     ? `:${issue.lineNumber}`
//                                     : ""}
//                                 </div>
//                               )}
//                               <div className="text-xs text-slate-500">
//                                 Detected{" "}
//                                 {new Date(issue.createdAt).toLocaleString()}
//                               </div>

//                               {/* Expanded Details - FIXED */}
//                               {expandedIssue === issue._id && (
//                                 <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
//                                   <div className="text-sm text-slate-300 space-y-2">
//                                     <div className="break-words">
//                                       <span className="font-semibold text-white">
//                                         Repository:
//                                       </span>{" "}
//                                       {getRepoName(issue)}
//                                     </div>
//                                     {issue.codeSnippet && (
//                                       <div>
//                                         <span className="font-semibold text-white">
//                                           Code Snippet:
//                                         </span>
//                                         <pre className="mt-2 p-3 bg-slate-900 rounded text-xs overflow-x-auto">
//                                           <code>{issue.codeSnippet}</code>
//                                         </pre>
//                                       </div>
//                                     )}
//                                     {issue.aiExplanation && (
//                                       <div className="break-words">
//                                         <span className="font-semibold text-white">
//                                           AI Explanation:
//                                         </span>{" "}
//                                         {issue.aiExplanation}
//                                       </div>
//                                     )}
//                                     {issue.suggestedFix && (
//                                       <div className="break-words">
//                                         <span className="font-semibold text-white">
//                                           Suggested Fix:
//                                         </span>{" "}
//                                         {issue.suggestedFix}
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>
//                               )}
//                             </div>

//                             <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end">
//                               <div
//                                 className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
//                                   issue.status === "resolved"
//                                     ? "bg-green-500/20 text-green-400"
//                                     : issue.status === "pr-created"
//                                     ? "bg-blue-500/20 text-blue-400"
//                                     : "bg-yellow-500/20 text-yellow-400"
//                                 }`}
//                               >
//                                 {issue.status}
//                               </div>
//                               {issue.status === "detected" && (
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleFixIssue(issue);
//                                   }}
//                                   disabled={fixingIssue === issue._id}
//                                   className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
//                                 >
//                                   {fixingIssue === issue._id ? (
//                                     <>
//                                       <Loader2 className="w-4 h-4 animate-spin" />{" "}
//                                       Fixing...
//                                     </>
//                                   ) : (
//                                     <>
//                                       <CheckCircle2 className="w-4 h-4" /> Fix
//                                     </>
//                                   )}
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                 )}
//               </div>
//             )}
//             {activeTab === "prs" && (
//               <div className="space-y-4">
//                 {pullRequests.length === 0 ? (
//                   <div className="bg-slate-800 border border-slate-700 rounded-xl p-12">
//                     <div className="flex flex-col items-center justify-center text-center">
//                       <GitPullRequest className="w-20 h-20 text-slate-600 mb-4" />
//                       <h3 className="text-xl font-bold text-white mb-2">
//                         No Pull Requests Yet
//                       </h3>
//                       <p className="text-slate-400 mb-6 max-w-md">
//                         AI-generated fixes will automatically create pull
//                         requests here for your review
//                       </p>
//                       <button
//                         onClick={() => setActiveTab("issues")}
//                         className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2"
//                       >
//                         <CheckCircle2 className="w-5 h-5" />
//                         View Issues
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   pullRequests.map((pr) => (
//                     <div
//                       key={pr._id}
//                       className="bg-slate-800 border border-slate-700 rounded-xl p-6"
//                     >
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-3 mb-2">
//                             <GitPullRequest
//                               className={`w-5 h-5 ${getStatusColor(pr.status)}`}
//                             />
//                             <a
//                               href={pr.prUrl}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-xl font-bold text-white hover:text-cyan-400"
//                             >
//                               #{pr.prNumber}
//                             </a>
//                           </div>
//                           <h3 className="text-lg text-white mb-2">
//                             {pr.title}
//                           </h3>
//                           <div className="flex items-center gap-4 text-sm text-slate-400">
//                             <span>
//                               Branch:{" "}
//                               <span className="text-cyan-400">{pr.branch}</span>
//                             </span>
//                             {pr.filesChanged && (
//                               <span>{pr.filesChanged} files changed</span>
//                             )}
//                             <span>
//                               {new Date(pr.createdAt).toLocaleDateString()}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="flex flex-col gap-2">
//                           <div
//                             className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
//                               pr.status
//                             )} bg-opacity-20`}
//                           >
//                             {pr.status}
//                           </div>
//                           <div
//                             className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
//                               pr.reviewStatus
//                             )} bg-opacity-20`}
//                           >
//                             {pr.reviewStatus}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}

//             {activeTab === "audit" && (
//               <div className="space-y-3">
//                 {auditLogs.length === 0 ? (
//                   <div className="bg-slate-800 border border-slate-700 rounded-xl p-12">
//                     <div className="flex flex-col items-center justify-center text-center">
//                       <Activity className="w-20 h-20 text-slate-600 mb-4" />
//                       <h3 className="text-xl font-bold text-white mb-2">
//                         No Audit Logs
//                       </h3>
//                       <p className="text-slate-400 max-w-md">
//                         All AI agent actions and approvals will be logged here
//                         for transparency and security
//                       </p>
//                     </div>
//                   </div>
//                 ) : (
//                   auditLogs.map((log) => (
//                     <div
//                       key={log._id}
//                       className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
//                     >
//                       <div className="flex items-start justify-between mb-4">
//                         <div className="flex items-start gap-4 flex-1">
//                           <div
//                             className={`p-3 rounded-lg ${
//                               log.approved
//                                 ? "bg-emerald-500/10"
//                                 : "bg-red-500/10"
//                             }`}
//                           >
//                             {log.approved ? (
//                               <CheckCircle2 className="w-6 h-6 text-emerald-400" />
//                             ) : (
//                               <XCircle className="w-6 h-6 text-red-400" />
//                             )}
//                           </div>
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-2">
//                               <h4 className="text-lg font-bold text-white">
//                                 {log.agentName}
//                               </h4>
//                               <div
//                                 className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
//                                   log.riskLevel
//                                 )}`}
//                               >
//                                 {log.riskLevel} Risk
//                               </div>
//                               <div
//                                 className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                                   log.approved
//                                     ? "bg-emerald-500/20 text-emerald-400"
//                                     : "bg-red-500/20 text-red-400"
//                                 }`}
//                               >
//                                 {log.approved ? "Approved" : "Rejected"}
//                               </div>
//                             </div>
//                             <p className="text-slate-300 mb-3">{log.action}</p>
//                             {log.details && (
//                               <div className="bg-slate-900 rounded-lg p-4 mb-3">
//                                 <div className="text-sm text-slate-400 mb-2 font-semibold">
//                                   Details:
//                                 </div>
//                                 <div className="text-sm text-slate-300 font-mono">
//                                   {typeof log.details === "string"
//                                     ? log.details
//                                     : JSON.stringify(log.details, null, 2)}
//                                 </div>
//                               </div>
//                             )}
//                             <div className="flex items-center gap-2 text-xs text-slate-500">
//                               <Clock className="w-4 h-4" />
//                               <span>
//                                 {new Date(log.timestamp).toLocaleString()}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }
