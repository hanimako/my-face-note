"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";

/**
 * アプリ設定シートのプロパティ
 */
interface AppSettingsSheetProps {
  isOpen: boolean; // シートの開閉状態
  onClose: () => void; // 閉じる時のコールバック
}

/**
 * アプリ設定を管理するシートコンポーネント
 * - 全データ削除機能
 */
export function AppSettingsSheet({ isOpen, onClose }: AppSettingsSheetProps) {
  // 削除確認ダイアログの表示状態
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * 全データ削除の処理
   */
  const handleClearAllData = async () => {
    if (
      !confirm("本当にすべてのデータを削除しますか？この操作は取り消せません。")
    ) {
      return;
    }

    try {
      await db.clearAllData();
      alert("すべてのデータを削除しました");
      setShowDeleteConfirm(false);
      onClose();
      window.location.reload(); // ページを再読み込み
    } catch (error) {
      console.error("データの削除に失敗しました:", error);
      alert("データの削除に失敗しました");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end">
      {/* 背景オーバーレイ - 透明度を下げて下の画面を薄く見えるように */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
      />

      {/* シート本体 - アニメーション効果を追加 */}
      <div className="relative w-full bg-white rounded-t-lg shadow-xl max-h-[90vh] overflow-y-auto sm:w-80 sm:h-full sm:rounded-l-lg sm:rounded-r-none sm:rounded-t-none transform transition-all duration-300 ease-out animate-slide-up">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">アプリ設定</h2>
            {/* モバイル用ドラッグハンドル */}
            <div className="w-6 h-1 bg-gray-300 rounded-full sm:hidden"></div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-6 pb-8">
          {/* 全データ削除 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-700 mb-3">
              データ管理
            </h3>
            <p className="text-xs text-red-600 mb-3">
              すべての人物データを削除します。この操作は取り消せません。
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full"
            >
              すべてのデータを削除
            </Button>
          </div>
        </div>

        {/* 削除確認ダイアログ */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 mx-4 max-w-sm transform transition-all duration-300 ease-out animate-scale-in">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">確認</h3>
              <p className="text-gray-600 mb-6">
                すべての利用者データと設定を削除します。この操作は取り消せません。
              </p>
              <div className="flex justify-between items-center">
                {/* 左側: 破壊的アクション（削除） */}
                <Button variant="destructive" onClick={handleClearAllData}>
                  削除する
                </Button>

                {/* 中央: 副次的アクション（キャンセル） */}
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  キャンセル
                </Button>

                {/* 右側: プレースホルダー（バランス調整） */}
                <div className="w-20"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
