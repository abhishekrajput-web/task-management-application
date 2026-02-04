import { useDispatch, useSelector } from 'react-redux';
import { getAISuggestion, clearSuggestion } from '../features/ai/aiSlice';

const AIAdvisor = () => {
  const dispatch = useDispatch();
  const { suggestion, isLoading } = useSelector((state) => state.ai);
  const { tasks } = useSelector((state) => state.tasks);

  const handleGetSuggestion = () => dispatch(getAISuggestion());
  const handleClear = () => dispatch(clearSuggestion());

  const renderBody = () => {
    if (!suggestion) return null;

    // breakdown JSON
    if (suggestion?.data?.subtasks?.length) {
      return (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-900">Task breakdown</div>
          <ul className="space-y-2">
            {suggestion.data.subtasks.map((s, idx) => (
              <li
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="text-sm font-medium text-slate-900">{s.title}</div>
                {s.estimateMinutes ? (
                  <div className="text-xs text-slate-500">{s.estimateMinutes} min</div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // improve JSON
    if (suggestion?.data?.improvedTitle) {
      const d = suggestion.data;
      return (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-900">Task improvement</div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Improved title
            </div>
            <div className="mt-1 text-sm font-medium text-slate-900">{d.improvedTitle}</div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Suggested priority
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {d.suggestedPriority}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estimate
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {d.timeEstimateMinutes} min
                </div>
              </div>
            </div>

            {d.reason ? (
              <>
                <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason
                </div>
                <div className="mt-1 text-sm text-slate-700">{d.reason}</div>
              </>
            ) : null}
          </div>
        </div>
      );
    }

    // plain text
    return (
      <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">
        {suggestion?.suggestion || JSON.stringify(suggestion, null, 2)}
      </pre>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">AI Advisor</div>
          <div className="mt-1 text-xs text-slate-500">
            Uses your tasks to suggest next action, improve tasks, and break down big tasks
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Tasks: <span className="font-semibold text-slate-700">{tasks?.length ?? 0}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleGetSuggestion}
          disabled={isLoading}
          className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? 'Generating…' : 'Get Suggestion'}
        </button>

        <button
          onClick={handleClear}
          disabled={!suggestion}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {suggestion ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Result
            </div>
            <div className="text-xs text-slate-500">
              Source: <span className="font-medium text-slate-700">{suggestion.source}</span>
            </div>
          </div>

          {renderBody()}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Click <span className="font-semibold">Get Suggestion</span> to see AI output here.
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;