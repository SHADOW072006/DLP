import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <ShieldAlert className="h-10 w-10 text-cyan-400 animate-pulse mb-3" />
        <span className="text-sm font-mono tracking-wider">VERIFYING SECURITY CREDENTIALS...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !user?.roles?.includes(requiredRole) && !user?.roles?.includes('ROLE_ADMIN')) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 rounded-xl bg-slate-900 border border-rose-500/30 text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Denied (403 Forbidden)</h2>
        <p className="text-xs text-slate-400">
          Your account role <code className="text-rose-300 font-mono">[{user?.roles?.join(', ')}]</code> is not authorized to access this administrative module. Contact your security administrator.
        </p>
      </div>
    );
  }

  return children;
}

