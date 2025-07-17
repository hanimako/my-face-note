import Image from "next/image";
/**
 * ホームページのヘッダーコンポーネント
 */
export function HomeHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          {/* アプリロゴ */}
          <Image
            src="/icons/app-icon.png"
            alt="アプリアイコン"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg object-cover"
          />
          <h1 className="text-xl font-bold text-gray-900">名前をおぼえる帳</h1>
        </div>
      </div>
    </header>
  );
}
