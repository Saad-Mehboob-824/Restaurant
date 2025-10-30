"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from '@/components/Menu/ProductCard';
import { colors, buttons } from "@/constants/colors";

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu');
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch menu');
        // `json.data` is expected to be array of { category, image, items }
        const flattened = (json.data || []).flatMap((group) => {
          const categoryName = group.category || '';
          return (group.items || []).map((it) => ({ ...it, _categoryName: categoryName }));
        });
        if (mounted) setItems(flattened);
      } catch (err) {
        console.error('fetchMenu error', err);
        if (mounted) setError('Failed to load menu');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMenu();
    return () => { mounted = false; };
  }, []);

  // styles
  const cardBg = "#ffffff"; // keep cards white for contrast
  const accent = colors?.primary || '#1EB980';
  const btnText = (buttons && buttons.primary && buttons.primary.text) || '#031017';

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold" style={{ color: colors.textDark }}>Explore Menu</h3>
          <Link href="/menu" className="text-sm font-semibold uppercase" style={{ color: accent }}>View All</Link>
        </div>

        {loading ? (
          <div className="text-center text-neutral-400 py-12">Loading menu…</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center text-neutral-400 py-12">No items available</div>
        ) : (
          <div className="relative">
            <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
              <div className="flex gap-6" style={{ paddingBottom: 4 }}>
                {items.map((product) => (
                  <div key={product._id} className="min-w-[220px] max-w-[260px] flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
