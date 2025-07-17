"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Person, db, MemorizationStatus } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { capturePhoto, selectPhoto, compressImage } from "@/lib/imageUtils";

interface PersonFormProps {
  person?: Person;
  onSubmit: (data: Omit<Person, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function PersonForm({
  person,
  onSubmit,
  onCancel,
  onDelete,
}: PersonFormProps) {
  const [formData, setFormData] = useState({
    name: person?.name || "",
    department: person?.department || "",
    memo: person?.memo || "",
    photo: person?.photo || "",
    memorizationStatus: person?.memorizationStatus || ("untried" as const),
    consecutiveCorrect: person?.consecutiveCorrect || 0,
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await db.getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error("所属データの読み込みに失敗しました:", error);
    }
  };

  const handlePhotoProcessing = async (file: File | null) => {
    if (!file) return;

    try {
      setIsLoading(true);
      const photo = await compressImage(file);
      setFormData((prev) => ({ ...prev, photo: photo }));
    } catch (error) {
      console.error("写真の処理に失敗しました:", error);
      alert("写真の処理に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoCapture = async () => {
    const file = await capturePhoto();
    await handlePhotoProcessing(file);
  };

  const handlePhotoSelect = async () => {
    const file = await selectPhoto();
    await handlePhotoProcessing(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("氏名を入力してください");
      return;
    }

    if (!formData.photo) {
      alert("写真を選択してください");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          顔写真
        </label>
        <div className="flex items-center space-x-4">
          {formData.photo ? (
            <Image
              src={formData.photo}
              alt="選択された写真"
              width={80}
              height={80}
              className="rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-gray-400 text-2xl">📷</span>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePhotoCapture}
              disabled={isLoading}
            >
              {isLoading ? "処理中..." : "撮影"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePhotoSelect}
              disabled={isLoading}
            >
              {isLoading ? "処理中..." : "選択"}
            </Button>
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          氏名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="氏名を入力"
          required
        />
      </div>

      {/* Department */}
      <div>
        <label
          htmlFor="department"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          所属/フロア
        </label>
        <input
          type="text"
          id="department"
          value={formData.department}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, department: e.target.value }))
          }
          list="departments"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="所属を入力"
        />
        <datalist id="departments">
          {departments.map((dept) => (
            <option key={dept} value={dept} />
          ))}
        </datalist>
      </div>

      {/* Memo */}
      <div>
        <label
          htmlFor="memo"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          メモ
        </label>
        <textarea
          id="memo"
          value={formData.memo}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, memo: e.target.value }))
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="メモを入力"
        />
      </div>

      {/* Memorization Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          記憶状態
        </label>
        <select
          value={formData.memorizationStatus}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              memorizationStatus: e.target.value as MemorizationStatus,
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="untried">未挑戦</option>
          <option value="learning">学習中</option>
          <option value="memorized">覚えた</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "処理中..." : "保存する"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isLoading}
          >
            削除
          </Button>
        )}
      </div>
    </form>
  );
}
