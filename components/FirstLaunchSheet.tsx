"use client";

import React from "react";

/**
 * 初回起動シートのプロパティ
 */
interface FirstLaunchSheetProps {
  isOpen: boolean; // シートの開閉状態
  onClose: () => void; // 閉じる時のコールバック
}

/**
 * 初回起動時に表示するシートコンポーネント
 * - アプリの説明とプライバシー情報を表示
 */
export function FirstLaunchSheet({ isOpen, onClose }: FirstLaunchSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end">
      {/* 背景オーバーレイ - インラインスタイルで透明度を確実に設定 */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        // 初期表示シートでは外側クリックでの閉じる動作を無効化
        // onClick={onClose}
      />

      {/* シート本体 - アニメーション効果を追加 */}
      <div className="relative w-full bg-white rounded-t-lg shadow-xl max-h-[90vh] overflow-y-auto sm:w-80 sm:h-full sm:rounded-l-lg sm:rounded-r-none sm:rounded-t-none transform transition-all duration-300 ease-out animate-slide-up">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">ようこそ</h2>
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
          {/* アプリ説明 */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                あの人、なんて名前だっけ…を防ぎます！
              </h3>
              <p className="text-sm text-gray-600">
                名前を覚えておきたい人を登録して、あとからクイズで復習できます。
              </p>
            </div>
          </div>

          {/* プライバシー情報 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3">
              個人情報について
            </h4>
            <div className="space-y-2 text-xs text-blue-800">
              <p>
                このアプリは、すべてのデータをあなたの端末だけに保存します。
              </p>
              <p>インターネットを通じた送信や共有は、一切行いません。</p>
              <p>安心してご利用ください。</p>
            </div>
          </div>

          {/* 開始ボタン */}
          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              はじめる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
