import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters, getTasks } from '../features/tasks/taskSlice.js';
import { X, SlidersHorizontal } from 'lucide-react';

const TaskFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.tasks);

  const handleFilterChange = (filterType, value) =>
    dispatch(setFilters({ [filterType]: value }));

  const handleClearFilters = () => dispatch(clearFilters());

  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.search);


  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(getTasks());
    }, 300);

    return () => clearTimeout(t);
  }, [dispatch, filters.status, filters.priority, filters.sortBy, filters.search]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <SlidersHorizontal className="h-4 w-4 text-slate-700" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Filters</p>
            <p className="text-xs text-slate-500">Refine and sort your list</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search
          </label>
          <input
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search title or description…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="cursor-pointer w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="cursor-pointer w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sort
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="cursor-pointer w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="createdAt">Newest</option>
            <option value="dueDate">Due date</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;