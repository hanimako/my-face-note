import { Person } from "@/lib/db";

/**
 * ホームページのアクション部分コンポーネント
 */
interface HomeActionsProps {
  people: Person[] | undefined;
  onQuizClick: () => void;
  onAppSettingsClick: () => void;
  showQuizButton?: boolean;
}

export function HomeActions({
  people,
  onQuizClick,
  onAppSettingsClick,
  showQuizButton = true,
}: HomeActionsProps) {
  return (
    <div className="relative mb-6">
      {/* アプリ設定ボタン - 右上に小さく配置 */}
      <div className="absolute top-0 z-10 right-0">
        <button
          onClick={onAppSettingsClick}
          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-sm transition-colors text-sm font-medium"
        >
          ⚙ アプリ設定
        </button>
      </div>

      {/* 名前当てクイズボタン - showQuizButtonがtrueのときのみ表示 */}
      {showQuizButton && (
        <div className="flex justify-center pt-12">
          <button
            onClick={onQuizClick}
            disabled={!people || people.length === 0}
            className="w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-gray-300 shadow-sm hover:shadow-md hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center py-2">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  名前当てクイズ
                </h3>
                <span className="text-lg">▶️</span>
              </div>
              <p className="text-sm text-gray-600">タップして挑戦</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
