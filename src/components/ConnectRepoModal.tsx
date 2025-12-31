import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, GitBranch, Loader2, CheckCircle } from "lucide-react";
import { lumi } from "../lib/lumi";

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ConnectRepoModal({
  isOpen,
  onClose,
  onSuccess,
}: ConnectRepoModalProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Parse repository URL
      const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
      const match = repoUrl.match(urlPattern);

      if (!match) {
        throw new Error(
          "Invalid GitHub URL. Expected format: https://github.com/owner/repo"
        );
      }

      const [, owner, repoName] = match;
      const cleanRepoName = repoName.replace(/\.git$/, "");

      // Create repository record
      await lumi.entities.repositories.create({
        userId: lumi.auth.user?.userId || "demo-user",
        repoName: cleanRepoName,
        repoOwner: owner,
        repoUrl: repoUrl,
        platform: "github",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        defaultBranch: "main",
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
        setRepoUrl("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to connect repository");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setRepoUrl("");
      setError("");
      setSuccess(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full shadow-2xl"
          >
            {success ? (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Repository Connected!
                </h3>
                <p className="text-slate-400">
                  AI analysis will begin shortly...
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Connect Repository
                  </h2>
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      GitHub Repository URL
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/username/repository"
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Example: https://github.com/facebook/react
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-cyan-400" />
                      What happens next?
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-400">
                      <li>✓ AI analyzes your codebase</li>
                      <li>✓ Detects performance issues & bugs</li>
                      <li>✓ Creates PRs with fixes (pending your approval)</li>
                      <li>✓ Never commits directly to protected branches</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !repoUrl}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Github className="w-5 h-5" />
                        Connect Repository
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-slate-500 text-center mt-4">
                  By connecting, you agree to allow DevOpsAI to read your
                  repository and open pull requests.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
