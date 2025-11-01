"use client";

import { useState } from "react";
import Image from "next/image";
import { colors, buttons } from "@/constants/colors";

export default function ProductSidebar({
  categories,
  selectedCategory,
  onSelect,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // You should consider fetching the user role client-side only
  // if this component needs to be rendered without server-side user data.
  let isAdmin = false;
  try {
    // Note: window is not defined during server-side rendering (SSR)
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      isAdmin = user?.role === "super_admin";
    }
  } catch (e) {
    isAdmin = false;
  }

  // Common styling for both mobile and desktop views
  const categoryItemBaseClasses = "transition-all font-medium";

  return (
    <>
      {/* This single container handles both views:
        - Mobile (< 768px): flex, overflow-x-auto, whitespace-nowrap (horizontal scroll bar)
        - Desktop (>= 768px): md:block, md:w-64 (vertical sidebar container)
      */}
      <div 
        className="flex overflow-x-auto whitespace-nowrap space-x-2 p-2 
                   md:block md:w-64 md:space-x-0 md:p-0"
      >
        {/*
          This inner container controls the flow of the items:
          - Mobile: Default (flex row)
          - Desktop: md:flex-col and md:space-y-2 (vertical stack)
        */}
        <div className="md:flex md:flex-col md:space-y-2">
          {categories.map((cat) => {
            const isActive = String(selectedCategory) === String(cat._id);
            
            // Mobile (default) styles for the button
            let mobileClasses = `flex-shrink-0 px-4 py-2 rounded-full text-sm ${
                isActive 
                  ? "" // Active mobile style will be set via 'style' prop
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`;

            // Desktop (md:) styles for the button
            let desktopClasses = `md:w-full md:text-left md:px-4 md:py-3 md:rounded-lg ${
                // Desktop active style (when active)
                isActive 
                  ? "" 
                  // Desktop inactive style
                  : "md:text-neutral-600 md:hover:bg-neutral-100"
            }`;
            
            // Determine styles to apply via the 'style' prop (for dynamic colors)
            const styleProps = isActive 
              ? { 
                  // Active Mobile Style (from your original Mobile bar)
                  backgroundColor: buttons.primary.background, 
                  color: buttons.primary.text,
                  // Active Desktop Overrides (from your original Desktop sidebar)
                  // Note: Tailwind classes would be more performant than inline styles
                  // but we keep this to respect your original color variables.
                  // For a cleaner approach, you might need to adjust your 'buttons' constant.
                  // Using inline styles for background/text color for the active state
                  // to keep it close to your original logic.
                  // For desktop, you were using buttons.secondary.text for color.
                  // This applies to both, but you might need to refine the colors based on your design.
                  ... (window.innerWidth >= 768 ? { color: buttons.secondary.text } : {})
                }
              : {
                  // Inactive Desktop Background Color (from your original Desktop sidebar)
                  ... (window.innerWidth >= 768 ? { backgroundColor: colors.bgSec, color: buttons.secondary.text } : {})
                };
                
            return (
              <button
                key={cat._id}
                onClick={() => onSelect(cat._id)}
                style={styleProps}
                className={`${categoryItemBaseClasses} ${mobileClasses} ${desktopClasses}`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}