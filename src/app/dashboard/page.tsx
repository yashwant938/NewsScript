'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, 
  Sparkles, 
  History, 
  User, 
  Clock, 
  ArrowRight,
  TrendingUp,
  FileCode,
  LogOut,
  ShieldAlert,
  RotateCw
} from 'lucide-react';
import Link from 'next/link';

function UserDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'saved';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync state with URL parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Fetch profile stats
  const { data: profile = {}, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
  });

  const { user = {}, savedArticles = [], bookmarkedScripts = [], history = [] } = profile;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Clock size={36} className="text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading user dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 space-y-8">
        
        {/* User Greeting Block */}
        <div className="glass-panel rounded-2xl border border-slate-900 p-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Welcome, {user.name || 'Creator'}</h1>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-center bg-slate-900 border border-slate-850 px-4 py-2 rounded-xl">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Saved Articles</p>
              <p className="text-slate-200 mt-1 font-bold text-sm">{savedArticles.length}</p>
            </div>
            <div className="text-center bg-slate-900 border border-slate-850 px-4 py-2 rounded-xl">
              <p className="text-indigo-400/80 font-semibold uppercase tracking-wider text-[10px]">Bookmarks</p>
              <p className="text-indigo-400 mt-1 font-bold text-sm">{bookmarkedScripts.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-slate-900 pb-2 gap-4">
          {[
            { id: 'saved', name: 'Saved News', icon: Bookmark },
            { id: 'history', name: 'Saved Scripts', icon: FileCode },
            { id: 'logs', name: 'Interaction History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  router.replace(`/dashboard?tab=${tab.id}`);
                }}
                className={`relative flex items-center gap-2 rounded px-3 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
                  active 
                    ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon size={14} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab display screens */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            
            {activeTab === 'saved' && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-6 md:grid-cols-2"
              >
                {savedArticles.map((art: any) => (
                  <div key={art.id} className="glass-card rounded-2xl border border-slate-900 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                        <span className="font-semibold text-slate-400 uppercase">{art.category}</span>
                        <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <Link href={`/news/${art.id}`}>
                        <h3 className="text-sm font-bold text-slate-200 line-clamp-2 hover:text-indigo-400 transition-colors">
                          {art.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-455 mt-1 line-clamp-2">{art.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 mt-4 text-xs">
                      <span className="text-slate-400 font-medium">{art.sourceName}</span>
                      <Link href={`/news/${art.id}`} className="text-indigo-455 hover:text-indigo-300 font-bold flex items-center gap-0.5">
                        Open details <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
                {savedArticles.length === 0 && (
                  <div className="col-span-2 text-center py-20 border border-dashed border-slate-900 rounded-2xl">
                    <p className="text-slate-500 text-sm">No saved news articles yet. Browse homepage to bookmark items.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-6 md:grid-cols-2"
              >
                {bookmarkedScripts.map((scr: any) => (
                  <div key={scr.id} className="glass-card rounded-2xl border border-slate-900 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                        <span className="font-semibold text-slate-400 uppercase">Script Bookmark</span>
                        <span>{new Date(scr.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Link href={`/news/${scr.articleId}`}>
                        <h3 className="text-sm font-bold text-slate-200 line-clamp-2 hover:text-indigo-400 transition-colors">
                          {scr.article?.title || 'Story Script'}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-455 mt-1 line-clamp-2">
                        Script generated successfully for {scr.article?.sourceName || 'NewsSource'}.
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 mt-4 text-xs">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                        Active Script
                      </span>
                      <Link href={`/news/${scr.articleId}`} className="text-indigo-455 hover:text-indigo-300 font-bold flex items-center gap-0.5">
                        Read & Download <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
                {bookmarkedScripts.length === 0 && (
                  <div className="col-span-2 text-center py-20 border border-dashed border-slate-900 rounded-2xl">
                    <p className="text-slate-500 text-sm">No bookmarked scripts yet. Open an article details page to generate scripts.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-panel border border-slate-900 rounded-2xl p-6 max-w-2xl mx-auto space-y-4"
              >
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-900">
                  <Clock size={16} className="text-indigo-400" />
                  Your Interactive Activity Log
                </h3>
                <div className="space-y-4">
                  {history.map((log: any) => (
                    <div key={log.id} className="flex flex-col gap-1 border-l-2 border-slate-800 pl-3.5 text-xs text-slate-350">
                      <div className="flex items-center justify-between text-[10px] text-slate-550">
                        <span className="font-bold text-indigo-400/90">{log.action}</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300 font-medium">{log.details}</p>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <p className="text-slate-500 text-center py-4">No recent history events found.</p>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RotateCw size={36} className="text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading user dashboard...</p>
          </div>
        </div>
      </div>
    }>
      <UserDashboardContent />
    </Suspense>
  );
}

