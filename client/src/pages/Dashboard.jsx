import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import TaskForm from '../components/TaskForm.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskFilters from '../components/TaskFilters.jsx';
import AIAdvisor from '../components/AIAdvisor.jsx';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { tasks, isLoading, filters } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const overdue = tasks.filter(
      (t) => new Date(t.dueDate) < new Date() && t.status === 'Pending'
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, completionRate };
  }, [tasks]);

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {user?.name ? `Hi, ${user.name}` : 'Dashboard'}
            </h1>
            <p className="text-sm text-slate-600">
              Keep priorities clear, reduce context switching, and ship work calmly.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <TaskForm />
            <TaskFilters />

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Tasks</h2>
                <p className="text-sm text-slate-500">{tasks.length} total</p>
              </div>

              {isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                    <p className="text-sm text-slate-600">Loading tasks…</p>
                  </div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                  <p className="text-sm font-semibold text-slate-900">No tasks yet</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {filters.status || filters.priority || filters.search
                      ? 'Try clearing filters to see all tasks.'
                      : 'Create your first task to get started.'}
                  </p>
                </div>
              ) : (
                <div className="max-h-[60vh] space-y-3 overflow-auto pr-2">
                  {tasks.map((task) => (
                    <TaskCard key={task._id} task={task} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Overview</p>
                  <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                    {stats.completionRate}% complete
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-semibold">Total</p>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold">Completed</p>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {stats.completed}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <p className="text-xs font-semibold">Pending</p>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.pending}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-xs font-semibold">Overdue</p>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.overdue}</p>
                  </div>
                </div>
              </div>

              <AIAdvisor />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;