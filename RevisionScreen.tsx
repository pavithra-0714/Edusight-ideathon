import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useVoice } from '@/contexts/VoiceContext';
import { 
  BookMarked, 
  Play,
  FileText,
  Image,
  CheckSquare
} from 'lucide-react';

// Demo revision content
const revisionContent = {
  title: 'Chapter 1: Introduction to Matter',
  summary: 'Matter is anything that has mass and occupies space. It exists in three states: solid, liquid, and gas. Solids have fixed shape and volume, liquids have fixed volume but variable shape, and gases have neither fixed shape nor volume. All matter is made of tiny particles that are constantly moving.',
  formulas: [
    { name: 'Density', formula: 'ρ = m/V', description: 'Mass divided by Volume' },
    { name: 'Volume of Cuboid', formula: 'V = l × b × h', description: 'Length × Breadth × Height' },
  ],
  diagrams: [
    { title: 'States of Matter', description: 'Particle arrangement in solid, liquid, and gas' },
    { title: 'Change of States', description: 'Transitions between different states' },
  ],
  quickQuiz: [
    { question: 'What are the two main properties of matter?', answer: 'Mass and Volume' },
    { question: 'Which state of matter has particles closest together?', answer: 'Solid' },
    { question: 'What happens to particles when heated?', answer: 'They move faster' },
  ],
};

export const RevisionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const { speak, stopSpeaking, isSpeaking } = useVoice();

  useEffect(() => {
    const intro = async () => {
      await speak(`Revision for ${revisionContent.title}. Here's a quick summary to refresh your memory.`);
    };
    const timer = setTimeout(intro, 500);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  const readSummary = async () => {
    stopSpeaking();
    await speak(revisionContent.summary);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area">
      <BackButton onClick={() => navigate(-1)} />

      <header className="p-4 pt-16 border-b bg-card">
        <div className="flex items-center gap-3">
          <BookMarked size={28} className="text-accent" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Revision</h1>
            <p className="text-sm text-muted-foreground">{revisionContent.title}</p>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <main className="p-4 space-y-6">
          {/* Quick Summary */}
          <div className="p-4 rounded-2xl border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText size={20} className="text-accent" />
                Quick Summary
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={readSummary}
                disabled={isSpeaking}
              >
                <Play size={16} className="mr-1" />
                {isSpeaking ? 'Playing...' : 'Play'}
              </Button>
            </div>
            <p className="text-muted-foreground leading-relaxed">{revisionContent.summary}</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Reading time: ~2 min</span>
            </div>
          </div>

          {/* Formula Sheet */}
          <div className="p-4 rounded-2xl border bg-card">
            <h2 className="text-lg font-bold mb-3">📐 Formula Sheet</h2>
            <div className="space-y-3">
              {revisionContent.formulas.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-muted"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{item.name}</span>
                    <code className="px-2 py-1 rounded bg-accent/20 text-accent font-mono font-bold">
                      {item.formula}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagrams */}
          <div className="p-4 rounded-2xl border bg-card">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
              <Image size={20} className="text-success" />
              Key Diagrams
            </h2>
            <div className="space-y-3">
              {revisionContent.diagrams.map((diagram, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-muted flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Image size={28} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{diagram.title}</p>
                    <p className="text-sm text-muted-foreground">{diagram.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Quiz */}
          <div className="p-4 rounded-2xl border bg-card">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
              <CheckSquare size={20} className="text-warning" />
              Quick Quiz
            </h2>
            <div className="space-y-4">
              {revisionContent.quickQuiz.map((item, index) => (
                <details
                  key={index}
                  className="p-3 rounded-xl bg-muted cursor-pointer"
                >
                  <summary className="font-medium">
                    Q{index + 1}: {item.question}
                  </summary>
                  <p className="mt-2 text-success font-medium pl-4 border-l-2 border-success">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="p-4 rounded-2xl border bg-card">
            <h2 className="text-lg font-bold mb-3">Your Progress</h2>
            <Progress value={75} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">75% of this chapter completed</p>
          </div>
        </main>
      </ScrollArea>
    </div>
  );
};

