import React from "react";
import Image from "next/image";
import { Person } from "@/lib/db";

interface PersonCardProps {
  person: Person;
  onEdit: () => void;
  onMemorizationChange?: (
    personId: string,
    newStatus: "untried" | "learning" | "memorized"
  ) => void;
}

const getMemorizationPill = (
  person: Person,
  onMemorizationChange?: (
    personId: string,
    newStatus: "untried" | "learning" | "memorized"
  ) => void
) => {
  const config = {
    untried: {
      label: "未挑戦",
      className: "bg-gray-100 text-gray-600",
      next: "learning" as const,
    },
    learning: {
      label: "学習中",
      className: "bg-blue-100 text-blue-600",
      next: "memorized" as const,
    },
    memorized: {
      label: "覚えた",
      className: "bg-green-100 text-green-600",
      next: "untried" as const,
    },
  };

  const status = person.memorizationStatus;
  const configItem = config[status];

  const handleClick = () => {
    if (onMemorizationChange) {
      onMemorizationChange(person.id, configItem.next);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${configItem.className}`}
      aria-label={`記憶状態を変更: ${configItem.label} → ${
        config[configItem.next].label
      }`}
    >
      {configItem.label}
    </button>
  );
};

export function PersonCard({
  person,
  onEdit,
  onMemorizationChange,
}: PersonCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow relative">
      {/* Memorization Pill */}
      {getMemorizationPill(person, onMemorizationChange)}

      {/* Photo */}
      <div className="flex justify-center mb-3">
        {person.photo && person.photo.trim() !== "" ? (
          <Image
            src={person.photo}
            alt={person.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          // 画像がない場合：「No Image」を表示
          <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-xs font-medium">No Image</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center mb-2">
        <h3
          className="text-lg font-semibold text-gray-900 leading-tight"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {person.name}
        </h3>
      </div>

      {/* Department */}
      {person.department && (
        <div className="text-center mb-3">
          <p className="text-sm text-gray-600">{person.department}</p>
        </div>
      )}

      {/* Memo */}
      {person.memo && (
        <div className="mb-3">
          <p
            className="text-sm text-gray-500 text-center"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {person.memo}
          </p>
        </div>
      )}

      {/* Edit Button */}
      <div className="border-t border-gray-100 pt-3">
        <button
          onClick={onEdit}
          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
          aria-label={`${person.name}を編集`}
        >
          編集
        </button>
      </div>
    </div>
  );
}
