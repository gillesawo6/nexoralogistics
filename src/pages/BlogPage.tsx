import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { updatePageSeo } from '../services/seoService';
import { Clock, Tag, ArrowRight, User, Search } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState(() => storageService.getBlogs());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    updatePageSeo({
      title: 'Global Trade & Logistics Intelligence Blog | NEXORA',
      description: 'In-depth analysis, maritime trends, sustainable aviation fuel reports, and AI supply chain innovations from NEXORA research desks.',
    });
  }, []);

  const categories = ['All', 'Supply Chain AI', 'Global Trade', 'Maritime', 'Sustainability', 'Air Cargo'];

  const filteredBlogs = blogs.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-4">
            <span>NEXORA TRADE INTELLIGENCE</span>
          </div>
          <h1 className="font-heading font-black uppercase text-4xl sm:text-6xl md:text-7xl tracking-tight text-slate-950 dark:text-white leading-none">
            GLOBAL LOGISTICS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#0052cc] dark:via-[#38bdf8] to-slate-900 dark:to-white">
              INSIGHTS & REPORTS.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-gray-300 font-light max-w-2xl leading-relaxed">
            Thought leadership, regulatory trade changes, and technical breakthroughs in modern freight forwarding.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 bg-white dark:bg-[#070D1D] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-md">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-mono-tech focus:outline-none focus:border-[#0066FF]"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono-tech uppercase transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-md'
                    : 'bg-slate-50 dark:bg-[#0D1527] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 hover:border-[#0066FF]/40 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover brightness-[0.9] dark:brightness-[0.75] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-[#070D1D]/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 text-[11px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8] uppercase font-bold shadow-sm">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3 text-xs font-mono-tech text-slate-500 dark:text-gray-400">
                    <span>{post.publishedAt}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" />
                      {post.readingTimeMinutes} min read
                    </span>
                  </div>

                  <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white uppercase group-hover:text-[#0066FF] dark:group-hover:text-[#38bdf8] transition-colors line-clamp-2">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-slate-600 dark:text-gray-300 text-xs sm:text-sm font-light leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Author Footer */}
              <div className="p-6 pt-0 border-t border-slate-100 dark:border-white/5 mt-4">
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/20"
                    />
                    <div>
                      <div className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                        {post.author.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-500 font-mono-tech">
                        {post.author.role}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 group-hover:bg-[#0066FF] text-slate-700 dark:text-white group-hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
