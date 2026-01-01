import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  Code,
  Gauge,
  Container,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Core Capabilities
            </h1>
            <p className="text-xl text-slate-400">
              Production-grade features for real engineering teams
            </p>
          </motion.div>

          {/* Frontend Optimization */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <Code className="w-8 h-8 text-cyan-400" />
              1. Frontend Optimization Capabilities
            </h2>

            <div className="space-y-6">
              {[
                {
                  title: "React Performance Issue Detection",
                  problems: [
                    "Unnecessary re-renders from improper memoization",
                    "useEffect dependency array mistakes",
                    "Prop drilling causing cascading updates",
                    "Large component trees without optimization",
                    "Inline function definitions in render",
                  ],
                  solution:
                    "AI analyzes component hierarchy and hook usage, identifies hot paths, proposes React.memo, useMemo, useCallback strategically",
                },
                {
                  title: "Next.js Optimization Patterns",
                  problems: [
                    "Missing dynamic imports for heavy components",
                    "Client-side fetching instead of getServerSideProps",
                    "Unoptimized images without next/image",
                    "Bundle size bloat from barrel imports",
                    "Missing ISR for static-heavy pages",
                  ],
                  solution:
                    "Detects Next.js patterns, suggests SSR/SSG migration, automatic image optimization, code splitting recommendations",
                },
                {
                  title: "Measurable Impact Validation",
                  metrics: [
                    "Bundle size reduction (KB): Tracks before/after webpack stats",
                    "Render count reduction: Instruments React DevTools Profiler",
                    "Lighthouse score improvements: CI-integrated performance audits",
                    "Time to Interactive (TTI): Real User Monitoring integration",
                    "Core Web Vitals: LCP, FID, CLS tracking",
                  ],
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>

                  {feature.problems && (
                    <div className="mb-4">
                      <p className="text-sm text-red-400 font-semibold mb-2">
                        ⚠️ Detects:
                      </p>
                      <ul className="space-y-1">
                        {feature.problems.map((problem, pIdx) => (
                          <li
                            key={pIdx}
                            className="text-slate-300 text-sm flex items-start gap-2"
                          >
                            <span className="text-red-400">•</span>
                            <span>{problem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feature.solution && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-sm text-green-400 font-semibold mb-1">
                        ✓ Solution:
                      </p>
                      <p className="text-slate-300 text-sm">
                        {feature.solution}
                      </p>
                    </div>
                  )}

                  {feature.metrics && (
                    <div>
                      <p className="text-sm text-cyan-400 font-semibold mb-2">
                        📊 Metrics Tracked:
                      </p>
                      <ul className="space-y-1">
                        {feature.metrics.map((metric, mIdx) => (
                          <li
                            key={mIdx}
                            className="text-slate-300 text-sm flex items-start gap-2"
                          >
                            <span className="text-cyan-400">→</span>
                            <span>{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* CI/CD Optimization */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <Container className="w-8 h-8 text-cyan-400" />
              2. CI/CD & DevOps Capabilities
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Gauge,
                  title: "Pipeline Analysis",
                  capabilities: [
                    "Identifies redundant steps in GitHub Actions",
                    "Detects missing cache configurations",
                    "Finds parallel execution opportunities",
                    "Measures actual execution time per step",
                    "Compares against industry benchmarks",
                  ],
                },
                {
                  icon: Container,
                  title: "Docker Optimization",
                  capabilities: [
                    "Multi-stage build detection and improvement",
                    "Layer caching optimization",
                    "Base image recommendations (Alpine vs Slim)",
                    "Unnecessary package removal",
                    "BuildKit feature usage",
                  ],
                },
                {
                  icon: AlertTriangle,
                  title: "Build Failure Resolution",
                  capabilities: [
                    "Parses CI logs to extract error messages",
                    "Identifies dependency version conflicts",
                    "Detects flaky tests and suggests fixes",
                    "Analyzes test coverage gaps",
                    "Proposes environment variable fixes",
                  ],
                },
                {
                  icon: TrendingUp,
                  title: "Safety-First Improvements",
                  capabilities: [
                    "Never modifies production workflows without approval",
                    "Validates changes in non-prod branches first",
                    "Rollback plan included in every PR",
                    "Monitors post-merge CI success rate",
                    "Alerts if changes cause regressions",
                  ],
                },
              ].map((capability, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                      <capability.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {capability.title}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {capability.capabilities.map((item, cIdx) => (
                      <li
                        key={cIdx}
                        className="text-slate-300 text-sm flex items-start gap-2"
                      >
                        <span className="text-cyan-400">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Real-World Examples */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">
              Real-World Impact Examples
            </h2>

            <div className="space-y-6">
              {[
                {
                  problem: "React app with 12-second initial load time",
                  diagnosis:
                    "Detected 450KB of unused dependencies, synchronous API calls blocking render, no code splitting",
                  fix: "Proposed dynamic imports, migrated to React.lazy, removed unused packages, implemented Suspense boundaries",
                  result:
                    "Initial load reduced to 3.2 seconds (73% improvement), Lighthouse score from 42 to 89",
                },
                {
                  problem: "GitHub Actions taking 18 minutes per build",
                  diagnosis:
                    "No Docker layer caching, sequential test execution, full node_modules install every run",
                  fix: "Added cache actions for npm, parallelized test suites, implemented BuildKit with layer caching",
                  result:
                    "Build time reduced to 7 minutes (61% faster), 40% reduction in GitHub Actions minutes usage",
                },
                {
                  problem: "Flaky tests failing 30% of CI runs",
                  diagnosis:
                    "Race conditions in async tests, hardcoded timeouts, shared test state pollution",
                  fix: "Introduced proper async/await patterns, increased timeouts dynamically, isolated test fixtures",
                  result:
                    'Test stability increased to 98%, team confidence restored, no more "merge anyway" culture',
                },
              ].map((example, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6"
                >
                  <div className="mb-4">
                    <span className="text-red-400 font-semibold text-sm">
                      ⚠️ Problem:
                    </span>
                    <p className="text-white mt-1">{example.problem}</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-yellow-400 font-semibold text-sm">
                      🔍 Diagnosis:
                    </span>
                    <p className="text-slate-300 text-sm mt-1">
                      {example.diagnosis}
                    </p>
                  </div>
                  <div className="mb-4">
                    <span className="text-blue-400 font-semibold text-sm">
                      🛠️ Fix:
                    </span>
                    <p className="text-slate-300 text-sm mt-1">{example.fix}</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <span className="text-green-400 font-semibold text-sm">
                      ✓ Result:
                    </span>
                    <p className="text-slate-300 text-sm mt-1">
                      {example.result}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Anti-Patterns */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-8">
              What PipexAI Does NOT Do
            </h2>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8">
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>
                    <strong>No magic metrics:</strong> We don't claim "10x
                    faster" without showing before/after CI logs
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>
                    <strong>No blind automation:</strong> High-risk changes
                    always require human review
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>
                    <strong>No framework lock-in:</strong> Works with React,
                    Next.js, Vue—not proprietary abstractions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>
                    <strong>No "replace engineers":</strong> This augments your
                    team, doesn't replace judgment
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>
                    <strong>No unproven AI models:</strong> Uses
                    production-tested LLMs with fallback strategies
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
