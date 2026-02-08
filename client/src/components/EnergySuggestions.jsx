import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEnergySuggestions, clearEnergySuggestions } from '../features/ai/aiSlice';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, X, RefreshCw, Clock, AlertTriangle, Sparkles } from 'lucide-react';

const EnergySuggestions = () => {
  const dispatch = useDispatch();
  const { energySuggestions, isLoading } = useSelector((state) => state.ai);
  const { tasks } = useSelector((state) => state.tasks);
  const [selectedEnergy, setSelectedEnergy] = useState(null);

  const energyLevels = [
    { level: 'Low', icon: BatteryLow, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    { level: 'Medium', icon: BatteryMedium, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    { level: 'High', icon: BatteryFull, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ];

  const handleEnergySelect = (level) => {
    setSelectedEnergy(level);
    dispatch(getEnergySuggestions(level));
  };

  const handleClear = () => {
    dispatch(clearEnergySuggestions());
    setSelectedEnergy(null);
  };

  // Check if we have structured data (recommendedTasks, energyTip, avoidTasks)
  const getStructuredData = () => {
    if (!energySuggestions) return null;
    
    const data = energySuggestions.data || energySuggestions;
    
    // Check if it has recommendedTasks or energyTip (structured format)
    if (data?.recommendedTasks || data?.energyTip || data?.avoidTasks) {
      return data;
    }
    
    return null;
  };

  // Extract suggestion text for plain text responses
  const getSuggestionText = () => {
    if (!energySuggestions) return null;
    
    // If structured data exists, don't return text
    if (getStructuredData()) return null;
    
    // Direct string
    if (typeof energySuggestions === 'string') return energySuggestions;
    
    // energySuggestions.suggestion
    if (energySuggestions.suggestion) return energySuggestions.suggestion;
    
    // energySuggestions.data.suggestion
    if (energySuggestions.data?.suggestion) return energySuggestions.data.suggestion;
    
    // energySuggestions.data (if it's a string)
    if (typeof energySuggestions.data === 'string') return energySuggestions.data;
    
    // energySuggestions.message
    if (energySuggestions.message) return energySuggestions.message;

    // energySuggestions.data.message
    if (energySuggestions.data?.message) return energySuggestions.data.message;
    
    return null;
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
      
      if (/^[🎯💡📊⚠️✅📝🎉💪🌱🔥⭐🚀📌💼🏆😴🧘‍♂️☕]/.test(trimmedLine)) {
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

  // Render structured data (recommendedTasks, energyTip, avoidTasks)
  const renderStructuredData = (data) => {
    return (
      <div className="space-y-3">
        {/* Energy Tip */}
        {data.energyTip && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">{data.energyTip}</p>
            </div>
          </div>
        )}

        {/* Recommended Tasks */}
        {data.recommendedTasks && data.recommendedTasks.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recommended for you ({data.recommendedTasks.length})
            </p>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {data.recommendedTasks.map((task, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  {task.reason && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{task.reason}</p>
                  )}
                  {task.estimatedFocus && (
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>~{task.estimatedFocus} min focus</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks to Avoid */}
        {data.avoidTasks && data.avoidTasks.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Avoid right now
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.avoidTasks.map((title, idx) => (
                <span key={idx} className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-700">
                  {title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const structuredData = getStructuredData();
  const suggestionText = getSuggestionText();
  const hasData = structuredData || suggestionText;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50">
            <Battery className="h-5 w-5 text-amber-600" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Energy-Based Tasks</h3>
            <p className="text-xs text-slate-500">Get tasks matching your energy</p>
          </div>
        </div>
        {hasData && (
          <button
            onClick={handleClear}
            className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!hasData ? (
        <>
          <p className="text-sm text-slate-600 mb-3">How's your energy right now?</p>
          <div className="grid grid-cols-3 gap-2">
            {energyLevels.map(({ level, icon: Icon, color, bg, border }) => (
              <button
                key={level}
                onClick={() => handleEnergySelect(level)}
                disabled={isLoading || tasks.length === 0}
                className={`cursor-pointer flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors hover:bg-slate-50 disabled:opacity-50 ${
                  isLoading && selectedEnergy === level ? `${bg} ${border}` : 'border-slate-200'
                }`}
              >
                {isLoading && selectedEnergy === level ? (
                  <RefreshCw className={`h-5 w-5 ${color} animate-spin`} />
                ) : (
                  <Icon className={`h-5 w-5 ${color}`} />
                )}
                <span className="text-xs font-medium text-slate-700">{level}</span>
              </button>
            ))}
          </div>
          {tasks.length === 0 && (
            <p className="mt-3 text-xs text-slate-400 text-center">Add tasks first to get suggestions</p>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              selectedEnergy === 'Low' ? 'bg-red-100 text-red-700' :
              selectedEnergy === 'Medium' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {selectedEnergy || energySuggestions?.energyLevel} Energy
            </span>
          </div>
          
          {/* Render structured data or plain text */}
          {structuredData ? (
            <div className="max-h-[320px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3">
              {renderStructuredData(structuredData)}
            </div>
          ) : suggestionText ? (
            <div className="max-h-[220px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="pr-2">
                {formatSuggestion(suggestionText)}
              </div>
            </div>
          ) : null}

          {/* Source */}
          {energySuggestions?.source && (
            <p className="text-xs text-slate-400">
              Source: {energySuggestions.source}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EnergySuggestions;