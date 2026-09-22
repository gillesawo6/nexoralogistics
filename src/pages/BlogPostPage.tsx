import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { updatePageSeo } from '../services/seoService';
import { 
  ArrowLeft, 
  Clock, 
  Share2, 
  Calendar, 
  User, 
  Tag, 
  Check, 
  Bookmark 
} from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const blogs = storageService.getBlogs();
  const post = blogs.find((b) => b.slug === slug) || blogs[0];

  useEffect(() => {
    updatePageSeo({
      title: `${post.title} | NEXORA Trade Insights`,
      description: post.excerpt,
      type: 'article',
      image: post.coverImage,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': post.title,
        'image': [post.coverImage],
        'datePublished': post.publishedAt,
        'author': {
          '@type': 'Person',
          'name': post.author.name,
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'NEXORA LOGISTICS',
          'logo': 'https://nexoralogistics.com/logo.png',
        },
        'description': post.excerpt,
      }
    });
  }, [post]);

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-mono-tech text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>

        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono-tech text-slate-500 dark:text-gray-400 mb-4">
          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-[#0066FF]/20 text-[#0066FF] dark:text-[#38bdf8] border border-blue-200 dark:border-[#0066FF]/40 uppercase font-bold">
            {post.category}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {post.publishedAt}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readingTimeMinutes} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading font-black uppercase text-3xl sm:text-5xl md:text-6xl text-slate-950 dark:text-white tracking-tight leading-tight mb-8">
          {post.title}
        </h1>

        {/* Author Bio Header */}
        <div className="flex items-center justify-between gap-4 py-6 border-y border-slate-200 dark:border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-white/20"
            />
            <div>
              <div className="font-heading font-bold text-base text-slate-900 dark:text-white">
                {post.author.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-400 font-mono-tech">
                {post.author.role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="p-2.5 rounded-xl bg-white dark:bg-[#070D1D] hover:bg-slate-100 dark:hover:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              title="Share report"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured Cover Image */}
        <div className="w-full h-80 sm:h-[450px] rounded-3xl overflow-hidden mb-12 shadow-2xl relative">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover brightness-[0.9] dark:brightness-[0.8]"
          />
        </div>

        {/* Article Body */}
        <div className="max-w-none text-slate-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed font-light space-y-6">
          {(post.content || '').split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2">
          <span className="font-mono-tech text-xs text-slate-400 dark:text-gray-500 uppercase mr-2">TOPICS:</span>
          {(post.tags || []).map((tag, tIdx) => (
            <span
              key={tIdx}
              className="px-3 py-1 rounded-lg bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-xs font-mono-tech text-slate-700 dark:text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
};
