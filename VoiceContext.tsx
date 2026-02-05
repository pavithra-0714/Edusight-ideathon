import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface VoiceContextType {
  speak: (text: string, options?: SpeakOptions) => Promise<void>;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  transcript: string;
  resetTranscript: () => void;
  voiceSupported: boolean;
  speechSupported: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  voiceSpeed: number;
  setVoiceSpeed: (speed: number) => void;
}

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

interface VoiceProviderProps {
  children: React.ReactNode;
}

// Language codes mapping
const languageMap: Record<string, string> = {
  english: 'en-US',
  tamil: 'ta-IN',
  hindi: 'hi-IN',
};

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ children }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('english');
  const [voiceSpeed, setVoiceSpeed] = useState(0.9);
  
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const voiceSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = languageMap[language] || 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const transcriptResult = event.results[current][0].transcript;
          setTranscript(transcriptResult);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.log('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageMap[language] || 'en-US';
    }
  }, [language]);

  const speak = useCallback(async (text: string, options?: SpeakOptions): Promise<void> => {
    return new Promise((resolve) => {
      if (!speechSynthesis) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageMap[language] || 'en-US';
      utterance.rate = options?.rate ?? voiceSpeed;
      utterance.pitch = options?.pitch ?? 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    });
  }, [speechSynthesis, language, voiceSpeed]);

  const stopSpeaking = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [speechSynthesis]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log('Recognition already started');
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        speak,
        stopSpeaking,
        isSpeaking,
        startListening,
        stopListening,
        isListening,
        transcript,
        resetTranscript,
        voiceSupported,
        speechSupported,
        language,
        setLanguage,
        voiceSpeed,
        setVoiceSpeed,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};
