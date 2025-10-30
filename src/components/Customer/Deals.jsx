import { MessageCircle } from 'lucide-react';
import { colors } from '@/constants/colors';
import ProductCard from '@/components/Menu/ProductCard';
import { useEffect, useState } from 'react';

export default function Deals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const res = await fetch('/api/menu-items/by-category?category=Pizzas');
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch products');
        setProducts(json.data || []);
      } catch (err) {
        console.error('fetchProductsByCategory error', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, []);

  return (
    <section id="deals" className="mx-4 mt-20 rounded-3xl border p-6 sm:p-10 lg:mx-8" style={{ borderColor: colors.borderLight, backgroundColor: '#111111ff' }}>
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: 'Poppins', fontWeight: 600, color: colors.textDark }}>Pizza</h2>
        </div>
        {loading ? (
          <div className="mt-6 text-center text-gray-500">Loading products...</div>
        ) : error ? (
          <div className="mt-6 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="mt-6 text-center text-gray-500">No products found in this category</div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}