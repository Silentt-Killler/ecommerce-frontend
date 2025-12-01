'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import api from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-muted">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>

      {categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/shop?category=${category.slug}`}
              className="group"
            >
              <div className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Image/Icon */}
                <div className="aspect-square bg-primary-100 flex items-center justify-center relative">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <FolderOpen size={64} className="text-muted" />
                  )}
                  <div className="absolute inset-0 bg-focus/0 group-hover:bg-focus/20 transition-colors" />
                </div>

                {/* Info */}
                <div className="p-4 text-center">
                  <h2 className="font-bold text-lg group-hover:text-gold transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-muted text-sm mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <p className="text-gold text-sm mt-2">
                    {category.product_count || 0} Products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderOpen size={64} className="mx-auto text-muted mb-4" />
          <p className="text-muted text-lg">No categories yet</p>
        </div>
      )}
    </div>
  );
}
