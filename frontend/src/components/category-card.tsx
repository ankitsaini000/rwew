import React from 'react';

interface CategoryCardProps {
  icon: string;
  title: string;
  onClick?: () => void;
}

export function CategoryCard({ icon, title, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </button>
  );
}