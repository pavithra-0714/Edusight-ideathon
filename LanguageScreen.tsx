import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SpeakingIndicator } from '@/components/SpeakingIndicator';
import { AccessibilityActions } from '@/components/AccessibilityActions';
import { useVoice } from '@/contexts/VoiceContext';
import { useApp } from '@/contexts/AppContext';
import { Globe } from 'lucide-react';

const languages = [
  { id: 'english', name: 'English', nativeName: 'English' },
  { id: 'tamil', name: 'Tamil', nativeName: 'தமிழ்' },
  { id: 'hindi', name: 'Hindi', nativeName: 'हिन्दी' },
];

export const LanguageScreen: React.FC = () => {
  const navigate = useNavigate();
  const { speak, isSpeaking, stopSpeaking, startListening, isListening, transcript, setLanguage } = useVoice();
  const { updatePreferences } = useApp();
  const [showButtons, setShowButtons] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [listenAttempts, setListenAttempts] = useState(0);

  // Speak the language options on mount
  useEffect(() => {
    const speakLanguages = async () => {
      await speak('Please choose your preferred language.');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      for (const lang of languages) {
        await speak(lang.name);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setHasSpoken(true);
      startListening();
    };

    const timer = setTimeout(speakLanguages, 500);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  // Handle voice response
  useEffect(() => {
    if (transcript && hasSpoken) {
      const lowerTranscript = transcript.toLowerCase();
      
      for (const lang of languages) {
        if (lowerTranscript.includes(lang.id) || lowerTranscript.includes(lang.name.toLowerCase())) {
          selectLanguage(lang.id);
          return;
        }
      }
    }
  }, [transcript, hasSpoken]);

  // Handle listening timeout
  useEffect(() => {
    if (hasSpoken && !isListening && listenAttempts < 2) {
      const timer = setTimeout(() => {
        if (!isListening && listenAttempts < 1) {
          speak('Please say your preferred language, such as English, Tamil, or Hindi.').then(() => {
            setListenAttempts(prev => prev + 1);
            startListening();
          });
        } else {
          setShowButtons(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isListening, hasSpoken, listenAttempts]);

  const selectLanguage = async (langId: string) => {
    stopSpeaking();
    setLanguage(langId);
    updatePreferences({ language: langId });
    
    const langName = languages.find(l => l.id === langId)?.name || langId;
    await speak(`You selected ${langName}. Let's continue.`);
    navigate('/terms');
  };

  const handleSkip = () => {
    selectLanguage('english');
  };

  const handleTypeMode = () => {
    setShowButtons(true);
    stopSpeaking();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background safe-area p-6">
      <div className="animate-fade-in flex flex-col items-center gap-8 max-w-md w-full">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <Globe size={40} className="text-accent" />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-accessible-lg font-bold text-foreground">
            Choose Your Language
          </h1>
          <p className="text-accessible-sm text-muted-foreground">
            Select the language for all text and voice guidance
          </p>
        </div>

        {isSpeaking && (
          <div className="flex items-center gap-3">
            <SpeakingIndicator />
            <span className="text-muted-foreground">Speaking...</span>
          </div>
        )}

        {isListening && (
          <div className="flex items-center gap-3 text-accent">
            <div className="w-4 h-4 rounded-full bg-accent animate-pulse" />
            <span>Listening for your response...</span>
          </div>
        )}

        {transcript && (
          <p className="text-muted-foreground text-center">
            Heard: "{transcript}"
          </p>
        )}

        {/* Language buttons - always visible but highlighted when showButtons is true */}
        <div className="flex flex-col gap-4 w-full">
          {languages.map((lang) => (
            <Button
              key={lang.id}
              onClick={() => selectLanguage(lang.id)}
              variant={showButtons ? 'default' : 'outline'}
              size="lg"
              className="min-h-touch text-lg justify-between px-6"
            >
              <span>{lang.name}</span>
              <span className="text-muted-foreground">{lang.nativeName}</span>
            </Button>
          ))}
        </div>

        <AccessibilityActions
          onSkip={handleSkip}
          onTypeMode={handleTypeMode}
          showTypeMode={!showButtons}
        />
      </div>
    </div>
  );
};
