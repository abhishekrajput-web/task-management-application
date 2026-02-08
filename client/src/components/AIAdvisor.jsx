import { useDispatch, useSelector } from 'react-redux';
import { getAISuggestion, clearSuggestion } from '../features/ai/aiSlice';
import { Sparkles, RefreshCw, X } from 'lucide-react';

const AIAdvisor = () => {
  const dispatch = useDispatch();
  const { suggestion, isLoading } = useSelector((state) => state.ai);
  const { tasks } = useSelector((state) => state.tasks);

  const handleGetSuggestion = () => {
    dispatch(getAISuggestion());
  };

  const handleClear = () => {
    dispatch(clearSuggestion());
  };

  // Clean and format the suggestion text - removes * and **
  const formatSuggestion = (text) => {
    if (!text) return null;
    
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^#+\s*/gm, '')
      .trim();
    
    return cleanText.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        return <div key={index} className="h-2" />;
      }
      
      if (/^[🎯💡📊⚠️✅📝🎉💪🌱🔥⭐🚀📌💼🏆]/.test(trimmedLine)) {
        return (
          <p key={index} className="font-semibold text-slate-900 mt-3 first:mt-0">
            {trimmedLine}
          </p>
        );
      }
      
      if (/^[-•]\s/.test(trimmedLine) || /^\d+[.)]\s/.test(trimmedLine)) {
        const cleanLine = trimmedLine.replace(/^[-•]\s*/, '').replace(/^\d+[.)]\s*/, '');
        return (
          <p key={index} className="text-slate-600 ml-2 flex items-start gap-2 text-sm">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
            <span>{cleanLine}</span>
          </p>
        );
      }
      
      return (
        <p key={index} className="text-slate-600 text-sm">
          {trimmedLine}
        </p>
      );
    });
  };

  // Fixed: Check all possible data paths
  const getSuggestionText = () => {
    if (!suggestion) return null;
    
    // Direct suggestion string
    if (typeof suggestion === 'string') return suggestion;
    
    // suggestion.suggestion
    if (suggestion.suggestion) return suggestion.suggestion;
    
    // suggestion.data.suggestion
    if (suggestion.data?.suggestion) return suggestion.data.suggestion;
    
    // suggestion.data (if it's a string)
    if (typeof suggestion.data === 'string') return suggestion.data;
    
    // suggestion.message
    if (suggestion.message) return suggestion.message;
    
    return null;
  };

  const suggestionText = getSuggestionText();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">AI Productivity Coach</h3>
            <p className="text-xs text-slate-500">Get personalized suggestions</p>
          </div>
        </div>
        {suggestionText && (
          <button
            onClick={handleClear}
            className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!suggestionText ? (
        <div className="text-center py-4">
          <p className="text-sm text-slate-600 mb-4">
            {tasks.length === 0
              ? 'Add some tasks to get AI-powered productivity advice'
              : `Analyze your ${tasks.length} task${tasks.length > 1 ? 's' : ''} for personalized tips`}
          </p>
          <button
            onClick={handleGetSuggestion}
            disabled={isLoading || tasks.length === 0}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Get AI Suggestions
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="max-h-[280px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="pr-2">
              {formatSuggestion(suggestionText)}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400">
              Source: {suggestion?.source || 'AI'}
            </p>
            <button
              onClick={handleGetSuggestion}
              disabled={isLoading}
              className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;