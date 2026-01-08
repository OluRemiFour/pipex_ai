import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  Cpu,
  Database,
  Eye,
  FileCode,
  GitBranch,
  Lock,
  MessageSquare,
  Search,
  Shield,
  Wrench,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-semibold mb-6">
              <Cpu className="w-4 h-4" />
              Production-Grade Architecture
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Multi-Agent AI System
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade autonomous DevOps platform designed for safety,
              scale, and human-in-the-loop control
            </p>
          </motion.div>

          {/* Key Principles */}
          <section className="mb-12 sm:mb-16 md:mb-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  icon: Shield,
                  title: "Safety First",
                  desc: "Never touches protected branches. Always requires human approval.",
                  color: "from-green-500 to-emerald-600",
                },
                {
                  icon: Brain,
                  title: "AI-Powered",
                  desc: "Multi-agent system with specialized roles and responsibilities.",
                  color: "from-cyan-500 to-blue-600",
                },
                {
                  icon: Zap,
                  title: "Production Ready",
                  desc: "Battle-tested architecture built for real engineering teams.",
                  color: "from-purple-500 to-pink-600",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${item.color
                        .split(" ")
                        .join(", ")})`,
                    }}
                  />
                  <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}
                    >
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Multi-Agent Architecture */}
          <section className="mb-12 sm:mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Specialized AI Agents
              </h2>
              <p className="text-xl text-slate-400">
                Each agent has a specific role, clear boundaries, and built-in
                safety
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  icon: Search,
                  name: "Analyzer Agent",
                  color: "from-cyan-500 to-blue-600",
                  purpose: "Repository analysis and issue detection",
                  trigger: "Scheduled scans, webhook events, manual triggers",
                  capabilities: [
                    "Code pattern detection",
                    "CI/CD log analysis",
                    "Performance profiling",
                    "Security scanning",
                  ],
                  guardrails:
                    "Read-only access • Rate-limited API calls • 5-minute timeout",
                },
                {
                  icon: Wrench,
                  name: "Fixer Agent",
                  color: "from-emerald-500 to-green-600",
                  purpose: "Generate code fixes and optimizations",
                  trigger: "Issues flagged with MEDIUM+ priority",
                  capabilities: [
                    "Context-aware fixes",
                    "Multi-language support",
                    "Test generation",
                    "Performance optimization",
                  ],
                  guardrails:
                    "Max 500 lines per PR • Must pass static analysis • No protected files",
                },
                {
                  icon: Eye,
                  name: "Reviewer Agent",
                  color: "from-purple-500 to-pink-600",
                  purpose: "Quality and safety validation",
                  trigger: "Before opening pull request",
                  capabilities: [
                    "Code quality check",
                    "Security validation",
                    "Pattern compliance",
                    "Risk scoring",
                  ],
                  guardrails:
                    "Blocks HIGH risk PRs • Requires approval for infra • Mandatory reviews",
                },
                {
                  icon: MessageSquare,
                  name: "Explainer Agent",
                  color: "from-orange-500 to-red-600",
                  purpose: "Human-readable documentation",
                  trigger: "After fix generation",
                  capabilities: [
                    "Change summaries",
                    "Impact analysis",
                    "Technical docs",
                    "Team notifications",
                  ],
                  guardrails:
                    "No sensitive data • Character limits • Clear language only",
                },
              ].map((agent, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative group"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity blur-2xl"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${agent.color
                        .split(" ")
                        .join(", ")})`,
                    }}
                  />
                  <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                      >
                        <agent.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {agent.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400 font-semibold text-sm">
                            Trigger
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm pl-6">
                          {agent.trigger}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold text-sm">
                            Capabilities
                          </span>
                        </div>
                        <ul className="space-y-1 pl-6">
                          {agent.capabilities.map((cap, i) => (
                            <li
                              key={i}
                              className="text-slate-300 text-sm flex items-center gap-2"
                            >
                              <span className="w-1 h-1 bg-green-400 rounded-full" />
                              {cap}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-400 font-semibold text-sm">
                            Safety Guardrails
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm pl-6">
                          {agent.guardrails}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Execution Flow */}
          <section className="mb-12 sm:mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                End-to-End Execution Flow
              </h2>
              <p className="text-xl text-slate-400">
                From repository ingestion to production deployment
              </p>
            </motion.div>

            <div className="relative">
              {/* Connection Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500 hidden md:block" />

              <div className="space-y-4 sm:space-y-6">
                {[
                  {
                    phase: "Repository Ingestion",
                    icon: GitBranch,
                    color: "from-cyan-500 to-blue-600",
                    steps: [
                      "User installs GitHub App and selects repositories",
                      "System clones metadata (file structure, configs)",
                      "Creates vector embeddings for semantic search",
                      "Indexes dependencies and CI/CD pipelines",
                    ],
                  },
                  {
                    phase: "Contextual Understanding",
                    icon: Brain,
                    color: "from-blue-500 to-purple-600",
                    steps: [
                      "Analyzer scans codebase patterns (React/Next.js)",
                      "Identifies CI/CD platform and configurations",
                      "Maps dependency tree and version conflicts",
                      "Builds knowledge graph of relationships",
                    ],
                  },
                  {
                    phase: "Issue Detection",
                    icon: AlertTriangle,
                    color: "from-purple-500 to-pink-600",
                    steps: [
                      "Pattern matching for anti-patterns",
                      "CI failure analysis from webhooks",
                      "Performance issue detection (bundle, renders)",
                      "Assigns risk score: LOW/MEDIUM/HIGH",
                    ],
                  },
                  {
                    phase: "Fix Generation & Review",
                    icon: Wrench,
                    color: "from-pink-500 to-red-600",
                    highlight: true,
                    steps: [
                      "Fixer proposes solution with full context",
                      "Reviewer validates safety and correctness",
                      "Static analysis and linting checks",
                      "🚨 HUMAN APPROVAL for MEDIUM+ risk",
                    ],
                  },
                  {
                    phase: "Pull Request Creation",
                    icon: FileCode,
                    color: "from-orange-500 to-amber-600",
                    steps: [
                      "Explainer generates detailed PR description",
                      "Creates branch: ai/fix-{issue-id}",
                      "Opens PR with risk assessment & tests",
                      "Team notification via Slack/email",
                    ],
                  },
                  {
                    phase: "Post-Merge Validation",
                    icon: CheckCircle,
                    color: "from-green-500 to-emerald-600",
                    steps: [
                      "Monitors CI for new failures",
                      "Tracks performance metrics",
                      "Updates knowledge base with patterns",
                      "Comprehensive audit logging",
                    ],
                  },
                ].map((flow, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    <div
                      className={`flex gap-6 items-start ${
                        flow.highlight ? "md:ml-4" : ""
                      }`}
                    >
                      {/* Icon Circle */}
                      <div
                        className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${
                          flow.color
                        } flex items-center justify-center flex-shrink-0 shadow-xl ${
                          flow.highlight ? "ring-4 ring-cyan-500/50" : ""
                        }`}
                      >
                        <flow.icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <div
                        className={`flex-1 bg-slate-800 border rounded-2xl p-6 ${
                          flow.highlight
                            ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className={`text-2xl font-bold bg-gradient-to-r ${flow.color} bg-clip-text text-transparent`}
                          >
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <h3 className="text-xl font-bold text-white">
                            {flow.phase}
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {flow.steps.map((step, stepIdx) => (
                            <li
                              key={stepIdx}
                              className="text-slate-300 flex items-start gap-3"
                            >
                              <span className="text-cyan-400 mt-1 font-bold">
                                →
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* AI Safety Model */}
          <section className="mb-12 sm:mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center mb-8 sm:mb-12"
            >
              <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  AI Safety & Trust Model
                </h2>
              </div>
              <p className="text-xl text-slate-400">
                Explicit boundaries and transparency for production use
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <h3 className="text-2xl font-bold text-green-400">
                    AI CAN DO
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Read repository contents (code, configs, docs)",
                    "Analyze CI/CD logs and build artifacts",
                    "Create branches with 'ai/' prefix",
                    "Open pull requests (never auto-merge)",
                    "Comment on PRs with suggestions",
                    "Run read-only static analysis",
                    "Generate performance reports",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 text-slate-300"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                  <h3 className="text-2xl font-bold text-red-400">
                    AI CANNOT DO
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Push to main/master/production branches",
                    "Merge pull requests automatically",
                    "Modify .git directory or CI secrets",
                    "Access private environment variables",
                    "Delete branches, tags, or releases",
                    "Change GitHub App permissions",
                    "Execute arbitrary code in production",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 text-slate-300"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Security Policies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  icon: Shield,
                  title: "Branch Protection",
                  desc: "Respects repository rules. Cannot override required reviews.",
                  color: "text-cyan-400",
                },
                {
                  icon: Lock,
                  title: "Secrets Handling",
                  desc: "Never accesses or logs secrets. Uses GitHub secret scanning API.",
                  color: "text-purple-400",
                },
                {
                  icon: FileCode,
                  title: "Audit Logging",
                  desc: "Every action logged with timestamp, agent, and approval state.",
                  color: "text-green-400",
                },
                {
                  icon: Zap,
                  title: "Rate Limiting",
                  desc: "Max 10 PRs/day per repo. Max 100 API calls/hour.",
                  color: "text-amber-400",
                },
              ].map((policy, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <policy.icon
                      className={`w-8 h-8 ${policy.color} flex-shrink-0`}
                    />
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">
                        {policy.title}
                      </h4>
                      <p className="text-slate-400 text-sm">{policy.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* System Architecture */}
          {/* <section className="mb-12 sm:mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                System Architecture
              </h2>
              <p className="text-xl text-slate-400">
                Production-grade infrastructure built for scale
              </p>
            </motion.div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 overflow-x-auto">
              <pre className="text-slate-300 text-xs md:text-sm font-mono leading-relaxed">{`
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                        │
│   ┌─────────────┐   ┌─────────────┐   ┌──────────────────────┐    │
│   │  Dashboard  │   │  GitHub App │   │  Slack/Email Alerts  │    │
│   └──────┬──────┘   └──────┬──────┘   └──────────┬───────────┘    │
└──────────┼───────────────────┼───────────────────────┼──────────────┘
           │                   │                       │
           ▼                   ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (FastAPI)                         │
│   Authentication  │  Rate Limiting  │  Routing  │  Webhooks         │
└──────────┬──────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATION ENGINE                            │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐      │
│   │  Task Queue  │   │ Agent Router │   │ Safety Enforcer  │      │
│   │   (Celery)   │   │ (LangGraph)  │   │ (Policy Engine)  │      │
│   └──────────────┘   └──────────────┘   └──────────────────┘      │
└──────────┬──────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AI AGENT LAYER                               │
│   ┌─────────┐   ┌────────┐   ┌─────────┐   ┌──────────────┐      │
│   │Analyzer │ → │ Fixer  │ → │Reviewer │ → │  Explainer   │      │
│   │  Agent  │   │ Agent  │   │  Agent  │   │    Agent     │      │
│   └─────────┘   └────────┘   └─────────┘   └──────────────┘      │
│        ↓             ↓             ↓               ↓                │
│   [ LLM Provider: GPT-4, Claude, Gemini, or Local Models ]         │
└──────────┬──────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                  │
│   ┌────────────┐   ┌────────────┐   ┌────────────────────┐        │
│   │ PostgreSQL │   │ Vector DB  │   │   Redis (Cache)    │        │
│   │ (Metadata) │   │ (Pinecone) │   │  (Session/Queue)   │        │
│   └────────────┘   └────────────┘   └────────────────────┘        │
└──────────┬──────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                           │
│   ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌────────────┐     │
│   │ GitHub  │   │  GitLab  │   │  CI/CD   │   │   Slack    │     │
│   │   API   │   │   API    │   │ Providers│   │    API     │     │
│   └─────────┘   └──────────┘   └──────────┘   └────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  icon: Database,
                  title: "Data Storage",
                  color: "from-cyan-500 to-blue-600",
                  items: [
                    "PostgreSQL: User data, repo metadata, audit logs",
                    "Pinecone: Vector embeddings for semantic search",
                    "Redis: Task queue, rate limiting, caching",
                  ],
                },
                {
                  icon: GitBranch,
                  title: "Git Integration",
                  color: "from-purple-500 to-pink-600",
                  items: [
                    "GitHub App with minimal permissions",
                    "Webhook listeners for real-time events",
                    "GraphQL API for efficient queries",
                  ],
                },
                {
                  icon: Brain,
                  title: "AI Models",
                  color: "from-green-500 to-emerald-600",
                  items: [
                    "GPT-4 for complex reasoning",
                    "Claude for code generation",
                    "Gemini for multi-modal tasks",
                  ],
                },
              ].map((tech, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity blur-xl"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${tech.color
                        .split(" ")
                        .join(", ")})`,
                    }}
                  />
                  <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-4`}
                    >
                      <tech.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      {tech.title}
                    </h3>
                    <ul className="space-y-2">
                      {tech.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-slate-400 text-sm flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </section> */}

          {/* MVP Roadmap */}
          <section>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                MVP Roadmap
              </h2>
              <p className="text-xl text-slate-400">
                Phased approach from MVP to autonomous operations
              </p>
            </motion.div>

            <div className="space-y-4 sm:space-y-6">
              {[
                {
                  phase: "MVP (Ship First)",
                  color: "from-cyan-500 to-blue-600",
                  borderColor: "border-cyan-500",
                  status: "In Progress",
                  features: [
                    "GitHub App installation and repo connection",
                    "Basic Analyzer agent: detect React anti-patterns",
                    "Manual trigger for analysis (no automation yet)",
                    "Open PRs with fixes (require manual approval)",
                    "Dashboard showing detected issues and status",
                    "Email notifications for new PRs",
                  ],
                },
                {
                  phase: "Phase 2 (Scale & Intelligence)",
                  color: "from-blue-500 to-purple-600",
                  borderColor: "border-blue-500",
                  status: "Planned",
                  features: [
                    "Automated scheduling (daily/weekly scans)",
                    "CI/CD pipeline optimization (Docker, GitHub Actions)",
                    "Webhook-based real-time issue detection",
                    "Multi-repo support for organizations",
                    "Slack integration for team collaboration",
                    "Risk scoring and auto-approval for LOW risk changes",
                  ],
                },
                {
                  phase: "Phase 3 (Autonomous & Advanced)",
                  color: "from-purple-500 to-pink-600",
                  borderColor: "border-purple-500",
                  status: "Future",
                  features: [
                    "Self-improving agents (learn from merged PRs)",
                    "Predictive issue detection (before builds fail)",
                    "Custom rule engine for team-specific patterns",
                    "GitLab and Bitbucket support",
                    "Advanced analytics and ROI dashboard",
                    "Self-hosted deployment option",
                  ],
                },
              ].map((phase, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative"
                >
                  <div
                    className={`bg-slate-800 border-l-4 ${phase.borderColor} rounded-xl p-8 hover:shadow-xl transition-all`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-2xl font-bold bg-gradient-to-r ${phase.color} bg-clip-text text-transparent mb-2`}
                        >
                          {phase.phase}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 bg-gradient-to-r ${phase.color} bg-opacity-10 border ${phase.borderColor} rounded-full text-sm font-semibold`}
                        >
                          {phase.status}
                        </span>
                      </div>
                      <div className="text-5xl font-bold text-slate-700">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {phase.features.map((feature, fIdx) => (
                        <motion.li
                          key={fIdx}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.2 + fIdx * 0.05 }}
                          className="flex items-start gap-3 text-slate-300"
                        >
                          <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
