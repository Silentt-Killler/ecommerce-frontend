// src/app/blog/[slug]/page.jsx


import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getPost(slug) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/post/${slug}`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

async function getRecentPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/recent?limit=5`, {
      next: { revalidate: 300 }
    });
    return res.json();
  } catch (error) {
    return [];
  }
}

// Dynamic Metadata
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | PRISMIN',
      description: 'The requested blog post could not be found.'
    };
  }

  return {
    title: `${post.seo_title || post.title} | PRISMIN`,
    description: post.seo_description || post.excerpt,
    keywords: post.seo_keywords || post.tags,
    authors: [{ name: post.author_name }],
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      images: post.og_image || post.featured_image ? [
        {
          url: post.og_image || post.featured_image,
          width: 1200,
          height: 630,
          alt: post.featured_image_alt || post.title
        }
      ] : [],
      url: `https://prismin.com/blog/${post.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: [post.og_image || post.featured_image]
    },
    alternates: {
      canonical: post.canonical_url || `https://prismin.com/blog/${post.slug}`
    },
    robots: post.no_index ? { index: false, follow: true } : { index: true, follow: true }
  };
}

export default async function BlogPostPage({ params }) {
  const [post, recentPosts] = await Promise.all([
    getPost(params.slug),
    getRecentPosts()
  ]);

  if (!post) {
    notFound();
  }

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.seo_description || post.excerpt,
    "image": post.featured_image,
    "author": {
      "@type": "Person",
      "name": post.author_name
    },
    "publisher": {
      "@type": "Organization",
      "name": "PRISMIN",
      "logo": {
        "@type": "ImageObject",
        "url": "https://prismin.com/logo.png"
      }
    },
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://prismin.com/blog/${post.slug}`
    },
    "keywords": post.tags?.join(", ") || post.seo_keywords?.join(", ")
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://prismin.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://prismin.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://prismin.com/blog/${post.slug}`
      }
    ]
  };

  const recentFiltered = (recentPosts || []).filter(p => p.slug !== post.slug).slice(0, 5);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <main style={{ backgroundColor: '#F7F7F7', minHeight: '100vh' }}>
        {/* Hero Image */}
        {post.featured_image && (
          <div style={{ width: '100%', height: 400, backgroundColor: '#0C0C0C', position: 'relative' }}>
            <img 
              src={post.featured_image} 
              alt={post.featured_image_alt || post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
          </div>
        )}

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
            <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: 14 }}>
              <li><Link href="/" style={{ color: '#919191', textDecoration: 'none' }}>Home</Link></li>
              <li style={{ color: '#919191' }}>/</li>
              <li><Link href="/blog" style={{ color: '#919191', textDecoration: 'none' }}>Blog</Link></li>
              <li style={{ color: '#919191' }}>/</li>
              <li style={{ color: '#0C0C0C' }}>{post.title?.substring(0, 30)}...</li>
            </ol>
          </nav>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 }}>
            {/* Main Content */}
            <article style={{ backgroundColor: '#fff', borderRadius: 16, padding: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {/* Category & Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                {post.category && (
                  <Link href={`/blog?category=${post.category}`} style={{ padding: '4px 12px', backgroundColor: '#B08B5C', color: '#fff', borderRadius: 4, fontSize: 12, fontWeight: 600, textDecoration: 'none', textTransform: 'uppercase' }}>
                    {post.category}
                  </Link>
                )}
                <span style={{ fontSize: 14, color: '#919191' }}>
                  {post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                </span>
                <span style={{ fontSize: 14, color: '#919191' }}>
                  • {post.reading_time || 3} min read
                </span>
              </div>

              {/* Title */}
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0C0C0C', marginBottom: 24, lineHeight: 1.3 }}>
                {post.title}
              </h1>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #E0E0E0' }}>
                <div style={{ width: 48, height: 48, backgroundColor: '#B08B5C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>{post.author_name?.charAt(0) || 'A'}</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>{post.author_name || 'Admin'}</p>
                  <p style={{ fontSize: 12, color: '#919191', margin: 0 }}>Author</p>
                </div>
              </div>

              {/* Content */}
              <div 
                className="blog-content"
                style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #E0E0E0' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', marginBottom: 12 }}>Tags:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {post.tags.map(tag => (
                      <Link key={tag} href={`/blog?tag=${tag}`} style={{ padding: '6px 14px', backgroundColor: '#f3f4f6', color: '#0C0C0C', borderRadius: 20, fontSize: 13, textDecoration: 'none' }}>
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div style={{ marginTop: 32, padding: 24, backgroundColor: '#f9fafb', borderRadius: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', marginBottom: 12 }}>Share this article:</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=https://prismin.com/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, backgroundColor: '#1877f2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>f</a>
                  <a href={`https://twitter.com/intent/tweet?url=https://prismin.com/blog/${post.slug}&text=${post.title}`} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, backgroundColor: '#1da1f2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>X</a>
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=https://prismin.com/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, backgroundColor: '#0077b5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>in</a>
                  <a href={`https://wa.me/?text=${post.title} https://prismin.com/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, backgroundColor: '#25d366', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>W</a>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside>
              {/* Recent Posts */}
              <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, position: 'sticky', top: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #B08B5C' }}>
                  Recent Posts
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recentFiltered.map(p => (
                    <Link key={p._id} href={`/blog/${p.slug}`} style={{ display: 'flex', gap: 12, textDecoration: 'none' }}>
                      <div style={{ width: 70, height: 70, backgroundColor: '#f3f4f6', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                        {p.featured_image && (
                          <img src={p.featured_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 4, lineHeight: 1.4 }}>
                          {p.title?.substring(0, 50)}...
                        </h4>
                        <span style={{ fontSize: 12, color: '#919191' }}>
                          {p.published_at ? new Date(p.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related Posts */}
              {post.related_posts && post.related_posts.length > 0 && (
                <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #B08B5C' }}>
                    Related Posts
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {post.related_posts.map(p => (
                      <Link key={p._id} href={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>
                        <div style={{ aspectRatio: '16/9', backgroundColor: '#f3f4f6', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                          {p.featured_image && (
                            <img src={p.featured_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                        <h4 style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', lineHeight: 1.4 }}>
                          {p.title}
                        </h4>
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
