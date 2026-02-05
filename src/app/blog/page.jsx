// src/app/blog/page.jsx
// Blog Listing Page - Fixed for Server Component

import Link from 'next/link';

export const metadata = {
  title: 'Blog - Tips, Guides & News | PRISMIN',
  description: 'Discover the latest fashion tips, watch guides, beauty secrets, and lifestyle articles. Expert advice for Bangladesh shoppers.',
  keywords: ['blog', 'fashion tips', 'watch guide', 'beauty tips', 'bangladesh shopping'],
  openGraph: {
    title: 'Blog - Tips, Guides & News | PRISMIN',
    description: 'Discover the latest fashion tips, watch guides, beauty secrets, and lifestyle articles.',
    type: 'website',
    url: 'https://prismin.com/blog',
  },
  alternates: {
    canonical: 'https://prismin.com/blog'
  }
};

async function getPosts(page = 1, category = null) {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/blog/posts?page=${page}&limit=12`;
    if (category) url += `&category=${category}`;
    
    const res = await fetch(url, { 
      next: { revalidate: 300 }
    });
    if (!res.ok) return { posts: [], total: 0, pages: 1 };
    return res.json();
  } catch (error) {
    return { posts: [], total: 0, pages: 1 };
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/categories`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}

async function getRecentPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/recent?limit=5`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function BlogPage({ searchParams }) {
  const page = Number(searchParams?.page) || 1;
  const category = searchParams?.category || null;
  
  const [postsData, categories, recentPosts] = await Promise.all([
    getPosts(page, category),
    getCategories(),
    getRecentPosts()
  ]);

  const posts = postsData?.posts || [];
  const total = postsData?.total || 0;
  const pages = postsData?.pages || 1;

  // JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "PRISMIN Blog",
    "description": "Tips, guides, and news about fashion, watches, and beauty",
    "url": "https://prismin.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "PRISMIN",
      "logo": {
        "@type": "ImageObject",
        "url": "https://prismin.com/logo.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <main style={{ backgroundColor: '#F7F7F7', minHeight: '100vh' }}>
        {/* Hero Section */}
        <section style={{ backgroundColor: '#0C0C0C', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              Our Blog
            </h1>
            <p style={{ fontSize: 16, color: '#9ca3af', lineHeight: 1.6 }}>
              Expert tips, guides, and insights about fashion, watches, beauty, and lifestyle
            </p>
          </div>
        </section>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40 }}>
            {/* Main Content */}
            <div>
              {/* Category Filter */}
              {categories && categories.length > 0 && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
                  <Link href="/blog" style={{ padding: '8px 16px', backgroundColor: !category ? '#0C0C0C' : '#fff', color: !category ? '#fff' : '#0C0C0C', borderRadius: 20, fontSize: 14, textDecoration: 'none', border: '1px solid #E0E0E0' }}>
                    All
                  </Link>
                  {categories.map(cat => (
                    <Link key={cat.name} href={`/blog?category=${cat.name}`} style={{ padding: '8px 16px', backgroundColor: category === cat.name ? '#0C0C0C' : '#fff', color: category === cat.name ? '#fff' : '#0C0C0C', borderRadius: 20, fontSize: 14, textDecoration: 'none', border: '1px solid #E0E0E0' }}>
                      {cat.name} ({cat.count})
                    </Link>
                  ))}
                </div>
              )}

              {/* Posts Grid */}
              {posts.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                  {posts.map(post => (
                    <article key={post._id} style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                        <div style={{ aspectRatio: '16/9', backgroundColor: '#f3f4f6', position: 'relative' }}>
                          {post.featured_image && (
                            <img 
                              src={post.featured_image} 
                              alt={post.featured_image_alt || post.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div style={{ padding: 20 }}>
                          {post.category && (
                            <span style={{ fontSize: 12, color: '#B08B5C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {post.category}
                            </span>
                          )}
                          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', margin: '8px 0', lineHeight: 1.4 }}>
                            {post.title}
                          </h2>
                          <p style={{ fontSize: 14, color: '#919191', lineHeight: 1.6, marginBottom: 12 }}>
                            {post.excerpt?.substring(0, 120)}...
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#919191' }}>
                            <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                            <span>{post.reading_time || 3} min read</span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 60, backgroundColor: '#fff', borderRadius: 12 }}>
                  <p style={{ color: '#919191' }}>No posts found</p>
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <Link
                      key={p}
                      href={`/blog?page=${p}${category ? `&category=${category}` : ''}`}
                      style={{
                        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: p === page ? '#0C0C0C' : '#fff',
                        color: p === page ? '#fff' : '#0C0C0C',
                        borderRadius: 8, textDecoration: 'none', fontSize: 14,
                        border: '1px solid #E0E0E0'
                      }}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside>
              {/* Recent Posts */}
              <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #B08B5C' }}>
                  Recent Posts
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(recentPosts || []).map(post => (
                    <Link key={post._id} href={`/blog/${post.slug}`} style={{ display: 'flex', gap: 12, textDecoration: 'none' }}>
                      <div style={{ width: 60, height: 60, backgroundColor: '#f3f4f6', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                        {post.featured_image && (
                          <img src={post.featured_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 4, lineHeight: 1.4 }}>
                          {post.title?.substring(0, 50)}...
                        </h4>
                        <span style={{ fontSize: 12, color: '#919191' }}>
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {categories && categories.length > 0 && (
                <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #B08B5C' }}>
                    Categories
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {categories.map(cat => (
                      <Link key={cat.name} href={`/blog?category=${cat.name}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#0C0C0C', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ fontSize: 14 }}>{cat.name}</span>
                        <span style={{ fontSize: 12, color: '#919191' }}>({cat.count})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
