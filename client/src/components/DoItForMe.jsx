import { useDispatch, useSelector } from 'react-redux';
import { doItForMe, clearDoItForMe } from '../features/ai/aiSlice';
import { Wand2, X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const DoItForMe = ({ taskId, taskTitle, onClose }) => {
  const dispatch = useDispatch();
  const { doItForMeResult, isLoading } = useSelector((state) => state.ai);
  const [copied, setCopied] = useState(false);

  const handleDoIt = () => {
    dispatch(doItForMe(taskId));
  };

  const handleCopy = () => {
    const content = doItForMeResult?.data?.generatedContent;
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    dispatch(clearDoItForMe());
    onClose?.();
  };

  const data = doItForMeResult?.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50">
              <Wand2 className="h-5 w-5 text-blue-600" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">AI Do It For Me</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{taskTitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!data ? (
          <div className="text-center py-8">
            <p className="mb-4 text-sm text-slate-600">
              AI will generate content to help complete this task
            </p>
            <button
              onClick={handleDoIt}
              disabled={isLoading}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Wand2 className="h-4 w-4" />
              {isLoading ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Task Type Badge */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 capitalize">
                {data.taskType}
              </span>
              <span className="text-xs text-slate-500">{data.summary}</span>
            </div>

            {/* Generated Content */}
            <div className="relative">
              <div className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                  {data.generatedContent}
                </pre>
              </div>
              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* Next Steps */}
            {data.nextSteps?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Next Steps
                </p>
                <ul className="space-y-1">
                  {data.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                onClick={handleClose}
                className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoItForMe;