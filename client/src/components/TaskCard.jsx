import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, deleteTask } from '../features/tasks/taskSlice';
import { improveTask, breakdownTask } from '../features/ai/aiSlice';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar, 
  Flag,
  Sparkles,
  ListTree,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const TaskCard = ({ task }) => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiType, setAiType] = useState(null); // 'improve' or 'breakdown'
  const [localLoading, setLocalLoading] = useState(false);

  const handleToggleStatus = () => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    dispatch(updateTask({ id: task._id, taskData: { status: newStatus } }));
    toast.success(newStatus === 'Completed' ? 'Task completed!' : 'Task marked as pending');
  };

  const handleDelete = () => {
    dispatch(deleteTask(task._id));
    toast.success('Task deleted');
  };

  const handleImprove = async () => {
    setLocalLoading(true);
    setAiType('improve');
    try {
      const result = await dispatch(improveTask(task._id)).unwrap();
      // Store the full result object for proper rendering
      setAiResult(result);
      setIsExpanded(true);
    } catch (error) {
      toast.error('Failed to improve task');
      console.error('Improve error:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleBreakdown = async () => {
    setLocalLoading(true);
    setAiType('breakdown');
    try {
      const result = await dispatch(breakdownTask(task._id)).unwrap();
      // Store the full result object for proper rendering
      setAiResult(result);
      setIsExpanded(true);
    } catch (error) {
      toast.error('Failed to breakdown task');
      console.error('Breakdown error:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClearAiResult = () => {
    setAiResult(null);
    setAiType(null);
    setIsExpanded(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status === 'Pending';

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      case 'Low':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Render AI Breakdown Result (subtasks array)
  const renderBreakdownResult = () => {
    const subtasks = aiResult?.data?.subtasks || aiResult?.subtasks || [];
    
    if (subtasks.length === 0) {
      // Fallback: if it's a suggestion string
      const suggestionText = aiResult?.suggestion || aiResult?.data?.suggestion;
      if (suggestionText) {
        return renderTextSuggestion(suggestionText);
      }
      return <p className="text-xs text-slate-500">No subtasks generated</p>;
    }

    const totalMinutes = subtasks.reduce((sum, s) => sum + (s.estimateMinutes || 0), 0);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-700">
            {subtasks.length} Subtasks
          </span>
          {totalMinutes > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {totalMinutes} min total
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          {subtasks.map((subtask, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2.5"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900">{subtask.title}</p>
                {subtask.estimateMinutes && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    ~{subtask.estimateMinutes} min
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render AI Improve Result (improvedTitle, suggestedPriority, etc.)
  const renderImproveResult = () => {
    const data = aiResult?.data || aiResult;
    
    // Check if we have structured improvement data
    if (data?.improvedTitle || data?.suggestedPriority || data?.timeEstimateMinutes) {
      return (
        <div className="space-y-3">
          {/* Improved Title */}
          {data.improvedTitle && (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Improved Title
              </p>
              <p className="text-sm font-medium text-slate-900">{data.improvedTitle}</p>
            </div>
          )}

          {/* Priority & Time Estimate */}
          <div className="grid grid-cols-2 gap-2">
            {data.suggestedPriority && (
              <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Priority
                </p>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getPriorityStyles(data.suggestedPriority)}`}>
                  {data.suggestedPriority}
                </span>
              </div>
            )}
            {data.timeEstimateMinutes && (
              <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Estimate
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                  <Clock className="h-3 w-3" />
                  {data.timeEstimateMinutes} min
                </span>
              </div>
            )}
          </div>

          {/* Reason */}
          {data.reason && (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Why
              </p>
              <p className="text-xs text-slate-600">{data.reason}</p>
            </div>
          )}

          {/* Suggested Due Date */}
          {data.suggestedDueDate && (
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Suggested Due Date
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                <Calendar className="h-3 w-3" />
                {data.suggestedDueDate}
              </span>
            </div>
          )}
        </div>
      );
    }

    // Fallback: if it's a suggestion string
    const suggestionText = aiResult?.suggestion || aiResult?.data?.suggestion || data?.suggestion;
    if (suggestionText) {
      return renderTextSuggestion(suggestionText);
    }

    return <p className="text-xs text-slate-500">No improvement data available</p>;
  };

  // Render plain text suggestion (removes * and **)
  const renderTextSuggestion = (text) => {
    if (!text) return null;
    
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^#+\s*/gm, '')
      .trim();
    
    return (
      <div className="space-y-1">
        {cleanText.split('\n').map((line, index) => {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') {
            return <div key={index} className="h-1" />;
          }
          
          if (/^[-•]\s/.test(trimmedLine) || /^\d+[.)]\s/.test(trimmedLine)) {
            const cleanLine = trimmedLine.replace(/^[-•]\s*/, '').replace(/^\d+[.)]\s*/, '');
            return (
              <p key={index} className="text-slate-600 ml-2 flex items-start gap-2 text-xs">
                <span className="mt-1 h-1 w-1 rounded-full bg-slate-400 flex-shrink-0" />
                <span>{cleanLine}</span>
              </p>
            );
          }
          
          return (
            <p key={index} className="text-slate-600 text-xs">
              {trimmedLine}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        task.status === 'Completed'
          ? 'border-slate-100 bg-slate-50'
          : isOverdue
          ? 'border-red-200 bg-red-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleStatus}
          className="mt-0.5 cursor-pointer text-slate-400 hover:text-emerald-600"
        >
          {task.status === 'Completed' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  task.status === 'Completed'
                    ? 'text-slate-400 line-through'
                    : 'text-slate-900'
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="mt-1 text-xs text-slate-500 truncate">{task.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleImprove}
                disabled={localLoading}
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
                title="AI Improve"
              >
                {localLoading && aiType === 'improve' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleBreakdown}
                disabled={localLoading}
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                title="AI Breakdown"
              >
                {localLoading && aiType === 'breakdown' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ListTree className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleDelete}
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${getPriorityStyles(
                task.priority
              )}`}
            >
              <Flag className="h-3 w-3" />
              {task.priority}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                isOverdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>

          {/* AI Result Section */}
          {aiResult && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                  aiType === 'improve' ? 'text-purple-700' : 'text-blue-700'
                }`}>
                  {aiType === 'improve' ? (
                    <>
                      <Sparkles className="h-3 w-3" />
                      AI Improvement
                    </>
                  ) : (
                    <>
                      <ListTree className="h-3 w-3" />
                      AI Breakdown
                    </>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    onClick={handleClearAiResult}
                    className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              {isExpanded && (
                <div className="max-h-[200px] overflow-y-auto pr-1">
                  {aiType === 'breakdown' ? renderBreakdownResult() : renderImproveResult()}
                </div>
              )}

              {/* Source */}
              {aiResult?.source && (
                <p className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-400">
                  Source: {aiResult.source}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;