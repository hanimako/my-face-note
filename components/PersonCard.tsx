import React from "react";
import Image from "next/image";
import { Person } from "@/lib/db";

interface PersonCardProps {
  person: Person;
  onEdit: () => void;
}

const getMemorizationPill = (person: Person) => {
  const config = {
    untried: {
      label: "未挑戦",
      className: "bg-gray-100 text-gray-600",
    },
    learning: {
      label: "学習中",
      className: "bg-blue-100 text-blue-600",
    },
    memorized: {
      label: "覚えた",
      className: "bg-green-100 text-green-600",
    },
  };

  const status = person.memorizationStatus;
  const configItem = config[status];

  return (
    <div
      className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${configItem.className}`}
    >
      {configItem.label}
    </div>
  );
};

export function PersonCard({ person, onEdit }: PersonCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow relative">
      {/* Memorization Pill */}
      {getMemorizationPill(person)}

      {/* Photo */}
      <div className="flex justify-center mb-3">
        <Image
          src={person.photo}
          alt={person.name}
          width={80}
          height={80}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
        />
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
