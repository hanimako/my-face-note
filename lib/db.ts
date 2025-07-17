import { openDB, DBSchema, IDBPDatabase } from "idb";

/**
 * 記憶状態を表す型
 * - untried: 未学習
 * - learning: 学習中
 * - memorized: 記憶済み
 */
export type MemorizationStatus = "untried" | "learning" | "memorized";

/**
 * 人物情報を表すインターフェース
 */
export interface Person {
  id: string;
  name: string;
  department?: string;
  memo?: string;
  photo: string; // base64 encoded image
  memorizationStatus: MemorizationStatus;
  consecutiveCorrect: number; // 連続正解回数
  createdAt: Date;
  updatedAt: Date;
}

/**
 * クイズ設定を表すインターフェース
 */
export interface QuizSettings {
  mode: "face-to-name" | "name-to-face"; // モード: 顔→名前 or 名前→顔
  autoPromotion: "off" | "2" | "3" | "4"; // 自動昇格設定
}

/**
 * IndexedDBのスキーマ定義
 */
interface MyFaceNoteDB extends DBSchema {
  people: {
    key: string;
    value: Person;
    indexes: { "by-department": string }; // 部署別インデックス
  };
  departments: {
    key: string;
    value: { name: string; count: number }; // 部署名と人数
  };
  quizSettings: {
    key: string;
    value: QuizSettings & { id: string };
  };
}

/**
 * IndexedDBを使用したデータベースサービス
 * - 人物情報の管理
 * - 部署情報の管理
 * - クイズ設定の管理
 */
class DatabaseService {
  private db: IDBPDatabase<MyFaceNoteDB> | null = null;

  /**
   * データベースを初期化
   * @returns データベースインスタンス
   */
  async init() {
    if (this.db) return this.db;

    this.db = await openDB<MyFaceNoteDB>("my-face-note", 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          // People store - 人物情報を格納
          const peopleStore = db.createObjectStore("people", { keyPath: "id" });
          peopleStore.createIndex("by-department", "department");

          // Departments store - 部署情報を格納（オートコンプリート用）
          db.createObjectStore("departments", { keyPath: "name" });

          // Quiz settings store - クイズ設定を格納
          db.createObjectStore("quizSettings", { keyPath: "id" });
        }
      },
    });

    return this.db;
  }

  /**
   * 新しい人物を追加
   * @param person 人物情報（ID、作成日時、更新日時は自動設定）
   * @returns 生成されたID
   */
  async addPerson(
    person: Omit<Person, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const db = await this.init();
    const id = crypto.randomUUID();
    const now = new Date();

    // 新規人物オブジェクトを作成（初期状態）
    const newPerson: Person = {
      ...person,
      id,
      memorizationStatus: "untried",
      consecutiveCorrect: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.add("people", newPerson);

    // 部署が指定されている場合は部署カウントを更新
    if (person.department) {
      await this.updateDepartmentCount(person.department);
    }

    return id;
  }

  /**
   * 人物情報を更新
   * @param id 更新対象の人物ID
   * @param updates 更新内容
   */
  async updatePerson(
    id: string,
    updates: Partial<Omit<Person, "id" | "createdAt">>
  ): Promise<void> {
    const db = await this.init();
    const person = await db.get("people", id);
    if (!person) throw new Error("Person not found");

    // 更新日時を自動設定
    const updatedPerson: Person = {
      ...person,
      ...updates,
      updatedAt: new Date(),
    };

    await db.put("people", updatedPerson);

    // 部署が変更された場合は部署カウントを更新
    if (updates.department !== person.department) {
      if (person.department) {
        await this.updateDepartmentCount(person.department, -1); // 旧部署のカウントを減らす
      }
      if (updates.department) {
        await this.updateDepartmentCount(updates.department); // 新部署のカウントを増やす
      }
    }
  }

  /**
   * 記憶状態と連続正解回数を更新
   * @param id 更新対象の人物ID
   * @param status 新しい記憶状態
   * @param consecutiveCorrect 連続正解回数（省略時は既存値を維持）
   */
  async updateMemorizationStatus(
    id: string,
    status: MemorizationStatus,
    consecutiveCorrect?: number
  ): Promise<void> {
    const db = await this.init();
    const person = await db.get("people", id);
    if (!person) throw new Error("Person not found");

    const updatedPerson: Person = {
      ...person,
      memorizationStatus: status,
      consecutiveCorrect: consecutiveCorrect ?? person.consecutiveCorrect,
      updatedAt: new Date(),
    };

    await db.put("people", updatedPerson);
  }

  /**
   * 人物を削除
   * @param id 削除対象の人物ID
   */
  async deletePerson(id: string): Promise<void> {
    const db = await this.init();
    const person = await db.get("people", id);
    if (!person) throw new Error("Person not found");

    await db.delete("people", id);

    // 部署が設定されている場合は部署カウントを更新
    if (person.department) {
      await this.updateDepartmentCount(person.department, -1);
    }
  }

  /**
   * 人物一覧を取得（フィルター適用可能）
   * @param filter フィルター条件
   * @returns 人物一覧（作成日時の降順）
   */
  async getPeople(filter?: {
    department?: string;
    unmemorizedOnly?: boolean;
  }): Promise<Person[]> {
    const db = await this.init();
    let people = await db.getAll("people");

    // フィルターを適用
    if (filter?.department) {
      people = people.filter((p) => p.department === filter.department);
    }
    if (filter?.unmemorizedOnly) {
      people = people.filter((p) => p.memorizationStatus !== "memorized");
    }

    // 作成日時の降順でソート
    return people.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * 全データ数を取得（フィルター適用なし）
   * @returns 全データ数
   */
  async getTotalPeopleCount(): Promise<number> {
    const db = await this.init();
    const people = await db.getAll("people");
    return people.length;
  }

  /**
   * 「覚えた」以外のデータ数を取得
   * @returns 「覚えた」以外のデータ数
   */
  async getUnmemorizedPeopleCount(): Promise<number> {
    const db = await this.init();
    const people = await db.getAll("people");
    return people.filter((p) => p.memorizationStatus !== "memorized").length;
  }

  /**
   * 部署一覧を取得（人数の降順で上位10件）
   * @returns 部署名の配列
   */
  async getDepartments(): Promise<string[]> {
    const db = await this.init();
    const departments = await db.getAll("departments");
    return departments
      .sort((a, b) => b.count - a.count) // 人数の降順でソート
      .slice(0, 10) // 上位10件を取得
      .map((d) => d.name);
  }

  /**
   * 部署の人数カウントを更新
   * @param department 部署名
   * @param increment 増減値（デフォルト: +1）
   */
  private async updateDepartmentCount(
    department: string,
    increment: number = 1
  ): Promise<void> {
    const db = await this.init();
    const existing = await db.get("departments", department);

    if (existing) {
      const newCount = existing.count + increment;
      if (newCount <= 0) {
        // 人数が0以下になった場合は削除
        await db.delete("departments", department);
      } else {
        // 人数を更新
        await db.put("departments", { name: department, count: newCount });
      }
    } else if (increment > 0) {
      // 新規部署の場合は追加
      await db.add("departments", { name: department, count: 1 });
    }
  }

  /**
   * クイズ設定を保存
   * @param settings 保存する設定
   */
  async saveQuizSettings(settings: QuizSettings): Promise<void> {
    const db = await this.init();
    await db.put("quizSettings", {
      id: "current",
      mode: settings.mode,
      autoPromotion: settings.autoPromotion || "off",
    });
  }

  /**
   * クイズ設定を取得（デフォルト値付き）
   * @returns クイズ設定
   */
  async getQuizSettings(): Promise<QuizSettings> {
    const db = await this.init();
    const settings = await db.get("quizSettings", "current");
    return (
      settings || {
        mode: "face-to-name",
        autoPromotion: "off",
      }
    );
  }

  /**
   * 全データを削除（リセット機能用）
   */
  async clearAllData(): Promise<void> {
    const db = await this.init();
    await db.clear("people");
    await db.clear("departments");
    await db.clear("quizSettings");
  }
}

// シングルトンインスタンスをエクスポート
export const db = new DatabaseService();
