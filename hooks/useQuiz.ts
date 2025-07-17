"use client";

import { useState, useEffect, useCallback } from "react";
import { Person, QuizSettings, db, MemorizationStatus } from "@/lib/db";

/**
 * クイズ1問分の情報を保持する型
 */
interface QuizQuestion {
  question: Person;
  options: Person[];
  correctAnswer: Person;
  mode: "face-to-name" | "name-to-face";
}

// ダミー氏名（選択肢が足りない場合に利用）
const DUMMY_NAMES = ["佐藤太郎", "鈴木花子", "高橋健", "田中美咲"];

/**
 * クイズ画面のロジック・状態管理を提供するカスタムフック
 * - 人物・設定データの取得
 * - 問題生成・選択肢生成
 * - 回答処理
 * - 設定保存
 */
export function useQuiz() {
  // 人物リスト
  const [people, setPeople] = useState<Person[]>([]);
  // クイズ設定
  const [settings, setSettings] = useState<QuizSettings>({
    target: "all",
    mode: "face-to-name",
    autoPromotion: "off",
  });
  // 現在の出題中の問題
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null
  );
  // 選択中の回答
  const [selectedAnswer, setSelectedAnswer] = useState<Person | null>(null);
  // 正誤判定
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  // 設定シートの開閉状態
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // 回答済み問題のID集合
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set()
  );

  /**
   * 未回答の人物からランダムに1問出題し、選択肢を生成
   * @param peopleData 全人物データ
   * @param quizSettings クイズ設定
   */
  const generateQuestion = useCallback(
    (peopleData: Person[], quizSettings: QuizSettings) => {
      // 未回答の人物のみ抽出
      const unansweredPeople = peopleData.filter(
        (p) => !answeredQuestions.has(p.id)
      );

      if (unansweredPeople.length === 0) {
        // 全問回答済みならトップへ遷移
        window.location.href = "/";
        return;
      }

      // ランダムに1人選択
      const questionPerson =
        unansweredPeople[Math.floor(Math.random() * unansweredPeople.length)];

      // 選択肢を生成
      const options = generateOptions(questionPerson, peopleData);
      // 選択肢をシャッフル
      const shuffledOptions = options.sort(() => Math.random() - 0.5);

      setCurrentQuestion({
        question: questionPerson,
        options: shuffledOptions,
        correctAnswer: questionPerson,
        mode: quizSettings.mode,
      });
    },
    [answeredQuestions]
  );

  /**
   * 選択肢を生成（足りない場合はダミーで補完）
   * @param questionPerson 出題対象の人物
   * @param peopleData 全人物データ
   * @returns 4件の選択肢
   */
  const generateOptions = (questionPerson: Person, peopleData: Person[]) => {
    const otherPeople = peopleData.filter((p) => p.id !== questionPerson.id);
    const neededDummies = Math.max(0, 4 - peopleData.length);

    const options = [questionPerson, ...otherPeople];

    // ダミーを必要数追加
    for (let i = 0; i < neededDummies; i++) {
      options.push({
        id: `dummy-${i}`,
        name: DUMMY_NAMES[i],
        department: "",
        memo: "",
        photo: "/api/placeholder/150/150",
        memorizationStatus: "untried",
        consecutiveCorrect: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return options.slice(0, 4);
  };

  /**
   * 人物・設定データを取得し、初回のみ問題を生成
   */
  const loadData = useCallback(async () => {
    const [peopleData, settingsData] = await Promise.all([
      db.getPeople({
        unmemorizedOnly: settings.target === "unmemorized",
        department: settings.departmentFilter,
      }),
      db.getQuizSettings(),
    ]);
    setPeople(peopleData);
    setSettings(settingsData);
    if (!currentQuestion) {
      generateQuestion(peopleData, settingsData);
    }
  }, [
    settings.target,
    settings.departmentFilter,
    currentQuestion,
    generateQuestion,
  ]);

  // 初回マウント時にデータ取得
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 回答選択時の処理
   * @param selected 選択した人物
   */
  const handleAnswerSelect = (selected: Person) => {
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(selected);
    const correct = selected.id === currentQuestion.correctAnswer.id;
    setIsCorrect(correct);

    if (correct) {
      // 正解の場合は記憶状態を更新
      const newConsecutiveCorrect =
        currentQuestion.correctAnswer.consecutiveCorrect + 1;

      let newStatus: MemorizationStatus =
        currentQuestion.correctAnswer.memorizationStatus;
      if (settings.autoPromotion !== "off") {
        const requiredConsecutive = parseInt(settings.autoPromotion);
        if (newConsecutiveCorrect >= requiredConsecutive) {
          newStatus = "memorized";
        } else if (newConsecutiveCorrect >= 1) {
          newStatus = "learning";
        }
      }

      db.updateMemorizationStatus(
        currentQuestion.correctAnswer.id,
        newStatus,
        newConsecutiveCorrect
      );
    }

    // 回答済み問題に追加
    setAnsweredQuestions(
      (prev) => new Set([...prev, currentQuestion.correctAnswer.id])
    );
  };

  /**
   * 「次の問題」ボタン押下時の処理
   */
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    generateQuestion(people, settings);
  };

  /**
   * 設定保存時の処理
   * @param newSettings 新しい設定
   */
  const handleSettingsSave = async (newSettings: QuizSettings) => {
    await db.saveQuizSettings(newSettings);
    setSettings(newSettings);
    setIsSettingsOpen(false);
    const peopleData = await db.getPeople({
      unmemorizedOnly: newSettings.target === "unmemorized",
      department: newSettings.departmentFilter,
    });
    setPeople(peopleData);
    setAnsweredQuestions(new Set());
    generateQuestion(peopleData, newSettings);
  };

  return {
    people,
    settings,
    currentQuestion,
    selectedAnswer,
    isCorrect,
    isSettingsOpen,
    handleAnswerSelect,
    handleNextQuestion,
    handleSettingsSave,
    setIsSettingsOpen,
  };
}
