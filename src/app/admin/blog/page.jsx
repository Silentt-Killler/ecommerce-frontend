'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, EyeOff, Calendar, Clock, Tag,
  Image as ImageIcon, X, Save, ChevronDown, Upload, ExternalLink, FileText
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: '#6b7280' },
  { value: 'published', label: 'Published', color: '#10b981' },
  { value: 'scheduled', label: 'Scheduled', color: '#f59e0b' }
];

const CATEGORIES = [
  'Watches', 'Fashion', 'Beauty', 'Lifestyle', 'Tips & Guides', 'News', 'Reviews'
];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Editor Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    featured_image_alt: '',
    category: '',
    tags: [],
    status: 'draft',
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    no_index: false
  });
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [showSeoPanel, setShowSeoPanel] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [page, statusFilter, search]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `/blog/admin/posts?page=${page}&limit=20`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await api.get(url);
      setPosts(res.data.posts || []);
      setTotalPages(res.data.pages || 1);
      setStats(res.data.stats || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (post = null) => {
    if (post) {
      setEditingPost(post);
      setForm({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        featured_image: post.featured_image || '',
        featured_image_alt: post.featured_image_alt || '',
        category: post.category || '',
        tags: post.tags || [],
        status: post.status || 'draft',
        seo_title: post.seo_title || '',
        seo_description: post.seo_description || '',
        seo_keywords: post.seo_keywords || [],
        no_index: post.no_index || false
      });
    } else {
      setEditingPost(null);
      setForm({
        title: '', slug: '', content: '', excerpt: '', featured_image: '',
        featured_image_alt: '', category: '', tags: [], status: 'draft',
        seo_title: '', seo_description: '', seo_keywords: [], no_index: false
      });
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingPost(null);
    setShowSeoPanel(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    setSaving(true);
    try {
      if (editingPost) {
        await api.put(`/blog/admin/post/${editingPost._id}`, form);
        toast.success('Post updated');
      } else {
        await api.post('/blog/admin/posts', form);
        toast.success('Post created');
      }
      closeEditor();
      fetchPosts();
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await api.delete(`/blog/admin/post/${postId}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      await api.put(`/blog/admin/post/${postId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchPosts();
    } catch (e) {
      toast.error('Failed');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/blog/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ ...form, featured_image: res.data.url });
      toast.success('Image uploaded');
    } catch (e) {
      toast.error('Upload failed');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !form.seo_keywords.includes(keywordInput.trim())) {
      setForm({ ...form, seo_keywords: [...form.seo_keywords, keywordInput.trim()] });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setForm({ ...form, seo_keywords: form.seo_keywords.filter(k => k !== keyword) });
  };

  const generateSlug = () => {
    const slug = form.title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-');
    setForm({ ...form, slug });
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Blog Posts</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage your blog content for SEO</p>
        </div>
        <button onClick={() => openEditor()} style={{ padding: '12px 20px', backgroundColor: '#B08B5C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <Plus size={18} /> New Post
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.total || 0}</p>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Total Posts</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{stats.published || 0}</p>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Published</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#6b7280' }}>{stats.draft || 0}</p>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Drafts</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{stats.scheduled || 0}</p>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Scheduled</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." style={{ width: '100%', padding: '12px 12px 12px 44px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '12px 16px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Posts Table */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>POST</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>CATEGORY</th>
              <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>STATUS</th>
              <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>VIEWS</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>DATE</th>
              <th style={{ padding: 16, textAlign: 'right', color: '#9ca3af', fontSize: 12 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No posts found</td></tr>
            ) : posts.map((post, i) => (
              <tr key={post._id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 60, height: 40, backgroundColor: '#374151', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                      {post.featured_image && <img src={post.featured_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{post.title}</p>
                      <p style={{ color: '#6b7280', fontSize: 12 }}>/blog/{post.slug}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: 16 }}>
                  <span style={{ padding: '4px 10px', backgroundColor: '#374151', color: '#9ca3af', borderRadius: 4, fontSize: 12 }}>{post.category || '-'}</span>
                </td>
                <td style={{ padding: 16, textAlign: 'center' }}>
                  <select value={post.status} onChange={(e) => handleStatusChange(post._id, e.target.value)} style={{ padding: '6px 12px', backgroundColor: post.status === 'published' ? '#d1fae5' : post.status === 'scheduled' ? '#fef3c7' : '#374151', color: post.status === 'published' ? '#059669' : post.status === 'scheduled' ? '#b45309' : '#9ca3af', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
                <td style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>{post.views || 0}</td>
                <td style={{ padding: 16, color: '#9ca3af', fontSize: 13 }}>{formatDate(post.published_at || post.created_at)}</td>
                <td style={{ padding: 16, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    {post.status === 'published' && (
                      <a href={`/blog/${post.slug}`} target="_blank" style={{ padding: 8, backgroundColor: '#374151', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ExternalLink size={16} style={{ color: '#9ca3af' }} />
                      </a>
                    )}
                    <button onClick={() => openEditor(post)} style={{ padding: 8, backgroundColor: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                      <Edit size={16} style={{ color: '#9ca3af' }} />
                    </button>
                    <button onClick={() => handleDelete(post._id)} style={{ padding: 8, backgroundColor: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                      <Trash2 size={16} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 100, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
            <div style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
              {/* Editor Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottom: '1px solid #374151' }}>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>{editingPost ? 'Edit Post' : 'New Post'}</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setShowSeoPanel(!showSeoPanel)} style={{ padding: '10px 16px', backgroundColor: showSeoPanel ? '#B08B5C' : '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                    SEO Settings
                  </button>
                  <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={closeEditor} style={{ padding: 10, backgroundColor: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                    <X size={20} style={{ color: '#9ca3af' }} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex' }}>
                {/* Main Content */}
                <div style={{ flex: 1, padding: 24 }}>
                  {/* Title */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>TITLE *</label>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter post title..." style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 16, fontWeight: 600 }} />
                  </div>

                  {/* Slug */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>
                      URL SLUG
                      <button onClick={generateSlug} style={{ marginLeft: 8, padding: '2px 8px', backgroundColor: '#374151', border: 'none', borderRadius: 4, color: '#9ca3af', fontSize: 11, cursor: 'pointer' }}>Generate</button>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      <span style={{ padding: '14px 12px', backgroundColor: '#374151', color: '#6b7280', fontSize: 14, borderRadius: '8px 0 0 8px' }}>/blog/</span>
                      <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="post-url-slug" style={{ flex: 1, padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderLeft: 'none', borderRadius: '0 8px 8px 0', color: '#fff', fontSize: 14 }} />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>EXCERPT (Short description)</label>
                    <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary of the post..." rows={3} style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14, resize: 'vertical' }} />
                  </div>

                  {/* Content */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>CONTENT</label>
                    <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your blog post content here... (HTML supported)" rows={15} style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14, resize: 'vertical', fontFamily: 'monospace' }} />
                    <p style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>Supports HTML. Use &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;img&gt; tags for proper formatting.</p>
                  </div>
                </div>

                {/* Sidebar */}
                <div style={{ width: 320, padding: 24, borderLeft: '1px solid #374151', backgroundColor: '#111827' }}>
                  {/* Status */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>STATUS</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: 12, backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}>
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>

                  {/* Featured Image */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>FEATURED IMAGE</label>
                    {form.featured_image ? (
                      <div style={{ position: 'relative', marginBottom: 8 }}>
                        <img src={form.featured_image} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }} />
                        <button onClick={() => setForm({ ...form, featured_image: '' })} style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, backgroundColor: '#ef4444', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={14} style={{ color: '#fff' }} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24, backgroundColor: '#1f2937', border: '2px dashed #374151', borderRadius: 8, cursor: 'pointer' }}>
                        <Upload size={24} style={{ color: '#6b7280' }} />
                        <span style={{ color: '#6b7280', fontSize: 13 }}>Upload Image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      </label>
                    )}
                    <input type="text" value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} placeholder="Or paste image URL..." style={{ width: '100%', padding: 10, backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12, marginTop: 8 }} />
                  </div>

                  {/* Image Alt */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>IMAGE ALT TEXT</label>
                    <input type="text" value={form.featured_image_alt} onChange={(e) => setForm({ ...form, featured_image_alt: e.target.value })} placeholder="Describe the image..." style={{ width: '100%', padding: 10, backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 13 }} />
                  </div>

                  {/* Category */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>CATEGORY</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: 12, backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}>
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Tags */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>TAGS</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag..." style={{ flex: 1, padding: 10, backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 13 }} />
                      <button onClick={addTag} style={{ padding: '10px 14px', backgroundColor: '#374151', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Add</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {form.tags.map(tag => (
                        <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', backgroundColor: '#B08B5C20', color: '#B08B5C', borderRadius: 4, fontSize: 12 }}>
                          {tag}
                          <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Panel */}
              {showSeoPanel && (
                <div style={{ padding: 24, borderTop: '1px solid #374151', backgroundColor: '#111827' }}>
                  <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} /> SEO Settings
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>SEO TITLE (max 60 chars)</label>
                      <input type="text" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} placeholder={form.title || 'SEO optimized title...'} maxLength={60} style={{ width: '100%', padding: 12, backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }} />
                      <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{(form.seo_title || form.title).length}/60</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>META DESCRIPTION (max 160 chars)</label>
                      <textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} placeholder={form.excerpt || 'Meta description for search results...'} maxLength={160} rows={2} style={{ width: '100%', padding: 12, backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14, resize: 'none' }} />
                      <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{(form.seo_description || form.excerpt).length}/160</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>FOCUS KEYWORDS</label>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())} placeholder="Add keyword..." style={{ flex: 1, padding: 10, backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 13 }} />
                        <button onClick={addKeyword} style={{ padding: '10px 14px', backgroundColor: '#374151', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Add</button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {form.seo_keywords.map(kw => (
                          <span key={kw} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', backgroundColor: '#3b82f620', color: '#3b82f6', borderRadius: 4, fontSize: 12 }}>
                            {kw}
                            <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeKeyword(kw)} />
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.no_index} onChange={(e) => setForm({ ...form, no_index: e.target.checked })} style={{ width: 18, height: 18 }} />
                        No Index (Hide from search engines)
                      </label>
                    </div>
                  </div>

                  {/* Preview */}
                  <div style={{ marginTop: 24, padding: 16, backgroundColor: '#1f2937', borderRadius: 8 }}>
                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>GOOGLE PREVIEW</p>
                    <p style={{ color: '#1a0dab', fontSize: 18, marginBottom: 4, cursor: 'pointer' }}>{form.seo_title || form.title || 'Post Title'} | PRISMIN</p>
                    <p style={{ color: '#006621', fontSize: 13, marginBottom: 4 }}>https://prismin.com/blog/{form.slug || 'post-slug'}</p>
                    <p style={{ color: '#545454', fontSize: 13 }}>{form.seo_description || form.excerpt || 'Meta description will appear here...'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
