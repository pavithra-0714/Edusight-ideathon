import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { SpeakingIndicator } from '@/components/SpeakingIndicator';
import { AccessibilityActions } from '@/components/AccessibilityActions';
import { useVoice } from '@/contexts/VoiceContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Check } from 'lucide-react';

const termsContent = `EduSight – Terms & Conditions

Purpose of the App.
EduSight is an AI‑powered educational app that supports inclusive learning through audio, visual, and interactive formats.

Educational Use Only.
EduSight is a learning aid and does not replace teachers, schools, or official textbooks.

Healthy Usage & Screen Time.
Users are advised to take a break after 30–40 minutes of continuous screen use.
Audio‑only mode allows longer learning time.
EduSight may gently remind users to rest.

User Data & Privacy.
Only basic details like name, class, and preferences are collected.
Data is used only for personalization.
User data is never sold or misused.

Accessibility Features.
Accessibility settings are automatically adjusted to suit user comfort.

Voice & AI Limitations.
Voice recognition may not always be perfect.
Users can switch to touch input anytime.

Content Accuracy.
AI‑generated content supports learning.
Important academic content should be cross‑checked.

Offline Usage.
Some features require internet access.
Offline access depends on downloaded content.

User Responsibility.
EduSight must be used respectfully and only for education.

Updates & Changes.
Features may change to improve learning experience.

Agreement.
By continuing, you agree to these terms.`;

export const TermsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { speak, isSpeaking, stopSpeaking, startListening, isListening, transcript } = useVoice();
  const [hasFinishedReading, setHasFinishedReading] = useState(false);
  const [showManualOption, setShowManualOption] = useState(false);

  useEffect(() => {
    const readTerms = async () => {
      await speak(termsContent, { rate: 0.85 });
      setHasFinishedReading(true);
      await speak("If you agree, say 'I Agree' or tap Continue to start learning with EduSight.");
      startListening();
    };

    const timer = setTimeout(readTerms, 500);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  // Handle voice response
  useEffect(() => {
    if (transcript && hasFinishedReading) {
      const lowerTranscript = transcript.toLowerCase();
      if (lowerTranscript.includes('agree') || lowerTranscript.includes('yes') || lowerTranscript.includes('accept')) {
        handleAgree();
      }
    }
  }, [transcript, hasFinishedReading]);

  // Show manual option after listening timeout
  useEffect(() => {
    if (hasFinishedReading && !isListening) {
      const timer = setTimeout(() => {
        setShowManualOption(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isListening, hasFinishedReading]);

  const handleAgree = async () => {
    stopSpeaking();
    await speak("Thank you for agreeing. Let's get started.");
    navigate('/welcome');
  };

  const handleSkip = () => {
    stopSpeaking();
    setHasFinishedReading(true);
    setShowManualOption(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area">
      <BackButton onClick={() => navigate('/language')} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-16">
        <div className="animate-fade-in flex flex-col items-center gap-6 max-w-lg w-full">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <FileText size={32} className="text-accent" />
          </div>

          <h1 className="text-accessible-lg font-bold text-foreground text-center">
            Terms & Conditions
          </h1>

          {isSpeaking && (
            <div className="flex items-center gap-3">
              <SpeakingIndicator />
              <span className="text-muted-foreground">Reading terms aloud...</span>
            </div>
          )}

          {isListening && (
            <div className="flex items-center gap-3 text-accent">
              <div className="w-4 h-4 rounded-full bg-accent animate-pulse" />
              <span>Say "I Agree" to continue...</span>
            </div>
          )}

          <ScrollArea className="h-64 w-full rounded-2xl border bg-card p-4">
            <div className="text-sm text-card-foreground whitespace-pre-line leading-relaxed">
              {termsContent}
            </div>
          </ScrollArea>

          {transcript && (
            <p className="text-muted-foreground text-center">
              Heard: "{transcript}"
            </p>
          )}

          {(hasFinishedReading || showManualOption) && (
            <Button
              onClick={handleAgree}
              size="lg"
              className="min-h-touch min-w-touch gap-2"
            >
              <Check size={24} />
              I Agree - Continue
            </Button>
          )}

          <AccessibilityActions
            onSkip={handleSkip}
            showTypeMode={false}
          />
        </div>
      </div>
    </div>
  );
};
