'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import { 
  ShieldAlert, 
  Database, 
  Sparkles, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  Clock, 
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

export default function AdminPage() {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch admin stats
  const { data: stats = {}, isLoading, refetch } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
  });

  // Force aggregation refresh
  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      // Trigger news aggregation for overall category to refresh
      await fetch('/api/news?category=overall&forceRefresh=true');
      await fetch('/api/news?category=technology&forceRefresh=true');
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={36} className="text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading admin console...</p>
          </div>
        </div>
      </div>
    );
  }

  const { summary = {}, apiStats = {}, categoryStats = [], apiKeysStatus = {}, recentActivity = [] } = stats;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 space-y-8">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
              <p className="text-xs text-slate-500">Monitor system latency, API usage statistics, and trigger manual content updates.</p>
            </div>
          </div>

          <button
            onClick={handleForceRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Trigger Force Aggregate
          </button>
        </div>

        {/* Summary Widgets Grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl border border-slate-900 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Articles</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{summary.totalArticles || 0}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <Database size={18} />
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-900 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Scripts Generated</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{summary.totalScripts || 0}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
              <Sparkles size={18} />
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-900 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Users</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{summary.totalUsers || 0}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <Users size={18} />
            </div>
          </div>
        </div>

        {/* API and Category Status Section */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Column 1: API Configuration Status (5 cols) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* Keys Status */}
            <div className="glass-panel rounded-2xl border border-slate-900 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Activity size={16} className="text-indigo-400" />
                Integration Status
              </h2>
              <div className="space-y-3 text-xs">
                {Object.entries(apiKeysStatus).map(([key, active]) => (
                  <div key={key} className="flex items-center justify-between border-b border-slate-900/60 pb-2.5">
                    <span className="font-semibold text-slate-400 capitalize">{key.replace('Api', ' API')}</span>
                    <div className="flex items-center gap-1">
                      {active ? (
                        <>
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span className="text-emerald-400 font-semibold">Active</span>
                        </>
                      ) : (
                        <>
                          {key === 'redis' || key === 'gemini' || key === 'openai' ? (
                            <span className="flex items-center gap-1 text-amber-500">
                              <AlertTriangle size={14} />
                              <span className="font-semibold">Local Fallback</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-600">
                              <XCircle size={14} />
                              <span className="font-semibold">Unconfigured</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown list */}
            <div className="glass-panel rounded-2xl border border-slate-900 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-200">Database Category Counts</h2>
              <div className="space-y-2 text-xs">
                {categoryStats.map((c: any) => (
                  <div key={c.category} className="flex items-center justify-between">
                    <span className="capitalize text-slate-400 font-semibold">{c.category}</span>
                    <span className="bg-slate-900 text-slate-350 border border-slate-850 px-2 py-0.5 rounded font-bold">{c.count}</span>
                  </div>
                ))}
                {categoryStats.length === 0 && (
                  <p className="text-slate-500 text-center py-2">No category articles recorded.</p>
                )}
              </div>
            </div>

          </section>

          {/* Column 2: Service Latencies & User activity logs (7 cols) */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Service Logs */}
            <div className="glass-panel rounded-2xl border border-slate-900 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-200">API Call Latency & Failures</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="pb-3">Service</th>
                      <th className="pb-3">Total Calls</th>
                      <th className="pb-3">Success Rate</th>
                      <th className="pb-3">Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {Object.entries(apiStats).map(([service, data]: any) => {
                      const successRate = Math.round((data.success / data.total) * 100);
                      return (
                        <tr key={service}>
                          <td className="py-3 font-semibold text-slate-200">{service}</td>
                          <td className="py-3">{data.total}</td>
                          <td className="py-3 font-bold text-emerald-400">{successRate}%</td>
                          <td className="py-3">{data.avgLatency}ms</td>
                        </tr>
                      );
                    })}
                    {Object.keys(apiStats).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500">No API calls logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Ticker */}
            <div className="glass-panel rounded-2xl border border-slate-900 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Clock size={16} className="text-indigo-400" />
                Recent User Action Logs
              </h2>
              <div className="space-y-3.5 text-xs">
                {recentActivity.map((log: any) => (
                  <div key={log.id} className="flex flex-col gap-1 border-l-2 border-indigo-650 pl-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-indigo-400">{log.action}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-300">{log.details}</p>
                    <p className="text-[10px] text-slate-500">Triggered by: {log.user?.email || 'Unknown'}</p>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No recent history events recorded.</p>
                )}
              </div>
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}
