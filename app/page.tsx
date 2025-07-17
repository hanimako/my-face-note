"use client";

import { useState, useEffect, useCallback } from "react";
import { Person, db } from "@/lib/db";
import { Modal } from "@/components/ui/Modal";
import { PersonForm } from "@/components/PersonForm";
import { PersonCard } from "@/components/PersonCard";
import { AppSettingsSheet } from "@/components/AppSettingsSheet";
import { FirstLaunchSheet } from "@/components/FirstLaunchSheet";
import { HomeHeader } from "@/components/HomeHeader";
import { HomeActions } from "@/components/HomeActions";

/**
 * メインページコンポーネント
 * - 人物一覧の表示
 * - 人物の追加・編集・削除
 * - フィルター機能
 * - クイズページへの遷移
 */
export default function Home() {
  // 人物一覧
  const [people, setPeople] = useState<Person[]>();
  // 部署一覧（フィルター用）
  const [departments, setDepartments] = useState<string[]>([]);
  // 全データ数（フィルター適用前）
  const [totalCount, setTotalCount] = useState<number>(0);
  // 「覚えた」以外のデータ数
  const [unmemorizedCount, setUnmemorizedCount] = useState<number>(0);
  // 追加モーダルの開閉状態
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // 編集中の人物（null = 編集中でない）
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null);
  // フィルター設定
  const [filters, setFilters] = useState({
    unmemorizedOnly: false, // 未記憶のみ表示
    department: "", // 部署フィルター
  });
  const [isAppSettingsOpen, setIsAppSettingsOpen] = useState(false);
  const [isFirstLaunchOpen, setIsFirstLaunchOpen] = useState(false);

  /**
   * 人物・部署データを取得
   * フィルター条件が変更された際に自動実行される
   */
  const loadData = useCallback(async () => {
    try {
      setError(null);
      // 人物データと部署データを並行取得
      const [peopleData, departmentsData, totalCount, unmemorizedCount] =
        await Promise.all([
          db.getPeople({
            unmemorizedOnly: filters.unmemorizedOnly,
            department: filters.department || undefined,
          }),
          db.getDepartments(),
          db.getTotalPeopleCount(),
          db.getUnmemorizedPeopleCount(),
        ]);
      setPeople(peopleData);
      setDepartments(departmentsData);
      setTotalCount(totalCount);
      setUnmemorizedCount(unmemorizedCount);

      // 初回起動の判定（全データが0件の場合のみ）
      if (totalCount === 0) {
        setIsFirstLaunchOpen(true);
      }
    } catch (error) {
      console.error("データの読み込みに失敗しました:", error);
      setError(
        "データの読み込みに失敗しました。ページを再読み込みしてください。"
      );
    }
  }, [filters.unmemorizedOnly, filters.department]);

  // フィルター変更時にデータを再取得
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 新規人物を追加
   * @param personData 追加する人物データ
   */
  const handleAddPerson = async (
    personData: Omit<Person, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setError(null);
      await db.addPerson(personData);
      setIsAddModalOpen(false);
      loadData(); // 一覧を更新
    } catch (error) {
      console.error("登録に失敗しました:", error);
      setError("人物の登録に失敗しました。もう一度お試しください。");
    }
  };

  /**
   * 人物情報を更新
   * @param id 更新対象の人物ID
   * @param updates 更新内容
   */
  const handleUpdatePerson = async (
    id: string,
    updates: Partial<Omit<Person, "id" | "createdAt">>
  ) => {
    try {
      setError(null);
      await db.updatePerson(id, updates);
      setEditingPerson(null); // 編集モーダルを閉じる
      loadData(); // 一覧を更新
    } catch (error) {
      console.error("更新に失敗しました:", error);
      setError("人物の更新に失敗しました。もう一度お試しください。");
    }
  };

  /**
   * 人物を削除
   * @param id 削除対象の人物ID
   */
  const handleDeletePerson = async (id: string) => {
    if (!confirm("この利用者を削除しますか？")) return;

    try {
      setError(null);
      await db.deletePerson(id);
      setEditingPerson(null); // 編集モーダルを閉じる
      loadData(); // 一覧を更新
    } catch (error) {
      console.error("削除に失敗しました:", error);
      setError("人物の削除に失敗しました。もう一度お試しください。");
    }
  };

  /**
   * 記憶状態を手動で変更
   * @param id 変更対象の人物ID
   * @param newStatus 新しい記憶状態
   */
  const handleMemorizationChange = async (
    id: string,
    newStatus: "untried" | "learning" | "memorized"
  ) => {
    try {
      setError(null);
      await db.updateMemorizationStatus(id, newStatus, 0); // 連続正解数はリセット
      loadData(); // 一覧を更新
    } catch (error) {
      console.error("記憶状態の更新に失敗しました:", error);
      setError("記憶状態の更新に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-red-500">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* アクション部分 */}
        <HomeActions
          people={people}
          totalCount={totalCount}
          unmemorizedCount={unmemorizedCount}
          onQuizClick={() => (window.location.href = "/quiz")}
          onAppSettingsClick={() => setIsAppSettingsOpen(true)}
        />

        {/* フィルター - 全データが存在する場合のみ表示 */}
        {totalCount > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              {/* 未記憶のみフィルター */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.unmemorizedOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      unmemorizedOnly: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">未記憶のみ</span>
              </label>

              {/* 部署フィルター */}
              <select
                value={filters.department}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                className="rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべての所属</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 人物グリッド */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* 追加カード - 常に最初に表示 */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="aspect-square bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 aria-label='新しい利用者を追加'"
          >
            <div className="text-3xl">➕</div>
            <div className="text-sm font-medium">
              {people && people.length === 0
                ? "まずは1件登録してみましょう！"
                : "タップして登録"}
            </div>
          </button>

          {/* 人物カード一覧 */}
          {people &&
            people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onEdit={() => setEditingPerson(person)}
                onMemorizationChange={handleMemorizationChange}
              />
            ))}
        </div>
      </main>

      {/* 追加モーダル */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="人物を登録"
        showLogo={false}
        showCloseButton={true}
      >
        <PersonForm
          onSubmit={handleAddPerson}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={!!editingPerson}
        onClose={() => setEditingPerson(null)}
        title="人物を編集"
        showCloseButton={true}
      >
        {editingPerson && (
          <PersonForm
            person={editingPerson}
            onSubmit={(data) => handleUpdatePerson(editingPerson.id, data)}
            onCancel={() => setEditingPerson(null)}
            onDelete={() => handleDeletePerson(editingPerson.id)}
          />
        )}
      </Modal>

      {/* アプリ設定シート */}
      <AppSettingsSheet
        isOpen={isAppSettingsOpen}
        onClose={() => setIsAppSettingsOpen(false)}
      />

      {/* 初回起動シート */}
      <FirstLaunchSheet
        isOpen={isFirstLaunchOpen}
        onClose={() => setIsFirstLaunchOpen(false)}
      />
    </div>
  );
}
