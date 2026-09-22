import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Trash2, Calendar, Clock, ExternalLink } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { BlogPost } from '../../types';
import { updatePageSeo } from '../../services/seoService';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

export const BlogAdminPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBlogs = () => {
    setBlogs(storageService.getBlogs());
  };

  useEffect(() => {
    updatePageSeo({
      title: 'Blog & News Management | NEXORA Admin',
      description: 'Review logistics whitepapers, regulatory updates, and freight intelligence publications.',
    });
    loadBlogs();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      storageService.deleteBlog(deleteTarget.id);
      loadBlogs();
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete blog:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Blog &amp; Supply Chain Intelligence
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
            Total of {blogs.length} published whitepapers and market analyses.
          </p>
        </div>
      </div>

      <div className="relative font-mono-tech text-xs">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search articles by title, category, or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="h-40 rounded-xl overflow-hidden relative">
                <img
                  src={post.coverImage || post.image || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white font-mono-tech text-[10px] uppercase font-bold">
                  {post.category}
                </span>
              </div>

              <h3 className="font-heading font-bold text-base text-slate-950 dark:text-white uppercase line-clamp-2">
                {post.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-gray-300 font-sans line-clamp-2">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-3 text-[11px] font-mono-tech text-slate-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#0066FF]" />
                  {post.publishedAt || post.date || 'Recent'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  {post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : (post.readTime || '5 min read')}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <Link
                to={`/blog/${post.slug}`}
                className="text-xs font-mono-tech font-bold text-[#0066FF] dark:text-[#38bdf8] flex items-center gap-1 hover:underline"
              >
                <span>Read Article</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <button
                onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Persistent In-App Confirmation Modal for Article Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Intelligence Article"
        description="Are you sure you want to permanently delete this published whitepaper? It will no longer be visible on the public intelligence portal."
        itemName={deleteTarget?.title}
        itemBadge="Supply Chain Article"
        confirmText="Delete Article"
      />
    </div>
  );
};
