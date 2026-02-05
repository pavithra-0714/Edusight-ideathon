import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SpeakingIndicator } from '@/components/SpeakingIndicator';
import { useVoice } from '@/contexts/VoiceContext';
import { useApp } from '@/contexts/AppContext';
import edusightLogo from '@/assets/edusight-logo.png';
import { 
  BookOpen, 
  GraduationCap, 
  FlaskConical,
  Settings,
  Mic,
  ChevronRight
} from 'lucide-react';

const boards = ['CBSE', 'State Board'];
const grades = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const subjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Studies'];

type SelectionPhase = 'home' | 'board' | 'grade' | 'subject' | 'chapter';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { speak, isSpeaking, stopSpeaking, startListening, isListening, transcript, resetTranscript } = useVoice();
  const { preferences, updatePreferences } = useApp();
  
  const [phase, setPhase] = useState<SelectionPhase>('home');
  const [selectedBoard, setSelectedBoard] = useState(preferences.board || '');
  const [selectedGrade, setSelectedGrade] = useState(preferences.grade || '');
  const [selectedSubject, setSelectedSubject] = useState(preferences.subject || '');

  // Welcome message
  useEffect(() => {
    if (phase === 'home') {
      const welcome = async () => {
        await speak(`Hello ${preferences.name || 'Friend'}! Welcome back to EduSight.`);
        await new Promise(resolve => setTimeout(resolve, 300));
        await speak('You can say: Choose Board, Choose Grade, Choose Subject, or Settings.');
        startListening();
      };
      const timer = setTimeout(welcome, 500);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [phase, preferences.name]);

  // Handle voice navigation
  useEffect(() => {
    if (transcript) {
      const lower = transcript.toLowerCase();
      
      if (phase === 'home') {
        if (lower.includes('board')) {
          setPhase('board');
        } else if (lower.includes('grade')) {
          setPhase('grade');
        } else if (lower.includes('subject')) {
          setPhase('subject');
        } else if (lower.includes('setting')) {
          navigate('/settings');
        }
      } else if (phase === 'board') {
        const found = boards.find(b => lower.includes(b.toLowerCase()));
        if (found) {
          selectBoard(found);
        }
      } else if (phase === 'grade') {
        const gradeMatch = lower.match(/\d+/);
        if (gradeMatch) {
          const gradeNum = gradeMatch[0];
          const found = grades.find(g => g.includes(gradeNum));
          if (found) {
            selectGrade(found);
          }
        }
      } else if (phase === 'subject') {
        const found = subjects.find(s => lower.includes(s.toLowerCase()));
        if (found) {
          selectSubject(found);
        }
      }
      
      resetTranscript();
    }
  }, [transcript]);

  // Speak options for each phase
  useEffect(() => {
    if (phase === 'board') {
      speakOptions('Please choose your board.', boards);
    } else if (phase === 'grade') {
      speakOptions('Please choose your grade.', grades);
    } else if (phase === 'subject') {
      speakOptions('Please choose your subject.', subjects);
    }
  }, [phase]);

  const speakOptions = async (intro: string, options: string[]) => {
    await speak(intro);
    await new Promise(resolve => setTimeout(resolve, 300));
    await speak(options.join(', '));
    startListening();
  };

  const selectBoard = async (board: string) => {
    setSelectedBoard(board);
    updatePreferences({ board });
    await speak(`You selected ${board}.`);
    setPhase('grade');
  };

  const selectGrade = async (grade: string) => {
    setSelectedGrade(grade);
    updatePreferences({ grade });
    await speak(`You selected ${grade}.`);
    setPhase('subject');
  };

  const selectSubject = async (subject: string) => {
    setSelectedSubject(subject);
    updatePreferences({ subject });
    await speak(`You selected ${subject}. Let's explore the chapters.`);
    navigate('/chapters');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <img src={preferences.customLogo || edusightLogo} alt="EduSight" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-bold text-lg text-foreground">EduSight</h1>
            <p className="text-sm text-muted-foreground">Hello, {preferences.name || 'Friend'}!</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        >
          <Settings size={24} />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Voice Status */}
          {isSpeaking && (
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border">
              <SpeakingIndicator />
              <span className="text-muted-foreground">Speaking...</span>
            </div>
          )}

          {isListening && (
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent">
              <Mic size={24} className="text-accent animate-pulse" />
              <span className="text-accent">Listening for your command...</span>
            </div>
          )}

          {/* Home Phase */}
          {phase === 'home' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-accessible-base font-bold text-center">What would you like to do?</h2>
              
              <div className="grid gap-4">
                <Button
                  onClick={() => setPhase('board')}
                  variant="outline"
                  size="lg"
                  className="min-h-touch justify-between px-6"
                >
                  <span className="flex items-center gap-3">
                    <BookOpen size={24} className="text-accent" />
                    Choose Board
                  </span>
                  <span className="text-muted-foreground">{selectedBoard || 'Not selected'}</span>
                </Button>

                <Button
                  onClick={() => setPhase('grade')}
                  variant="outline"
                  size="lg"
                  className="min-h-touch justify-between px-6"
                >
                  <span className="flex items-center gap-3">
                    <GraduationCap size={24} className="text-accent" />
                    Choose Grade
                  </span>
                  <span className="text-muted-foreground">{selectedGrade || 'Not selected'}</span>
                </Button>

                <Button
                  onClick={() => setPhase('subject')}
                  variant="outline"
                  size="lg"
                  className="min-h-touch justify-between px-6"
                >
                  <span className="flex items-center gap-3">
                    <FlaskConical size={24} className="text-accent" />
                    Choose Subject
                  </span>
                  <span className="text-muted-foreground">{selectedSubject || 'Not selected'}</span>
                </Button>
              </div>

              {selectedBoard && selectedGrade && selectedSubject && (
                <Button
                  onClick={() => navigate('/chapters')}
                  size="lg"
                  className="w-full min-h-touch gap-2"
                >
                  Continue to Chapters
                  <ChevronRight size={24} />
                </Button>
              )}
            </div>
          )}

          {/* Board Selection */}
          {phase === 'board' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-accessible-base font-bold text-center">Choose Your Board</h2>
              <div className="grid gap-3">
                {boards.map((board) => (
                  <Button
                    key={board}
                    onClick={() => selectBoard(board)}
                    variant={selectedBoard === board ? 'default' : 'outline'}
                    size="lg"
                    className="min-h-touch"
                  >
                    {board}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setPhase('home')} className="w-full">
                Back to Home
              </Button>
            </div>
          )}

          {/* Grade Selection */}
          {phase === 'grade' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-accessible-base font-bold text-center">Choose Your Grade</h2>
              <div className="grid grid-cols-2 gap-3">
                {grades.map((grade) => (
                  <Button
                    key={grade}
                    onClick={() => selectGrade(grade)}
                    variant={selectedGrade === grade ? 'default' : 'outline'}
                    size="lg"
                    className="min-h-touch"
                  >
                    {grade}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setPhase('home')} className="w-full">
                Back to Home
              </Button>
            </div>
          )}

          {/* Subject Selection */}
          {phase === 'subject' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-accessible-base font-bold text-center">Choose Your Subject</h2>
              <div className="grid gap-3">
                {subjects.map((subject) => (
                  <Button
                    key={subject}
                    onClick={() => selectSubject(subject)}
                    variant={selectedSubject === subject ? 'default' : 'outline'}
                    size="lg"
                    className="min-h-touch"
                  >
                    {subject}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setPhase('home')} className="w-full">
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Hey Ruvira Voice Assistant Trigger */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => speak("Hey! I'm Ruvira, your AI assistant. Ask me anything about your studies.")}
          size="lg"
          className="rounded-full w-16 h-16 shadow-lg"
          aria-label="Hey Ruvira AI Assistant"
        >
          <Mic size={28} />
        </Button>
      </div>
    </div>
  );
};
