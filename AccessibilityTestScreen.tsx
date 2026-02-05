import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { SpeakingIndicator } from '@/components/SpeakingIndicator';
import { AccessibilityActions } from '@/components/AccessibilityActions';
import { useVoice } from '@/contexts/VoiceContext';
import { useApp, AccessibilityMode } from '@/contexts/AppContext';
import { Eye, Palette, Check } from 'lucide-react';

// Color test plates (simplified Ishihara-style)
const colorPlates = [
  { number: '74', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'] },
  { number: '45', colors: ['#FF9F43', '#EE5A24', '#009432', '#006266'] },
  { number: '12', colors: ['#A3CB38', '#009432', '#C4E538', '#009432'] },
];

// Vision test lines
const visionLines = [
  { letters: 'E', size: 'text-6xl' },
  { letters: 'F P', size: 'text-5xl' },
  { letters: 'T O Z', size: 'text-4xl' },
  { letters: 'L P E D', size: 'text-3xl' },
  { letters: 'P E C F D', size: 'text-2xl' },
  { letters: 'E D F C Z P', size: 'text-xl' },
];

type TestPhase = 'intro' | 'color' | 'vision' | 'result';

export const AccessibilityTestScreen: React.FC = () => {
  const navigate = useNavigate();
  const { speak, isSpeaking, stopSpeaking, startListening, isListening, transcript, resetTranscript } = useVoice();
  const { updatePreferences, applyAccessibilityMode } = useApp();
  
  const [phase, setPhase] = useState<TestPhase>('intro');
  const [currentPlate, setCurrentPlate] = useState(0);
  const [colorTestResults, setColorTestResults] = useState<boolean[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [lastReadableLine, setLastReadableLine] = useState(-1);
  const [determinedMode, setDeterminedMode] = useState<AccessibilityMode>('normal');
  const [showManualInput, setShowManualInput] = useState(false);

  // Introduction
  useEffect(() => {
    if (phase === 'intro') {
      const intro = async () => {
        await speak("Let's check what display works best for you. This will only take a moment.");
        await new Promise(resolve => setTimeout(resolve, 500));
        setPhase('color');
      };
      const timer = setTimeout(intro, 500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Color test
  useEffect(() => {
    if (phase === 'color' && currentPlate < colorPlates.length) {
      const askColor = async () => {
        await speak(`Look at the circle of dots. Can you tell which number you see?`);
        startListening();
      };
      const timer = setTimeout(askColor, 500);
      return () => clearTimeout(timer);
    } else if (phase === 'color' && currentPlate >= colorPlates.length) {
      setPhase('vision');
    }
  }, [phase, currentPlate]);

  // Vision test
  useEffect(() => {
    if (phase === 'vision' && currentLine < visionLines.length) {
      const askVision = async () => {
        await speak(`Please read the letters on this line.`);
        startListening();
      };
      const timer = setTimeout(askVision, 500);
      return () => clearTimeout(timer);
    } else if (phase === 'vision' && currentLine >= visionLines.length) {
      determineMode();
    }
  }, [phase, currentLine]);

  // Handle voice response for color test
  useEffect(() => {
    if (phase === 'color' && transcript && currentPlate < colorPlates.length) {
      const expected = colorPlates[currentPlate].number;
      const heard = transcript.replace(/\D/g, '');
      const isCorrect = heard.includes(expected);
      
      setColorTestResults(prev => [...prev, isCorrect]);
      resetTranscript();
      
      setTimeout(() => {
        setCurrentPlate(prev => prev + 1);
      }, 1000);
    }
  }, [transcript, phase, currentPlate]);

  // Handle voice response for vision test
  useEffect(() => {
    if (phase === 'vision' && transcript && currentLine < visionLines.length) {
      const expected = visionLines[currentLine].letters.toLowerCase().replace(/\s/g, '');
      const heard = transcript.toLowerCase().replace(/\s/g, '');
      
      // Check if at least 60% of letters match
      const matchCount = expected.split('').filter(char => heard.includes(char)).length;
      const isReadable = matchCount / expected.length >= 0.6;
      
      if (isReadable) {
        setLastReadableLine(currentLine);
      }
      
      resetTranscript();
      setCurrentLine(prev => prev + 1);
    }
  }, [transcript, phase, currentLine]);

  // Handle listening timeout
  useEffect(() => {
    if (!isListening && (phase === 'color' || phase === 'vision')) {
      const timer = setTimeout(() => {
        setShowManualInput(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isListening, phase]);

  const determineMode = async () => {
    // Analyze results
    const colorFailures = colorTestResults.filter(r => !r).length;
    const hasColorBlindness = colorFailures >= 2;
    const hasVisionIssues = lastReadableLine < 3; // Can't read smaller lines
    
    let mode: AccessibilityMode = 'normal';
    let modeText = 'Normal Vision';
    
    if (hasVisionIssues) {
      mode = 'visually-assisted';
      modeText = 'Visually Assisted';
    } else if (hasColorBlindness) {
      mode = 'colorblind';
      modeText = 'Color-Friendly';
    }
    
    setDeterminedMode(mode);
    setPhase('result');
    
    await speak(`Based on the test, I will set your mode to ${modeText}. This will adjust font sizes, contrast, and colors for your comfort.`);
  };

  const handleSkipColorTest = () => {
    setColorTestResults([true, true, true]); // Assume normal
    setPhase('vision');
    stopSpeaking();
  };

  const handleSkipVisionTest = () => {
    setLastReadableLine(5); // Assume normal
    determineMode();
    stopSpeaking();
  };

  const handleManualColorResponse = (canSee: boolean) => {
    setColorTestResults(prev => [...prev, canSee]);
    setShowManualInput(false);
    setCurrentPlate(prev => prev + 1);
  };

  const handleManualVisionResponse = (canRead: boolean) => {
    if (canRead) {
      setLastReadableLine(currentLine);
    }
    setShowManualInput(false);
    setCurrentLine(prev => prev + 1);
  };

  const handleContinue = () => {
    applyAccessibilityMode(determinedMode);
    updatePreferences({ 
      accessibilityMode: determinedMode,
      hasCompletedOnboarding: true 
    });
    navigate('/home');
  };

  const handleSelectMode = (mode: AccessibilityMode) => {
    setDeterminedMode(mode);
    setPhase('result');
    stopSpeaking();
  };

  const renderColorPlate = () => {
    if (currentPlate >= colorPlates.length) return null;
    const plate = colorPlates[currentPlate];
    
    return (
      <div className="relative w-48 h-48 rounded-full overflow-hidden flex items-center justify-center bg-muted">
        {/* Dots background */}
        <div className="absolute inset-0 grid grid-cols-8 gap-1 p-2">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                backgroundColor: plate.colors[i % plate.colors.length],
                width: '100%',
                paddingBottom: '100%',
              }}
            />
          ))}
        </div>
        {/* Number overlay */}
        <span className="relative text-4xl font-bold opacity-80" style={{ color: plate.colors[1] }}>
          {plate.number}
        </span>
      </div>
    );
  };

  const renderVisionLine = () => {
    if (currentLine >= visionLines.length) return null;
    const line = visionLines[currentLine];
    
    return (
      <div className="flex flex-col items-center gap-4">
        <p className={`${line.size} font-bold tracking-widest text-foreground`}>
          {line.letters}
        </p>
        <p className="text-sm text-muted-foreground">
          Line {currentLine + 1} of {visionLines.length}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area">
      <BackButton onClick={() => navigate('/welcome')} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-16">
        <div className="animate-fade-in flex flex-col items-center gap-6 max-w-md w-full">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            {phase === 'color' ? (
              <Palette size={32} className="text-accent" />
            ) : (
              <Eye size={32} className="text-accent" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-accessible-lg font-bold text-foreground text-center">
            {phase === 'intro' && 'Accessibility Check'}
            {phase === 'color' && 'Color Perception Test'}
            {phase === 'vision' && 'Vision Clarity Test'}
            {phase === 'result' && 'Your Settings'}
          </h1>

          {isSpeaking && (
            <div className="flex items-center gap-3">
              <SpeakingIndicator />
              <span className="text-muted-foreground">Speaking...</span>
            </div>
          )}

          {isListening && (
            <div className="flex items-center gap-3 text-accent">
              <div className="w-4 h-4 rounded-full bg-accent animate-pulse" />
              <span>Listening...</span>
            </div>
          )}

          {/* Color Test */}
          {phase === 'color' && (
            <>
              {renderColorPlate()}
              <p className="text-center text-muted-foreground">
                What number do you see in the circle?
              </p>
              
              {showManualInput && (
                <div className="flex gap-4">
                  <Button onClick={() => handleManualColorResponse(true)} variant="outline" size="lg">
                    I see {colorPlates[currentPlate]?.number}
                  </Button>
                  <Button onClick={() => handleManualColorResponse(false)} variant="outline" size="lg">
                    Can't see clearly
                  </Button>
                </div>
              )}
              
              <AccessibilityActions onSkip={handleSkipColorTest} showTypeMode={false} />
            </>
          )}

          {/* Vision Test */}
          {phase === 'vision' && (
            <>
              {renderVisionLine()}
              <p className="text-center text-muted-foreground">
                Read the letters aloud
              </p>
              
              {showManualInput && (
                <div className="flex gap-4">
                  <Button onClick={() => handleManualVisionResponse(true)} variant="outline" size="lg">
                    I can read this
                  </Button>
                  <Button onClick={() => handleManualVisionResponse(false)} variant="outline" size="lg">
                    Too small
                  </Button>
                </div>
              )}
              
              <AccessibilityActions onSkip={handleSkipVisionTest} showTypeMode={false} />
            </>
          )}

          {/* Result */}
          {phase === 'result' && (
            <>
              <div className="w-full p-6 rounded-2xl bg-card border space-y-4">
                <div className="flex items-center gap-3">
                  <Check size={24} className="text-success" />
                  <span className="text-lg font-semibold">
                    Mode: {determinedMode === 'normal' ? 'Normal Vision' : 
                           determinedMode === 'colorblind' ? 'Color-Friendly' : 
                           'Visually Assisted'}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {determinedMode === 'normal' && 'Standard display settings with balanced colors and fonts.'}
                  {determinedMode === 'colorblind' && 'Enhanced color palette optimized for color vision differences.'}
                  {determinedMode === 'visually-assisted' && 'Larger fonts, high contrast, and enhanced accessibility features.'}
                </p>
              </div>

              <div className="w-full space-y-2">
                <p className="text-sm text-muted-foreground text-center">Or select manually:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(['normal', 'colorblind', 'visually-assisted'] as AccessibilityMode[]).map((mode) => (
                    <Button
                      key={mode}
                      onClick={() => handleSelectMode(mode)}
                      variant={determinedMode === mode ? 'default' : 'outline'}
                      size="sm"
                    >
                      {mode === 'normal' ? 'Normal' : mode === 'colorblind' ? 'Color-Friendly' : 'High Contrast'}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full min-h-touch gap-2"
              >
                <Check size={24} />
                Continue to EduSight
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
