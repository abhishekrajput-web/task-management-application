import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

const VoiceInput = ({ onTranscript, onListeningChange, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        onListeningChange?.(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        onListeningChange?.(false);
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
          onTranscript?.(finalTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        onListeningChange?.(false);
        
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
  }, [onTranscript, onListeningChange]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        toast.success('🎤 Listening... Speak now!');
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  }, [recognition, isListening]);

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed ${className}`}
        title="Voice input not supported in this browser"
      >
        <MicOff className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border cursor-pointer transition-colors ${
        isListening
          ? 'border-red-300 bg-red-500 text-white animate-pulse'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
      } ${className}`}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      <Mic className="h-4 w-4" />
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </button>
);
};

export default VoiceInput;