/**
 * 画像ファイルを圧縮してDataURL形式で返す
 * - 最大サイズ240pxにリサイズ
 * - JPEG形式で70%品質で圧縮
 * - アスペクト比を保持
 *
 * @param file 圧縮対象の画像ファイル
 * @returns 圧縮された画像のDataURL文字列
 * @throws 画像の読み込みに失敗した場合
 */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // 目標サイズ: 240px
      const maxSize = 240;
      let { width, height } = img;

      // アスペクト比を保ちながらリサイズ
      if (width > height) {
        // 横長画像の場合
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        // 縦長画像の場合
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      // Canvasサイズを設定
      canvas.width = width;
      canvas.height = height;

      // リサイズされた画像をCanvasに描画
      ctx?.drawImage(img, 0, 0, width, height);

      // JPEG形式で70%品質で圧縮してDataURLに変換
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error("画像の読み込みに失敗しました"));
    };

    // FileオブジェクトからURLを作成して画像を読み込み
    img.src = URL.createObjectURL(file);
  });
}

/**
 * カメラで写真を撮影してFileオブジェクトを取得
 * - モバイルデバイスではカメラアプリが起動
 * - デスクトップではファイル選択ダイアログが表示
 *
 * @returns 撮影された画像のFileオブジェクト、キャンセル時はnull
 */
export function capturePhoto(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "user"; // カメラアプリを優先

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        resolve(null); // キャンセル時は null を返す
        return;
      }
      resolve(files[0]); // ファイルが選択された場合は File オブジェクトを返す
    };

    // ファイル選択ダイアログを自動表示
    input.click();
  });
}

/**
 * ギャラリーから画像を選択してFileオブジェクトを取得
 * - 画像ファイルのみ選択可能
 * - キャンセル時はnullを返す
 *
 * @returns 選択された画像のFileオブジェクト、キャンセル時はnull
 */
export function selectPhoto(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*"; // 画像ファイルのみ受け入れ

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        resolve(null); // キャンセル時は null を返す
        return;
      }
      resolve(files[0]); // ファイルが選択された場合は File オブジェクトを返す
    };

    // ファイル選択ダイアログを自動表示
    input.click();
  });
}
