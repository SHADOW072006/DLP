import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, User, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@IntelliDLP2026!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (userType, pass) => {
    setUsername(userType);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20 border border-cyan-400/30">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            Intelli<span className="text-cyan-400">DLP</span> Central Command
          </h1>
          <p className="text-xs text-slate-400">
            Endpoint Data Loss Prevention & Zero-Trust Policy Management
          </p>
        </div>

        {/* Main Card */}
        <div className="p-7 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-sm space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Role Switcher for Testing/Demo */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Role Sign-In
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Admin@IntelliDLP2026!')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-center transition"
              >
                <span className="block text-xs font-bold text-cyan-400">Admin</span>
                <span className="block text-[10px] text-slate-500 truncate">ROLE_ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('analyst', 'Analyst@IntelliDLP2026!')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-center transition"
              >
                <span className="block text-xs font-bold text-amber-400">Analyst</span>
                <span className="block text-[10px] text-slate-500 truncate">ROLE_ANALYST</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('user', 'User@IntelliDLP2026!')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-center transition"
              >
                <span className="block text-xs font-bold text-slate-300">User</span>
                <span className="block text-[10px] text-slate-500 truncate">ROLE_USER</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-[11px] text-center text-slate-500">
          All sign-in attempts are hashed with BCrypt and recorded in the immutable audit log.
        </p>
      </div>
    </div>
  );
}

