import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { parseBrainDump, clearBrainDump } from '../features/ai/aiSlice';
import { createTask } from '../features/tasks/taskSlice';
import { Brain, Sparkles, Plus, X, Check, Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

const BrainDump = () => {
  const dispatch = useDispatch();
  const { brainDumpResult, isLoading, isError, message } = useSelector((state) => state.ai);
  const [text, setText] = useState('');
  const [addedTasks, setAddedTasks] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsVoiceSupported(false);
        return;
      }

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setText((prev) => {
            const newText = prev ? `${prev}, ${finalTranscript}` : finalTranscript;
            return newText;
          });
          toast.success('Voice input added!');
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error(`Voice error: ${event.error}`);
        }
      };

      setRecognition(recognitionInstance);

      return () => {
        recognitionInstance.abort();
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        toast.success('🎤 Listening... Speak your tasks!');
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  };

  const handleParse = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text first');
      return;
    }
    dispatch(parseBrainDump(text));
  };

  const handleAddTask = (task, idx) => {
    dispatch(createTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'Medium',
      dueDate: task.suggestedDueDate || new Date().toISOString().split('T')[0],
    }));
    setAddedTasks((prev) => [...prev, idx]);
    toast.success(`Added: ${task.title}`);
  };

  const handleAddAll = () => {
    const tasks = brainDumpResult?.data?.tasks || [];
    tasks.forEach((task, idx) => {
      if (!addedTasks.includes(idx)) {
        dispatch(createTask({
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'Medium',
          dueDate: task.suggestedDueDate || new Date().toISOString().split('T')[0],
        }));
      }
    });
    setAddedTasks(tasks.map((_, idx) => idx));
    toast.success('All tasks added!');
  };

  const handleClear = () => {
    dispatch(clearBrainDump());
    setText('');
    setAddedTasks([]);
  };

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  useEffect(() => {
    if (brainDumpResult?.suggestion && !brainDumpResult?.data) {
      toast.error('AI could not extract tasks. Try rephrasing.');
    }
  }, [brainDumpResult]);

  const parsedTasks = brainDumpResult?.data?.tasks || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-purple-50">
            <Brain className="h-5 w-5 text-purple-600" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">AI Brain Dump</h3>
            <p className="text-xs text-slate-500">Type or speak your thoughts, AI extracts tasks</p>
          </div>
        </div>
        {(parsedTasks.length > 0 || text) && (
          <button
            onClick={handleClear}
            className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Voice Listening Indicator */}
      {isListening && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <p className="text-sm text-red-700">
            Listening... Speak your tasks (e.g., "Call mom tomorrow, buy groceries, finish report by Friday")
          </p>
        </div>
      )}

      {parsedTasks.length === 0 ? (
        <>
          {/* Text Input Area */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your thoughts here... e.g., 'Call mom tomorrow, finish report by Friday, buy groceries, dentist next week, URGENT: submit tax forms'"
              className="w-full h-28 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Voice and Extract Buttons */}
          <div className="mt-3 flex gap-2">
            {/* Voice Input Button */}
            {isVoiceSupported ? (
              <button
                type="button"
                onClick={toggleListening}
                className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  isListening
                    ? 'border-red-300 bg-red-500 text-white animate-pulse'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Mic className="h-4 w-4" />
                {isListening ? 'Stop' : 'Voice'}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400"
                title="Voice input not supported in this browser"
              >
                <MicOff className="h-4 w-4" />
                Voice
              </button>
            )}

            {/* Extract Tasks Button */}
            <button
              onClick={handleParse}
              disabled={isLoading || !text.trim()}
              className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isLoading ? 'Extracting Tasks...' : 'Extract Tasks with AI'}
            </button>
          </div>

          {/* AI Error/Suggestion Message */}
          {brainDumpResult?.suggestion && !brainDumpResult?.data && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-700">AI Response:</p>
              <p className="mt-1 text-sm text-amber-800">{brainDumpResult.suggestion}</p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Found {parsedTasks.length} task{parsedTasks.length > 1 ? 's' : ''}
            </p>
            <button
              onClick={handleAddAll}
              disabled={addedTasks.length === parsedTasks.length}
              className="cursor-pointer text-xs font-semibold text-purple-600 hover:text-purple-700 disabled:opacity-50"
            >
              Add All
            </button>
          </div>

          <div className="max-h-64 space-y-2 overflow-auto">
            {parsedTasks.map((task, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  addedTasks.includes(idx)
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {task.priority}
                    </span>
                    {task.suggestedDueDate && (
                      <span className="text-xs text-slate-500">{task.suggestedDueDate}</span>
                    )}
                    {task.estimateMinutes && (
                      <span className="text-xs text-slate-500">~{task.estimateMinutes}min</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAddTask(task, idx)}
                  disabled={addedTasks.includes(idx)}
                  className={`ml-3 cursor-pointer rounded-lg border p-2 ${
                    addedTasks.includes(idx)
                      ? 'border-emerald-300 bg-emerald-100 text-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {addedTasks.includes(idx) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainDump;