"use client";

import React, { useState, useEffect } from "react";
import { QuizSettings, db } from "@/lib/db";
import { Button } from "@/components/ui/Button";

/**
 * クイズ設定シートのプロパティ
 */
interface QuizSettingsSheetProps {
  isOpen: boolean; // シートの開閉状態
  onClose: () => void; // 閉じる時のコールバック
  settings: QuizSettings; // 現在の設定
  onSave: (settings: QuizSettings) => void; // 保存時のコールバック
}

/**
 * クイズ設定を管理するシートコンポーネント
 * - 出題対象、モード、自動昇格設定、部署フィルターの設定
 * - 設定画面を閉じた時に自動保存
 */
export function QuizSettingsSheet({
  isOpen,
  onClose,
  settings,
  onSave,
}: QuizSettingsSheetProps) {
  // フォームデータ（設定変更中の状態）
  const [formData, setFormData] = useState<QuizSettings>(settings);
  // 未保存の変更があるかどうか
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // シートが開かれた時に初期化
  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
      setHasUnsavedChanges(false);
    }
  }, [isOpen, settings]);

  /**
   * 設定変更時の処理（状態のみ更新、保存は行わない）
   * @param newData 新しい設定データ
   */
  const handleSettingChange = (newData: QuizSettings) => {
    setFormData(newData);
    setHasUnsavedChanges(true);
  };

  /**
   * 設定画面を閉じる時の処理
   * 未保存の変更がある場合のみ保存を実行
   */
  const handleClose = async () => {
    if (hasUnsavedChanges) {
      try {
        await db.saveQuizSettings(formData);
        onSave(formData);
      } catch (error) {
        console.error("設定の保存に失敗しました:", error);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end">
      {/* 背景オーバーレイ - インラインスタイルで透明度を確実に設定 */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={handleClose}
      />

      {/* シート本体 - アニメーション効果を追加 */}
      <div className="relative w-full bg-white rounded-t-lg shadow-xl max-h-[90vh] overflow-y-auto sm:w-80 sm:h-full sm:rounded-l-lg sm:rounded-r-none sm:rounded-t-none transform transition-all duration-300 ease-out animate-slide-up">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">クイズ設定</h2>
            {/* 未保存変更インジケーター */}
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-1 text-sm text-orange-600">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                <span>未保存</span>
              </div>
            )}
            {/* モバイル用ドラッグハンドル */}
            <div className="w-6 h-1 bg-gray-300 rounded-full sm:hidden"></div>
          </div>
          <button
            onClick={handleClose}
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
          {/* モード選択 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              出題モード
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="mode"
                  value="face-to-name"
                  checked={formData.mode === "face-to-name"}
                  onChange={(e) =>
                    handleSettingChange({
                      ...formData,
                      mode: e.target.value as "face-to-name" | "name-to-face",
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">顔 → 名前</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="mode"
                  value="name-to-face"
                  checked={formData.mode === "name-to-face"}
                  onChange={(e) =>
                    handleSettingChange({
                      ...formData,
                      mode: e.target.value as "face-to-name" | "name-to-face",
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">名前 → 顔</span>
              </label>
            </div>
          </div>

          {/* 自動昇格設定 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              自動昇格設定
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="autoPromotion"
                  value="off"
                  checked={formData.autoPromotion === "off"}
                  onChange={(e) =>
                    handleSettingChange({
                      ...formData,
                      autoPromotion: e.target.value as "off" | "2" | "3" | "4",
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">OFF</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="autoPromotion"
                  value="2"
                  checked={formData.autoPromotion === "2"}
                  onChange={(e) =>
                    handleSettingChange({
                      ...formData,
                      autoPromotion: e.target.value as "off" | "2" | "3" | "4",
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">2連続正解</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="autoPromotion"
                  value="3"
                  checked={formData.autoPromotion === "3"}
                  onChange={(e) =>
                    handleSettingChange({
                      ...formData,
                      autoPromotion: e.target.value as "off" | "2" | "3" | "4",
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">3連続正解</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="autoPromotion"
                  value="4"
                  checked={formData.autoPromotion === "4"}
                  onChange={(e) =>
                    handleSettingChange({
                      ...formData,
                      autoPromotion: e.target.value as "off" | "2" | "3" | "4",
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">4連続正解</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
