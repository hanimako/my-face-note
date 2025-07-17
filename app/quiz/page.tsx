"use client";

import { useQuiz } from "@/hooks/useQuiz";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizOptions } from "@/components/quiz/QuizOptions";
import { QuizControls } from "@/components/quiz/QuizControls";
import { QuizSettingsSheet } from "@/components/QuizSettingsSheet";

export default function QuizPage() {
  const {
    currentQuestion,
    selectedAnswer,
    isCorrect,
    isSettingsOpen,
    settings,
    handleAnswerSelect,
    handleNextQuestion,
    handleSettingsSave,
    setIsSettingsOpen,
  } = useQuiz();

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizHeader />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 設定ボタン - ヘッダーと問題エリアの間に右揃えで配置 */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-sm transition-colors text-sm font-medium"
          >
            ⚙ クイズ設定
          </button>
        </div>

        {currentQuestion && (
          <div className="space-y-6">
            <QuizQuestion
              question={currentQuestion.question}
              mode={currentQuestion.mode}
            />

            <QuizOptions
              options={currentQuestion.options}
              mode={currentQuestion.mode}
              selectedAnswer={selectedAnswer}
              isCorrect={isCorrect}
              onAnswerSelect={handleAnswerSelect}
            />

            <QuizControls
              selectedAnswer={selectedAnswer}
              onNextQuestion={handleNextQuestion}
            />
          </div>
        )}
      </main>

      <QuizSettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />
    </div>
  );
}
