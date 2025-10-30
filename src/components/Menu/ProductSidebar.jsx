"use client";

import { useState } from "react";
import Image from "next/image";
import { colors ,buttons } from "@/constants/colors";

export default function ProductSidebar({
  categories,
  selectedCategory,
  onSelect,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  
  let isAdmin = false;
  try {
    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : null;
    isAdmin = user?.role === "super_admin";
  } catch (e) {
    isAdmin = false;
  }

  return (
    <>
      {/* Mobile Category Bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200" style={{ backgroundColor: colors.bgPrimary, color: colors.textDark}}>
        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = String(selectedCategory) === String(cat._id);
            return (
              <button
                key={cat._id}
                onClick={() => onSelect(cat._id)}
                style={
                  isActive
                    ? { backgroundColor: buttons.primary.background, color: buttons.primary.text }
                    : undefined
                }
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive ? "" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-neutral-200 sticky top-0 h-screen overflow-y-auto" style={{ backgroundColor: colors.bgPrimary, color: colors.textDark}}>
        <div className="p-6">
          <nav className="space-y-1">
            {categories.map((cat) => {
              const isActive = String(selectedCategory) === String(cat._id);
              return (
                <button
                  key={cat._id}
                  onClick={() => onSelect(cat._id)}
                  style={
                    isActive
                      ? { backgroundColor: buttons.primary.background, color: buttons.secondary.text }
                      : { backgroundColor: colors.bgSec, color: buttons.secondary.text }
                  }
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive ? "" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}