import Image from "next/image";
import { Person } from "@/lib/db";

/**
 * クイズ問題表示コンポーネントのプロパティ
 */
interface QuizQuestionProps {
  question: Person; // 出題対象の人物
  mode: "face-to-name" | "name-to-face"; // クイズモード
}

/**
 * クイズの問題部分を表示するコンポーネント
 * - 顔→名前モード: 写真を表示
 * - 名前→顔モード: 名前を表示
 *
 * @param question 出題対象の人物
 * @param mode クイズモード（顔→名前 or 名前→顔）
 */
export function QuizQuestion({ question, mode }: QuizQuestionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
      {/* 問題文 */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {mode === "face-to-name" ? "この人の名前は？" : "この名前の人は？"}
      </h2>

      {/* 問題内容の表示 */}
      {mode === "face-to-name" ? (
        // 顔→名前モード: 写真を表示
        <Image
          src={question.photo}
          alt="問題の写真"
          width={120}
          height={120}
          className="rounded-lg object-cover mx-auto border-2 border-gray-200"
        />
      ) : (
        // 名前→顔モード: 名前を表示
        <div className="text-3xl font-bold text-gray-900 py-8">
          {question.name}
        </div>
      )}
    </div>
  );
}
