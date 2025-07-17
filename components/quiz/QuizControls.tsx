import { Button } from "@/components/ui/Button";
import { Person } from "@/lib/db";

interface QuizControlsProps {
  selectedAnswer: Person | null;
  onNextQuestion: () => void;
}

export function QuizControls({
  selectedAnswer,
  onNextQuestion,
}: QuizControlsProps) {
  if (!selectedAnswer) return null;

  return (
    <div className="text-center">
      <Button onClick={onNextQuestion} size="lg">
        次の問題 ▶
      </Button>
    </div>
  );
}
