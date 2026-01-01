import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  GitPullRequest,
  Zap,
  Eye,
  CheckCircle,
  ArrowRight,
  Code2,
  Server,
  GitBranch,
  X,
  Github,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { lumi } from "../lib/lumi";

export default function HomePage() {
  const [typedText, setTypedText] = useState("");
  const fullText = "$ devops-ai analyze --repo=your-repo --fix --open-pr";
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const handleConnectRepo = async () => {
    if (!lumi.auth.isAuthenticated) {
      await lumi.auth.signIn();
      return;
    }
    setShowRepoModal(true);
  };

  const handleSubmitRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    try {
      const urlParts = repoUrl.replace("https://github.com/", "").split("/");
      const owner = urlParts[0];
      const name = urlParts[1];

      await lumi.entities.repositories.create({
        userId: lumi.auth.user?.userId || "",
        repoName: name,
        repoOwner: owner,
        repoUrl: repoUrl,
        platform: "github",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        defaultBranch: "main",
        language: "TypeScript",
        framework: "React",
      });

      setShowRepoModal(false);
      setRepoUrl("");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error connecting repository:", error);
      alert("Failed to connect repository. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
              <span className="text-cyan-400 text-sm font-medium">
                AI-Powered DevOps Automation
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight px-4">
              Your Senior DevOps
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Engineer on Demand
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Autonomous AI that diagnoses bugs, optimizes CI/CD pipelines, and
              opens pull requests—while keeping you in complete control
            </p>

            {/* Terminal Demo */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-3xl mx-auto mb-8 text-left shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="font-mono text-green-400 text-sm md:text-base">
                {typedText}
                <span className="animate-pulse">|</span>
              </div>
              {typedText.length >= fullText.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-slate-400 text-sm"
                >
                  <div>✓ Repository analyzed</div>
                  <div>✓ 3 performance issues detected</div>
                  <div>✓ Docker build optimized (-40% build time)</div>
                  <div>✓ Pull request opened: #PR-1247</div>
                </motion.div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Link
                to="/architecture"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2 group"
              >
                View Architecture
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={handleConnectRepo}
                className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
              >
                Connect Repository
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Names Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Product Naming Options
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: "PipexAI", tagline: "Your AI DevOps Engineer" },
              {
                name: "PipelineGuard",
                tagline: "Autonomous CI/CD Optimization",
              },
              { name: "RepoSentry", tagline: "Intelligent Code Health" },
              { name: "MergeFlow", tagline: "AI-Powered PR Automation" },
              { name: "StackWatch", tagline: "Proactive DevOps Intelligence" },
            ].map((option, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-colors"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {option.name}
                </h3>
                <p className="text-sm text-slate-400">{option.tagline}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Engineering Teams Choose PipexAI
            </h2>
            <p className="text-xl text-slate-400">
              Real engineering expertise, zero hallucinations, complete control
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Human-in-the-Loop Safety",
                description:
                  "Every change requires approval. Never pushes to protected branches. All actions are auditable and reversible.",
              },
              {
                icon: GitPullRequest,
                title: "Production-Ready PRs",
                description:
                  "Opens detailed pull requests with context, risk assessment, and reasoning—not just code dumps.",
              },
              {
                icon: Zap,
                title: "Real Performance Gains",
                description:
                  "Measurable improvements: 40% faster CI builds, 60% fewer re-renders, 30% smaller bundles.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Killer Features */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            What It Actually Does
          </h2>

          <div className="space-y-6">
            {[
              {
                icon: Code2,
                title: "Detects React/Next.js Performance Issues",
                description:
                  "Identifies unnecessary re-renders, improper hook usage, bundle bloat, and proposes optimized refactors with measurable impact.",
              },
              {
                icon: Server,
                title: "Optimizes CI/CD Pipelines",
                description:
                  "Analyzes GitHub Actions, GitLab CI, Docker builds—finds caching opportunities, parallelization, and removes redundant steps.",
              },
              {
                icon: GitBranch,
                title: "Fixes Failing Builds Automatically",
                description:
                  "Reads build logs, identifies root causes (dependency conflicts, test failures, misconfigs), and opens PRs with solutions.",
              },
              {
                icon: Eye,
                title: "Enforces DevOps Best Practices",
                description:
                  "Checks for secrets in code, validates Dockerfile patterns, ensures proper branching strategies, and maintains infrastructure-as-code standards.",
              },
              {
                icon: CheckCircle,
                title: "Risk-Scored Changes",
                description:
                  "Every proposed change includes risk assessment: LOW (safe refactor), MEDIUM (logic change), HIGH (infra modification)—you decide what runs.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Connect Repository",
                description:
                  "Install GitHub App, grant read/write access to selected repos",
              },
              {
                step: "02",
                title: "AI Analyzes Codebase",
                description:
                  "Multi-agent system indexes code, CI configs, and historical issues",
              },
              {
                step: "03",
                title: "Issues Detected",
                description:
                  "Dashboard shows findings with severity, impact, and fix proposals",
              },
              {
                step: "04",
                title: "Approve & Merge",
                description:
                  "Review PR, run tests, approve—AI never commits without permission",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-6">
            Built for Teams That Can't Afford Mistakes
          </h2>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            No code is executed without explicit approval. All changes are
            auditable. Secrets are never exposed. Protected branches are sacred.
            This isn't a chatbot—it's a senior engineer with guardrails.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="px-4 py-2 bg-slate-800 rounded-full">
              ✓ SOC 2 Type II Compliant
            </span>
            <span className="px-4 py-2 bg-slate-800 rounded-full">
              ✓ Zero Direct Commits
            </span>
            <span className="px-4 py-2 bg-slate-800 rounded-full">
              ✓ Audit Logs for Everything
            </span>
            <span className="px-4 py-2 bg-slate-800 rounded-full">
              ✓ Self-Hosted Option
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Ship Faster, Break Less?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Start with 3 free repository analyses. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleConnectRepo}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Connect GitHub Now
            </button>
            <Link
              to="/architecture"
              className="px-8 py-4 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
            >
              Read Technical Details
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2024 PipexAI. Built for engineers who value safety and speed.</p>
        </div>
      </footer>

      {/* Repository Connection Modal */}
      {showRepoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Connect Repository
                </h2>
              </div>
              <button
                onClick={() => setShowRepoModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitRepo} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <p className="mt-2 text-sm text-slate-400">
                  Enter the full URL of your GitHub repository
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">
                  What happens next?
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>AI analyzes your codebase and CI/CD pipelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Issues are detected and prioritized by severity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Pull requests are created (with your approval)</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRepoModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Connecting..." : "Connect Repository"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
