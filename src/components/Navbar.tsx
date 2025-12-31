/* eslint-disable react-hooks/set-state-in-effect */
import {
  ChevronDown,
  Github,
  LayoutDashboard,
  LogOut,
  Menu,
  Terminal,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { lumi } from "../lib/lumi";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsAuthenticated(lumi.auth.isAuthenticated);
    setUser(lumi.auth.user);

    const unsubscribe = lumi.auth.onAuthChange(({ isAuthenticated, user }) => {
      setIsAuthenticated(isAuthenticated);
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const handleAuth = async () => {
    if (isAuthenticated) {
      lumi.auth.signOut();
      setShowUserMenu(false);
    } else {
      await lumi.auth.signIn();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DevOpsAI</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-slate-300 hover:text-cyan-400"
          >
            {showMobileMenu ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/architecture"
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Architecture
            </Link>
            <Link
              to="/features"
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Features
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">
                      {user?.email || user?.userName || "User"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-700">
                        <p className="text-sm text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">
                          {user?.email || user?.userName}
                        </p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleAuth}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-red-400 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={handleAuth}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50 text-white rounded-lg transition-all"
              >
                <Github className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-800 pt-4">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-slate-300 hover:text-cyan-400 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link
                to="/architecture"
                className="text-slate-300 hover:text-cyan-400 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Architecture
              </Link>
              <Link
                to="/features"
                className="text-slate-300 hover:text-cyan-400 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Features
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-cyan-400 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  handleAuth();
                  setShowMobileMenu(false);
                }}
                className="text-left text-slate-300 hover:text-cyan-400 transition-colors"
              >
                {isAuthenticated ? "Sign Out" : "Sign In"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
