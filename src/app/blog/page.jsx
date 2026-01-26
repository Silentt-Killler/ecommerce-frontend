'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

// Sample blog data - replace with API call later
const sampleBlogs = [
  {
    _id: '1',
    slug: 'pakistani-fashion-trends-2026',
    title: 'Pakistani Fashion Trends to Watch in 2026',
    excerpt: 'Discover the latest trends in Pakistani fashion that are taking the world by storm. From traditional craftsmanship to modern silhouettes.',
    image: '/images/blog/blog-1.jpg',
    category: 'Fashion',
    author: 'PRISMIN Team',
    date: '2026-01-20',
    readTime: '5 min read'
  },
  {
    _id: '2',
    slug: 'skincare-routine-for-winter',
    title: 'Essential Skincare Routine for Winter',
    excerpt: 'Keep your skin glowing and healthy during the cold months with our expert-recommended skincare routine and product picks.',
    image: '/images/blog/blog-2.jpg',
    category: 'Beauty',
    author: 'PRISMIN Team',
    date: '2026-01-15',
    readTime: '4 min read'
  },
  {
    _id: '3',
    slug: 'styling-tips-for-formal-occasions',
    title: 'Styling Tips for Formal Occasions',
    excerpt: 'Learn how to put together the perfect outfit for weddings, parties, and formal events with our comprehensive styling guide.',
    image: '/images/blog/blog-3.jpg',
    category: 'Style Guide',
    author: 'PRISMIN Team',
    date: '2026-01-10',
    readTime: '6 min read'
  }
];

export default function BlogPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [blogs, setBlogs] = useState(sampleBlogs);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Header Spacer */}
      <div style={{ height: isMobile ? 56 : 70 }} />

      {/* Hero Section */}
      <div style={{ backgroundColor: '#F9FAFB', padding: isMobile ? '40px 16px' : '60px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 300, letterSpacing: isMobile ? 4 : 8, color: '#0C0C0C', marginBottom: 12, textTransform: 'uppercase' }}>
          Blog
        </h1>
        <p style={{ fontSize: isMobile ? 14 : 16, color: '#6B7280', maxWidth: 600, margin: '0 auto' }}>
          Fashion insights, beauty tips, and style inspiration curated for the modern woman
        </p>
      </div>

      {/* Blog Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '30px 16px 60px' : '50px 40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 24 : 32 }}>
          {blogs.map((blog) => (
            <Link key={blog._id} href={'/blog/' + blog.slug} style={{ textDecoration: 'none', display: 'block' }}>
              <article style={{ backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', border: '1px solid #F3F4F6', transition: 'all 0.3s' }}>
                {/* Image */}
                <div style={{ position: 'relative', aspectRatio: '16/10', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                  {blog.image ? (
                    <Image src={blog.image} alt={blog.title} fill style={{ objectFit: 'cover', transition: 'transform 0.3s' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB' }}>
                      No Image
                    </div>
                  )}
                  {/* Category Badge */}
                  <span style={{ position: 'absolute', top: 12, left: 12, padding: '6px 12px', backgroundColor: '#0C0C0C', color: '#FFFFFF', fontSize: 11, fontWeight: 500, borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {blog.category}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: isMobile ? 16 : 20 }}>
                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', fontSize: 12 }}>
                      <Calendar size={14} />
                      <span>{formatDate(blog.date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', fontSize: 12 }}>
                      <Clock size={14} />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, color: '#0C0C0C', marginBottom: 10, lineHeight: 1.4 }}>
                    {blog.title}
                  </h2>

                  {/* Excerpt */}
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {blog.excerpt}
                  </p>

                  {/* Read More */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B08B5C', fontSize: 13, fontWeight: 500 }}>
                    <span>Read More</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {blogs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: '#1F2937', marginBottom: 8 }}>No blog posts yet</h3>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Check back soon for fashion tips and style inspiration</p>
          </div>
        )}
      </div>
    </div>
  );
}
