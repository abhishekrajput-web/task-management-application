import { useDispatch } from 'react-redux';
import { improveTask, breakdownTask } from '../features/ai/aiSlice';

const badge = (priority) => {
  const base = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold';
  if (priority === 'High') return `${base} bg-red-50 text-red-700 border border-red-200`;
  if (priority === 'Medium') return `${base} bg-amber-50 text-amber-700 border border-amber-200`;
  return `${base} bg-emerald-50 text-emerald-700 border border-emerald-200`;
};

const TaskCard = ({ task }) => {
  const dispatch = useDispatch();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900">{task.title}</h3>
            <span className={badge(task.priority)}>{task.priority}</span>
            <span className="text-xs text-slate-500">{task.status}</span>
          </div>

          {task.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
          ) : null}

          {task.dueDate ? (
            <p className="mt-2 text-xs text-slate-500">
              Due: <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <button
            onClick={() => dispatch(improveTask(task._id))}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            title="AI Improve"
          >
            Improve
          </button>

          <button
            onClick={() => dispatch(breakdownTask(task._id))}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            title="AI Breakdown"
          >
            Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;