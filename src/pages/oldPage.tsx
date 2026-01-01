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
import { lumi } from "../lib/lumi";
import process from "process";

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

  useEffect(() => {
    checkAuth();
    checkGitHubConnection();
    autoCleanupDummyData();
  }, []);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const autoCleanupDummyData = async () => {
    try {
      await lumi.functions.invoke("cleanup-dummy-data", {
        method: "POST",
      });
      console.log("Auto-cleanup completed");
    } catch (error) {
      console.error("Auto-cleanup failed:", error);
    }
  };

  const checkGitHubConnection = async () => {
    try {
      const tokens = await lumi.entities.usertokens.list({
        filter: { userId: lumi.auth.user?.userId, platform: "GitHub" },
        limit: 1,
      });
      setGithubConnected(tokens.list.length > 0);
    } catch (error) {
      console.error("Failed to check GitHub connection:", error);
    }
  };

  const checkAuth = async () => {
    const currentUser = lumi.auth.user;
    if (!currentUser) {
      // If not logged in, redirect to home
      window.location.href = "/";
      return;
    }
    setUser(currentUser);
    await fetchAllData();
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const userId = lumi.auth.user?.userId;
      if (!userId) return;

      // Fetch user's repositories first
      const reposData = await lumi.entities.repositories.list({
        filter: { userId },
        sort: { createdAt: -1 },
        limit: 50,
      });
      const userRepoIds = reposData.list.map((r) => r._id);

      // Fetch issues and PRs scoped to user's repos
      const [issuesData, prsData, logsData] = await Promise.all([
        lumi.entities.issues.list({
          filter: { repositoryId: { $in: userRepoIds } },
          sort: { createdAt: -1 },
          limit: 50,
        }),
        lumi.entities.pullrequests.list({
          filter: { repositoryId: { $in: userRepoIds } },
          sort: { createdAt: -1 },
          limit: 50,
        }),
        lumi.entities.auditlogs.list({
          filter: { userId },
          sort: { timestamp: -1 },
          limit: 50,
        }),
      ]);

      setRepositories(reposData.list);
      setIssues(issuesData.list);
      setPullRequests(prsData.list);
      setAuditLogs(logsData.list);

      // Auto-sync PR statuses from GitHub
      syncAllPRStatuses(prsData.list, reposData.list);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncAllPRStatuses = async (prs: PullRequest[], repos: Repository[]) => {
    try {
      for (const pr of prs) {
        if (pr.status === "open") {
          const repo = repos.find((r) => r._id === pr.repositoryId);
          if (repo) {
            await lumi.functions.invoke("sync-pr-status", {
              method: "POST",
              body: {
                prNumber: pr.prNumber,
                repoOwner: repo.repoOwner,
                repoName: repo.repoName,
                prId: pr._id,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to sync PR statuses:", error);
    }
  };

  const handleConnectGitHub = async () => {
    setConnecting(true);
    try {
      const result = await lumi.functions.invoke("github-oauth", {
        method: "GET",
        query: { action: "authorize" },
      });
      console.log("OAuth result:", result);
      if (result.redirectUrl) {
        console.log("Redirecting to:", result.redirectUrl);
        // Open GitHub OAuth in new tab to avoid iframe CSP issues
        window.open(result.redirectUrl, "_blank");
        setConnecting(false);
      } else {
        console.error("No redirectUrl in response:", result);
        showToast("error", "Failed to get GitHub authorization URL");
        setConnecting(false);
      }
    } catch (error) {
      console.error("Failed to connect GitHub:", error);
      showToast("error", `GitHub connection failed: ${error.message || error}`);
      setConnecting(false);
    }
  };

  const handleSyncGitHub = async () => {
    setSyncing(true);
    try {
      const result = await lumi.functions.invoke("github-repos", {
        method: "POST",
      });
      console.log("Sync result:", result);
      await fetchAllData();
    } catch (error) {
      console.error("Failed to sync GitHub:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleAnalyzeRepo = async (repoId: string, repoName: string) => {
    setAnalyzing(repoId);
    try {
      // Find the repository
      const repo = repositories.find((r) => r._id === repoId);
      if (!repo) {
        showToast("error", "Repository not found");
        return;
      }

      // Call Analyzer Agent
      const result = await lumi.functions.invoke("analyze-repo", {
        method: "POST",
        body: {
          repositoryId: repoId,
          repoOwner: repo.repoOwner,
          repoName: repo.repoName,
          repoUrl: repo.repoUrl,
        },
      });

      console.log("Analysis result:", result);

      if (result.error) {
        showToast("error", `Analysis failed: ${result.error}`);
      } else {
        showToast(
          "success",
          `Analysis complete! Found ${result.issuesFound || 0} issues`
        );
      }

      // Refresh data to show new issues
      await fetchAllData();
    } catch (error) {
      console.error("Failed to analyze repository:", error);
      showToast("error", `Analysis error: ${error.message || error}`);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleFixIssue = async (issue: Issue) => {
    setFixingIssue(issue._id);
    try {
      // Validate issue has required fields
      if (!issue.filePath) {
        showToast("error", "Cannot fix: Issue missing file path information");
        return;
      }

      // Get repository details
      const repo = repositories.find((r) => r._id === issue.repositoryId);
      if (!repo) {
        showToast("error", "Repository not found");
        return;
      }

      // Step 1: Generate Fix
      console.log("🔧 Step 1: Generating fix...");
      const fixResult = await lumi.functions.invoke("generate-fix", {
        method: "POST",
        body: {
          issueId: issue._id,
          repoOwner: repo.repoOwner,
          repoName: repo.repoName,
          filePath: issue.filePath,
          issueDescription: issue.description,
        },
      });

      console.log("Fix generated:", fixResult);

      if (fixResult.error) {
        showToast("error", `Fix generation failed: ${fixResult.error}`);
        return;
      }

      // Step 2: Create PR with the fix
      console.log("📤 Step 2: Creating Pull Request...");
      const prResult = await lumi.functions.invoke("create-pull-request", {
        method: "POST",
        body: {
          repoOwner: repo.repoOwner,
          repoName: repo.repoName,
          filePath: issue.filePath,
          fixedCode: fixResult.fixedCode,
          prTitle: `🤖 AI Fix: ${issue.title}`,
          prBody: `## AI-Generated Fix\n\n**Issue**: ${issue.title}\n**Severity**: ${issue.severity}\n**Type**: ${issue.issueType}\n\n### Description\n${issue.description}\n\n### Changes\n- Fixed code issues in \`${issue.filePath}\`\n- Lines changed: ${fixResult.stats?.originalLines} → ${fixResult.stats?.fixedLines} (${fixResult.stats?.changePercent}% change)\n\n### AI Analysis\nThis fix was automatically generated and reviewed by AI DevOps agents.\n\n---\n*Generated by AI DevOps Engineer*`,
          issueId: issue._id,
        },
      });

      console.log("PR created:", prResult);

      if (prResult.error) {
        showToast("error", `PR creation failed: ${prResult.error}`);
        return;
      }

      // Update issue status
      await lumi.entities.issues.update(issue._id, {
        status: "pr-created",
        updatedAt: new Date().toISOString(),
      });

      showToast(
        "success",
        `Pull Request #${prResult.pr.number} created successfully! View on GitHub.`
      );
      window.open(prResult.pr.url, "_blank");

      // Refresh data
      await fetchAllData();
    } catch (error) {
      console.error("Failed to fix issue:", error);
      showToast("error", `Fix issue error: ${error.message || error}`);
    } finally {
      setFixingIssue(null);
    }
  };

  const handleSignOut = () => {
    lumi.auth.signOut();
    window.location.href = "/";
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
                  Welcome back, {user?.userName || "Developer"}
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
