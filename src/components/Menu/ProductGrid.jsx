"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
// import AddItemModal from "./AddItemModal";

export default function ProductGrid({ categories, items, setItems, sectionRefs }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleItemAdded = (newItem) => {
    if (!newItem) return;
    setItems((prev) => [...prev, newItem]);
  };

  return (
    <div className="flex-1">
      {categories.map((cat) => {
        const filtered = items.filter((item) => {
          if (!item) return false;
          const catField = item.category;
          if (!catField) return false;
          // category may be an object ({ _id }) or a string id
          const itemCatId = typeof catField === "string" ? catField : (catField._id ?? catField.id);
          return itemCatId === cat._id;
        });

        return (
          <div
            key={cat._id}
            ref={(el) => (sectionRefs.current[cat._id] = el)}
            data-category={cat._id}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">{cat.name}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}

              {/* Add Item */}
              {/* <div
                onClick={() => {
                  setSelectedCategory(cat._id);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
              >
                + Add Item
              </div> */}
            </div>
            <hr className="mt-6 border-gray-200" />
          </div>
        );
      })}

      {/* <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryId={selectedCategory}
        onSuccess={handleItemAdded}
      /> */}
    </div>
  );
}
