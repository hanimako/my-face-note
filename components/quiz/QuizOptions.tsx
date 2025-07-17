import Image from "next/image";
import { Person } from "@/lib/db";

/**
 * クイズ選択肢コンポーネントのプロパティ
 */
interface QuizOptionsProps {
  options: Person[]; // 選択肢の人物一覧
  mode: "face-to-name" | "name-to-face"; // クイズモード
  selectedAnswer: Person | null; // 選択された回答
  isCorrect: boolean | null; // 正誤判定
  onAnswerSelect: (option: Person) => void; // 回答選択時のコールバック
}

/**
 * クイズの選択肢を表示するコンポーネント
 * - 4つの選択肢を2×2グリッドで表示
 * - 選択時に正誤判定を選択肢の下に表示
 * - 選択後は他の選択肢を無効化
 * - 選択肢の上に正誤アイコンを表示
 */
export function QuizOptions({
  options,
  mode,
  selectedAnswer,
  isCorrect,
  onAnswerSelect,
}: QuizOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((option, index) => (
        <div key={`${option.id}-${index}`} className="space-y-2">
          <div className="relative">
            {/* 選択肢の上に正誤アイコンを表示 */}
            {selectedAnswer?.id === option.id && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div
                  className={`text-6xl opacity-70 font-bold ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCorrect ? (
                    <div className="w-16 h-16 border-4 border-green-600 rounded-full bg-transparent"></div>
                  ) : (
                    "✕"
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => onAnswerSelect(option)}
              disabled={selectedAnswer !== null}
              className={`p-4 rounded-lg border-2 transition-all w-full relative ${
                selectedAnswer?.id === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 bg-white"
              } ${
                selectedAnswer !== null ? "cursor-default" : "cursor-pointer"
              }`}
            >
              {mode === "face-to-name" ? (
                // 顔→名前モード: 名前のみ表示
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {option.name}
                  </div>
                </div>
              ) : (
                // 名前→顔モード: 写真と名前を表示
                <div className="text-center">
                  {option.id.startsWith("dummy-") ? (
                    // ダミー選択肢の場合：「No Image」を表示
                    <div className="w-24 h-24 bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-500 text-xs font-medium">
                        No Image
                      </span>
                    </div>
                  ) : (
                    // 実際の人物の場合：写真を表示
                    <Image
                      src={option.photo}
                      alt={option.name}
                      width={96}
                      height={96}
                      className="rounded-lg object-cover mx-auto mb-2 border border-gray-200"
                    />
                  )}
                  <div className="text-sm font-medium text-gray-900">
                    {option.name}
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* 選択肢の下に正誤判定を表示 */}
          {selectedAnswer?.id === option.id && (
            <div className="text-center">
              <div className="text-sm font-medium">
                {isCorrect ? "✅ 正解！" : "❌ 不正解…"}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
