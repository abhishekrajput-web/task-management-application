import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, reset } from '../features/auth/authSlice.js';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess || user) navigate('/dashboard');
    return () => dispatch(reset());
  }, [user, isSuccess, navigate, dispatch]);

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-stretch gap-0 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div className="flex items-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Welcome back</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Sign in</h1>
              <p className="mt-2 text-sm text-slate-600">
                Access your tasks, deadlines, and AI productivity insights.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-900">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-900">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-sm text-slate-600">
                Don’t have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(15,23,42,0.10),transparent_55%)]" />
            <div className="relative flex h-full flex-col justify-between p-10">
              <div>
                <p className="text-sm font-semibold text-slate-900">Notion-like clarity</p>
                <p className="mt-2 text-sm text-slate-600">
                  Clean structure, clear priorities, calm focus. Your tasks—organized and actionable.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Today</p>
                    <p className="mt-1 text-xs text-slate-500">Plan → Execute → Review</p>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">AI</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded border border-slate-300 bg-white" />
                    <p className="text-sm text-slate-700">Complete the highest priority task</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded bg-slate-900" />
                    <p className="text-sm text-slate-700 line-through">Review schedule for tomorrow</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Tip: keep fewer “High priority” tasks. Make urgency meaningful.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;