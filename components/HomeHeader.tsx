/**
 * ホームページのヘッダーコンポーネント
 */
export function HomeHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* アプリロゴ */}
            <img
              src="/icons/app-icon.png"
              alt="アプリアイコン"
              className="w-8 h-8 rounded-lg object-cover border border-gray-200 shadow-sm"
            />
            <h1 className="text-xl font-bold text-gray-900">
              顔と名前をおぼえる帳
            </h1>
          </div>
          {/* 設定ボタン削除済み */}
        </div>
      </div>
    </header>
  );
}
