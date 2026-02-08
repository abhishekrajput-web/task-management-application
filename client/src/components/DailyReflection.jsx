import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDailyReflection, clearDailyReflection } from '../features/ai/aiSlice';
import { BookOpen, Star, X, Sparkles } from 'lucide-react';

const DailyReflection = () => {
  const dispatch = useDispatch();
  const { dailyReflection, isLoading } = useSelector((state) => state.ai);
  const [formData, setFormData] = useState({
    accomplishments: '',
    blockers: '',
    rating: 3,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(getDailyReflection(formData));
  };

  const handleClear = () => {
    dispatch(clearDailyReflection());
    setFormData({ accomplishments: '', blockers: '', rating: 3 });
  };

  // Clean and format the reflection text - removes * and **
  const formatReflection = (text) => {
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
      
      if (/^[🎯💡📊⚠️✅📝🎉💪🌱🔥⭐🚀📌💼🏆🌟💭🙌]/.test(trimmedLine)) {
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

  const reflectionText = dailyReflection?.reflection || dailyReflection?.data?.reflection;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Daily Reflection</h3>
            <p className="text-xs text-slate-500">End your day with insights</p>
          </div>
        </div>
        {reflectionText && (
          <button
            onClick={handleClear}
            className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!reflectionText ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700">What did you accomplish today?</label>
            <textarea
              value={formData.accomplishments}
              onChange={(e) => setFormData({ ...formData, accomplishments: e.target.value })}
              placeholder="I finished the report, had a good meeting..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none placeholder:text-slate-400"
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Any blockers or challenges?</label>
            <textarea
              value={formData.blockers}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
              placeholder="Too many meetings, internet issues..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none placeholder:text-slate-400"
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Rate your productivity</label>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="cursor-pointer p-1"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= formData.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.accomplishments.trim()}
            className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? 'Generating...' : 'Get My Reflection'}
          </button>
        </form>
      ) : (
        /* Fixed: Removed ScrollArea, using simple div with max-height and overflow */
        <div className="max-h-[280px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="pr-2">
            {formatReflection(reflectionText)}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReflection;