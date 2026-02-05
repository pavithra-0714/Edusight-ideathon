import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BackButton } from '@/components/BackButton';
import { SpeakingIndicator } from '@/components/SpeakingIndicator';
import { AccessibilityActions } from '@/components/AccessibilityActions';
import { useVoice } from '@/contexts/VoiceContext';
import { useApp } from '@/contexts/AppContext';
import { User, ArrowRight } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { speak, isSpeaking, stopSpeaking, startListening, isListening, transcript, resetTranscript } = useVoice();
  const { updatePreferences } = useApp();
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');
  const [hasAsked, setHasAsked] = useState(false);
  const [listenAttempts, setListenAttempts] = useState(0);

  useEffect(() => {
    const welcome = async () => {
      await speak('Welcome to EduSight. I will guide you step by step.');
      await new Promise(resolve => setTimeout(resolve, 500));
      await speak('What should I call you?');
      setHasAsked(true);
      startListening();
    };

    const timer = setTimeout(welcome, 500);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  // Handle voice response
  useEffect(() => {
    if (transcript && hasAsked && transcript.length > 1) {
      // Extract name from response - take first meaningful word
      const words = transcript.trim().split(' ');
      const possibleName = words.find(w => w.length > 1 && !['my', 'name', 'is', 'call', 'me', 'i', 'am', "i'm"].includes(w.toLowerCase()));
      if (possibleName) {
        setName(possibleName);
      } else {
        setName(transcript.trim());
      }
    }
  }, [transcript, hasAsked]);

  // Handle listening timeout
  useEffect(() => {
    if (hasAsked && !isListening && !name && listenAttempts < 1) {
      const timer = setTimeout(() => {
        setListenAttempts(prev => prev + 1);
        speak('Please tell me your name, or you can type it below.').then(() => {
          setShowInput(true);
          startListening();
        });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isListening, hasAsked, name, listenAttempts]);

  const handleContinue = async () => {
    if (!name.trim()) return;
    
    stopSpeaking();
    updatePreferences({ name: name.trim() });
    await speak(`Nice to meet you, ${name.trim()}! Let's check what display works best for you.`);
    navigate('/accessibility-test');
  };

  const handleSkip = async () => {
    stopSpeaking();
    updatePreferences({ name: 'Friend' });
    await speak("That's okay! Let's continue with the accessibility test.");
    navigate('/accessibility-test');
  };

  const handleTypeMode = () => {
    setShowInput(true);
    stopSpeaking();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area">
      <BackButton onClick={() => navigate('/terms')} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-16">
        <div className="animate-fade-in flex flex-col items-center gap-8 max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <User size={40} className="text-accent" />
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-accessible-lg font-bold text-foreground">
              Welcome to EduSight!
            </h1>
            <p className="text-accessible-sm text-muted-foreground">
              I'll be your learning companion
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
              <span>Tell me your name...</span>
            </div>
          )}

          {transcript && !name && (
            <p className="text-muted-foreground text-center">
              Heard: "{transcript}"
            </p>
          )}

          {/* Name input */}
          <div className="w-full space-y-4">
            {(showInput || name) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Your Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="min-h-touch text-lg text-center"
                  autoFocus={showInput}
                />
              </div>
            )}

            {name && (
              <div className="text-center">
                <p className="text-lg text-foreground">
                  Hello, <span className="font-bold text-accent">{name}</span>! 👋
                </p>
              </div>
            )}

            {name && (
              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full min-h-touch gap-2"
              >
                Continue
                <ArrowRight size={24} />
              </Button>
            )}
          </div>

          <AccessibilityActions
            onSkip={handleSkip}
            onTypeMode={handleTypeMode}
            showTypeMode={!showInput && !name}
          />
        </div>
      </div>
    </div>
  );
};
