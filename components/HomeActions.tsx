import { Person } from "@/lib/db";

/**
 * ホームページのアクション部分コンポーネント
 */
interface HomeActionsProps {
  people: Person[] | undefined;
  onQuizClick: () => void;
  onAppSettingsClick: () => void;
}

export function HomeActions({
  people,
  onQuizClick,
  onAppSettingsClick,
}: HomeActionsProps) {
  return (
    <div className="relative mb-6">
      {/* アプリ設定ボタン - 右上に小さく配置 */}
      <div className="absolute top-0 z-10 right-0">
        <button
          onClick={onAppSettingsClick}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-sm font-medium"
        >
          ⚙ アプリ設定
        </button>
      </div>

      {/* 名前当てクイズボタン - 中央に角丸カード風で配置 */}
      <div className="flex justify-center pt-12">
        <button
          onClick={onQuizClick}
          disabled={!people || people.length === 0}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md w-full p-6 transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-[1.02] hover:bg-gradient-to-br hover:from-[#f5faff] hover:to-[#e6f3ff] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">📋</div>
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
    </div>
  );
}
