'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  Laptop, 
  Award, 
  Briefcase, 
  Film, 
  FlaskConical, 
  ArrowRight,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'overall', name: 'Overall', icon: Sparkles },
  { id: 'technology', name: 'Technology', icon: Laptop },
  { id: 'sports', name: 'Sports', icon: Award },
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'entertainment', name: 'Entertainment', icon: Film },
  { id: 'science', name: 'Science', icon: FlaskConical },
  { id: 'world', name: 'World', icon: Globe },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overall');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const handler = setTimeout(() => {
      setDebouncedSearch(e.target.value);
    }, 400);
    return () => clearTimeout(handler);
  };

  // Fetch news using React Query
  const { data: articles = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['news', activeTab, debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch 
        ? `/api/news?search=${encodeURIComponent(debouncedSearch)}`
        : `/api/news?category=${activeTab}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    },
  });

  const liveArticlesCount = articles.length;
  const lastUpdated = articles[0] ? new Date(articles[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM';

  const triggerForceRefresh = async () => {
    if (debouncedSearch) return; // refresh categories only
    await fetch(`/api/news?category=${activeTab}&forceRefresh=true`);
    refetch();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-slate-900 bg-slate-900/20 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            <TrendingUp size={12} className="animate-pulse" />
            Today's Trending News
          </div>
          
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            AI-Powered News Scripts
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
            Select any trending story below to analyze key facts and instantly generate viral scripts for YouTube, Reels, and TikTok.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-xl flex items-center focus-within:border-indigo-500/50 transition-all">
              <Search className="ml-3 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search trending news headlines..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-transparent border-0 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
              />
              {debouncedSearch && (
                <button 
                  onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}
                  className="mr-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Ticker / Status Metrics */}
          <div className="mt-8 flex justify-center items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              <span>Live Articles: <strong className="text-slate-300">{liveArticlesCount}</strong></span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>Last Refreshed: <strong className="text-slate-300">{lastUpdated}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
        {/* Categories Tab Bar */}
        {!debouncedSearch && (
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                      active 
                        ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon size={14} />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <button
              onClick={triggerForceRefresh}
              disabled={isFetching}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 transition-colors cursor-pointer ml-4 font-bold uppercase tracking-wider"
              title="Force Refresh Data"
            >
              <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        )}

        {debouncedSearch && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400">
              Showing search results for: <span className="text-indigo-400">"{debouncedSearch}"</span>
            </h2>
            <button 
              onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}
              className="text-xs text-slate-500 hover:text-slate-300 underline cursor-pointer"
            >
              Back to categories
            </button>
          </div>
        )}

        {/* News Feed Cards Grid */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl border border-slate-900 bg-slate-950 p-6 flex flex-col gap-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-20 w-24 rounded-lg bg-slate-900" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-slate-900" />
                      <div className="h-3 w-1/2 rounded bg-slate-900" />
                    </div>
                  </div>
                  <div className="h-16 rounded bg-slate-900 w-full" />
                  <div className="h-6 rounded bg-slate-900 w-1/3" />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-900 rounded-2xl">
              <p className="text-slate-500 text-sm">No trending articles found. Try refreshing or changing your filters.</p>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid gap-6 md:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {articles.map((art: any, index: number) => {
                  const scorePercentage = Math.round(art.trendingScore * 100);
                  const isHighlyCredible = art.credibilityScore >= 0.8;
                  
                  return (
                    <motion.div
                      key={art.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="glass-card rounded-2xl border border-slate-900 p-6 flex flex-col justify-between"
                    >
                      <div>
                        {/* Header Details */}
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] bg-slate-900/60 border border-slate-800 rounded px-2 py-0.5">
                            {art.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(art.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Middle Info */}
                        <div className="flex gap-4 mb-4">
                          <div className="flex-1">
                            <Link href={`/news/${art.id}`} className="block group">
                              <h3 className="text-base font-bold text-slate-200 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                {art.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                              {art.description}
                            </p>
                          </div>
                          
                          {/* Article Image */}
                          {art.urlToImage && (
                            <div className="relative h-20 w-24 flex-shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                              <img
                                src={art.urlToImage}
                                alt={art.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=300&auto=format&fit=crop';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Score and CTA */}
                      <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-2">
                        <div className="flex items-center gap-4">
                          {/* Circular/Badge Score Meter */}
                          <div className="flex items-center gap-1.5" title={`Trending score computed from: Recency (30%), Credibility (25%), Mentions (25%), Engagement (20%)`}>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 trending-badge-glow">
                              {scorePercentage}%
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Trend</span>
                          </div>

                          {/* Credibility shield */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-400">{art.sourceName}</span>
                            {isHighlyCredible && (
                              <span title="Highly Credible Source">
                                <ShieldCheck size={14} className="text-emerald-500" />
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/news/${art.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group cursor-pointer"
                        >
                          Generate Script
                          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-8 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} NewsScript AI. Designed for content creators & journalists.</p>
        </div>
      </footer>
    </div>
  );
}
