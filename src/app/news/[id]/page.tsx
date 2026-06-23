'use client';

import React, { useState, use } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Copy, 
  Download, 
  Bookmark, 
  TrendingUp, 
  ExternalLink,
  RotateCw,
  Video,
  FileCode,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { jsPDF } from 'jspdf';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Unwrap params using React.use()
  const { id: articleId } = use(params);
  
  const [scriptTab, setScriptTab] = useState<'overview' | 'short' | 'long' | 'seo'>('overview');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Fetch article details & related news
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const res = await fetch(`/api/news/${articleId}`);
      if (!res.ok) throw new Error('Article not found');
      const json = await res.json();
      setSaved(json.isSaved);
      return json;
    },
  });

  // Fetch or generate script mutation
  const scriptMutation = useMutation({
    mutationFn: async ({ regenerate }: { regenerate: boolean }) => {
      const res = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, regenerate }),
      });
      if (!res.ok) throw new Error('Failed to generate script');
      return res.json();
    },
    onSuccess: (data) => {
      refetch(); // update script status
    }
  });

  // Toggle Save news mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/news/${articleId}/save`, { method: 'POST' });
      if (!res.ok) throw new Error('Authentication required');
      return res.json();
    },
    onSuccess: (data) => {
      setSaved(data.saved);
    },
    onError: () => {
      router.push('/login');
    }
  });

  // Toggle Script bookmark mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async (scriptId: string) => {
      const res = await fetch(`/api/scripts/${scriptId}/bookmark`, { method: 'POST' });
      if (!res.ok) throw new Error('Authentication required');
      return res.json();
    },
    onSuccess: (data) => {
      setBookmarked(data.bookmarked);
    },
    onError: () => {
      router.push('/login');
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RotateCw size={36} className="text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading article details...</p>
          </div>
        </div>
      </div>
    );
  }

  const { article, related = [], hasScript, scriptId } = data || {};
  
  // If the script is generated, parse the content JSON
  let scriptData: any = null;
  if (scriptMutation.data?.script?.content) {
    scriptData = JSON.parse(scriptMutation.data.script.content);
  } else if (data?.hasScript && scriptId) {
    // If we loaded details and it already has a script, we should fetch it or we can trigger the POST endpoint without regenerate flag to get it cached
  }

  // Handle lazy loading script if it has script in DB
  const triggerScriptGeneration = (force = false) => {
    scriptMutation.mutate({ regenerate: force });
  };

  // If page loaded and it has script, load it
  if (hasScript && !scriptMutation.data && !scriptMutation.isPending && !scriptMutation.isError) {
    triggerScriptGeneration(false);
  }

  // Clipboard copy handler
  const handleCopy = () => {
    if (!scriptData) return;
    let textToCopy = '';
    
    if (scriptTab === 'overview') {
      textToCopy = `Hook:\n${scriptData.hook}\n\nWhat Happened:\n${scriptData.whatHappened}\n\nWhy It Matters:\n${scriptData.whyImportant}\n\nKey Facts:\n${scriptData.keyFacts.join('\n')}`;
    } else if (scriptTab === 'short') {
      textToCopy = scriptData.shortScript;
    } else if (scriptTab === 'long') {
      textToCopy = scriptData.youtubeScript;
    } else {
      textToCopy = `SEO Titles:\n${scriptData.seoTitles.join('\n')}\n\nThumbnails:\n${scriptData.thumbnailText.join('\n')}\n\nHashtags:\n${scriptData.hashtags.join(' ')}`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Plain Text
  const downloadTxt = () => {
    if (!scriptData) return;
    const content = `
NEWSSCRIPT AI GENERATED CONTENT SCRIPT
======================================
Article: ${article.title}
Source: ${article.sourceName}
Category: ${article.category}
Date: ${new Date().toLocaleDateString()}

1. HOOK:
${scriptData.hook}

2. WHAT HAPPENED:
${scriptData.whatHappened}

3. WHY IT MATTERS:
${scriptData.whyImportant}

4. KEY FACTS:
${scriptData.keyFacts.map((f: string) => `• ${f}`).join('\n')}

5. TIMELINE:
${scriptData.timeline.map((t: any) => `[${t.time}]: ${t.event}`).join('\n')}

6. EXPERT ANALYSIS:
${scriptData.expertAnalysis}

7. FUTURE IMPACT:
${scriptData.futureImpact}

8. 60-SECOND REEL SCRIPT:
${scriptData.shortScript}

9. 3-MINUTE YOUTUBE SCRIPT:
${scriptData.youtubeScript}

10. SEO SUGGESTIONS:
Titles:
${scriptData.seoTitles.map((t: string) => `- ${t}`).join('\n')}

Thumbnails:
${scriptData.thumbnailText.map((t: string) => `- ${t}`).join('\n')}

Keywords: ${scriptData.keywords.join(', ')}
Hashtags: ${scriptData.hashtags.join(' ')}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.title.replace(/[^\w\s]/g, '').slice(0, 30)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download PDF utilizing jsPDF and handling page-breaks
  const downloadPdf = () => {
    if (!scriptData) return;
    const doc = new jsPDF();
    let y = 15;
    const pageHeight = doc.internal.pageSize.height;

    const addText = (text: string, size = 10, fontStyle = 'normal') => {
      doc.setFont('helvetica', fontStyle);
      doc.setFontSize(size);
      const splitLines = doc.splitTextToSize(text, 180);
      for (const line of splitLines) {
        if (y + 8 > pageHeight) {
          doc.addPage();
          y = 15;
        }
        doc.text(line, 15, y);
        y += 6;
      }
      y += 4;
    };

    const addHeader = (text: string) => {
      if (y + 12 > pageHeight) {
        doc.addPage();
        y = 15;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(text, 15, y);
      y += 6;
      doc.setDrawColor(80, 80, 80);
      doc.line(15, y, 195, y);
      y += 8;
    };

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text("NewsScript AI Generated Script", 15, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | Article Source: ${article.sourceName}`, 15, y);
    y += 12;
    doc.setTextColor(0, 0, 0);

    // Section 1: Overview
    addHeader("1. HOOK & STORY OVERVIEW");
    addText(`Headline: ${article.title}`, 10, 'bold');
    addText(`Hook: ${scriptData.hook}`, 10, 'italic');
    addText(`Summary: ${scriptData.whatHappened}`, 10, 'normal');
    addText(`Why It Matters: ${scriptData.whyImportant}`, 10, 'normal');

    // Section 2: Key Facts
    addHeader("2. KEY FACTS & TIMELINE");
    scriptData.keyFacts.forEach((fact: string, idx: number) => {
      addText(`${idx + 1}. ${fact}`, 10, 'normal');
    });
    y += 4;
    scriptData.timeline.forEach((t: any) => {
      addText(`[${t.time}]: ${t.event}`, 9, 'normal');
    });

    // Section 3: Analysis
    addHeader("3. ANALYSIS & FUTURE OUTLOOK");
    addText(`Expert Analysis: ${scriptData.expertAnalysis}`, 10, 'normal');
    addText(`Future Impact: ${scriptData.futureImpact}`, 10, 'normal');

    // Section 4: Short Script
    addHeader("4. 60-SECOND VIDEO SCRIPT (SHORTS/REELS)");
    addText(scriptData.shortScript, 9, 'normal');

    // Section 5: YouTube Script
    addHeader("5. 3-MINUTE DETAILED YOUTUBE SCRIPT");
    addText(scriptData.youtubeScript, 9, 'normal');

    // Section 6: SEO Suggestions
    addHeader("6. SEO METADATA SUGGESTIONS");
    addText("Recommended Titles:", 10, 'bold');
    scriptData.seoTitles.forEach((t: string) => addText(`• ${t}`));
    y += 2;
    addText("Thumbnail Text Overlays:", 10, 'bold');
    scriptData.thumbnailText.forEach((t: string) => addText(`• ${t}`));
    y += 2;
    addText(`Keywords: ${scriptData.keywords.join(', ')}`);
    addText(`Hashtags: ${scriptData.hashtags.join(' ')}`);

    doc.save(`${article.title.replace(/[^\w\s]/g, '').slice(0, 30)}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Layout Grid: Article Details vs AI Generator */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Column 1: Article details (5 cols) */}
          <section className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-2xl border border-slate-900 p-6 space-y-6">
              
              {/* Category & Date */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] bg-slate-900 border border-slate-800 rounded px-2 py-0.5">
                  {article.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  Published {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight leading-snug">
                {article.title}
              </h1>

              {/* Source & Saving Actions */}
              <div className="flex items-center justify-between border-y border-slate-900 py-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Source:</span>
                  <span className="font-bold text-slate-300">{article.sourceName}</span>
                  {article.credibilityScore >= 0.8 && (
                    <span title="Credible publisher">
                      <ShieldCheck size={14} className="text-emerald-500" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSaveMutation.mutate()}
                    className={`flex items-center gap-1 rounded border px-2 py-1 transition-all cursor-pointer ${
                      saved 
                        ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-semibold' 
                        : 'border-slate-850 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bookmark size={12} className={saved ? 'fill-current' : ''} />
                    {saved ? 'Saved' : 'Save'}
                  </button>
                  
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 border border-slate-850 bg-slate-900 text-slate-400 hover:text-slate-200 rounded px-2 py-1"
                    >
                      <ExternalLink size={12} />
                      Source
                    </a>
                  )}
                </div>
              </div>

              {/* Article Image */}
              {article.urlToImage && (
                <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                </div>
              )}

              {/* Summary description */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300">Article Summary</h3>
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                  {article.content || article.description}
                </p>
              </div>

              {/* Scores breakdowns */}
              <div className="border-t border-slate-900 pt-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trending Metrics</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-2.5">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Recency</p>
                    <p className="text-slate-200 mt-1 font-semibold">{Math.round(article.recencyScore * 100)}%</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-2.5">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Credibility</p>
                    <p className="text-slate-200 mt-1 font-semibold">{Math.round(article.credibilityScore * 100)}%</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-2.5">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Social Signals</p>
                    <p className="text-slate-200 mt-1 font-semibold">{Math.round(article.engagementScore * 100)}%</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-2.5">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider font-bold text-indigo-400">Total Score</p>
                    <p className="text-indigo-400 mt-1 font-bold">{Math.round(article.trendingScore * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Related news widget */}
            {related.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-400">Related News</h3>
                <div className="space-y-3">
                  {related.map((rel: any) => (
                    <Link
                      key={rel.id}
                      href={`/news/${rel.id}`}
                      className="block p-3 rounded-xl border border-slate-900 bg-slate-900/10 hover:bg-slate-900/40 transition-colors"
                    >
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1 hover:text-indigo-400 transition-colors">
                        {rel.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">{rel.sourceName} • {new Date(rel.publishedAt).toLocaleDateString()}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Column 2: AI Script Panel (7 cols) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="glass-panel rounded-2xl border border-slate-900 p-6 flex flex-col min-h-[480px]">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100">AI Script Generator</h2>
                    <p className="text-[11px] text-slate-500">Transform this news into production scripts</p>
                  </div>
                </div>

                {scriptData && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBookmarkMutation.mutate(scriptMutation.data.script.id)}
                      className={`flex h-8 w-8 items-center justify-center rounded border transition-all cursor-pointer ${
                        bookmarked
                          ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                      title={bookmarked ? "Bookmarked script" : "Bookmark script"}
                    >
                      <Bookmark size={14} className={bookmarked ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={() => triggerScriptGeneration(true)}
                      disabled={scriptMutation.isPending}
                      className="flex h-8 px-3 items-center gap-1.5 rounded border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <RotateCw size={12} className={scriptMutation.isPending ? 'animate-spin' : ''} />
                      Regenerate
                    </button>
                  </div>
                )}
              </div>

              {/* Main AI Body */}
              <div className="flex-1 flex flex-col justify-center mt-6">
                {scriptMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RotateCw size={36} className="text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-350">Analyzing news & writing script...</p>
                    <p className="text-xs text-slate-500">Formulating Hook, Explainer, Reels & YouTube transcripts</p>
                  </div>
                ) : scriptMutation.isError ? (
                  <div className="text-center py-20 space-y-4">
                    <p className="text-red-400 text-sm">Failed to generate script. Please check your AI API configurations.</p>
                    <button
                      onClick={() => triggerScriptGeneration(false)}
                      className="inline-flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : !scriptData ? (
                  <div className="text-center py-20 space-y-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <FileCode size={28} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-slate-200">No Script Generated Yet</h3>
                      <p className="mx-auto max-w-sm text-xs text-slate-500 leading-relaxed">
                        Convert this article into engaging scripts with a single tap. Our system will generate timeline breakdowns, reel/shorts formatting, and detailed YouTube directions.
                      </p>
                    </div>
                    <button
                      onClick={() => triggerScriptGeneration(false)}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-600/40 transition-all cursor-pointer"
                    >
                      Generate Content Script
                    </button>
                  </div>
                ) : (
                  // Script Output Tabs & Viewer
                  <div className="flex-1 flex flex-col space-y-6">
                    
                    {/* Tabs bar */}
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-2 overflow-x-auto">
                      {[
                        { id: 'overview', name: 'Hook & Facts', icon: FileText },
                        { id: 'short', name: '60s Short Script', icon: Video },
                        { id: 'long', name: '3m YouTube Script', icon: FileCode },
                        { id: 'seo', name: 'SEO & Suggestions', icon: Tag },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const active = scriptTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setScriptTab(tab.id as any)}
                            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                              active
                                ? 'text-indigo-400 bg-indigo-500/15 border border-indigo-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                            }`}
                          >
                            <Icon size={12} />
                            {tab.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Tab Screen */}
                    <div className="flex-1 min-h-[300px] bg-slate-900/20 border border-slate-900 rounded-xl p-5 overflow-y-auto max-h-[500px]">
                      
                      {scriptTab === 'overview' && (
                        <div className="space-y-6 text-sm text-slate-350">
                          <div>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Attention Grabber Hook</h4>
                            <p className="italic leading-relaxed">"{scriptData.hook}"</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">What Happened Simply</h4>
                            <p className="leading-relaxed">{scriptData.whatHappened}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Why It Matters</h4>
                            <p className="leading-relaxed">{scriptData.whyImportant}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Timeline Details</h4>
                            <ul className="space-y-2">
                              {scriptData.timeline.map((t: any, idx: number) => (
                                <li key={idx} className="flex gap-2">
                                  <strong className="text-slate-300 font-bold min-w-[70px]">{t.time}:</strong>
                                  <span>{t.event}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {scriptTab === 'short' && (
                        <div className="space-y-4 text-xs font-mono text-slate-350 leading-relaxed whitespace-pre-line">
                          {scriptData.shortScript}
                        </div>
                      )}

                      {scriptTab === 'long' && (
                        <div className="space-y-4 text-xs font-mono text-slate-350 leading-relaxed whitespace-pre-line">
                          {scriptData.youtubeScript}
                        </div>
                      )}

                      {scriptTab === 'seo' && (
                        <div className="space-y-6 text-sm text-slate-350">
                          <div>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">SEO Title Suggestions</h4>
                            <ul className="list-disc pl-4 space-y-2">
                              {scriptData.seoTitles.map((title: string, idx: number) => (
                                <li key={idx} className="text-slate-300 font-medium">{title}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Thumbnail Overlay Suggestions</h4>
                            <ul className="list-disc pl-4 space-y-2">
                              {scriptData.thumbnailText.map((text: string, idx: number) => (
                                <li key={idx} className="text-slate-300 font-medium">{text}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900">
                            {scriptData.hashtags.map((h: string, idx: number) => (
                              <span key={idx} className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded">
                                {h}
                              </span>
                            ))}
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500"><strong className="font-semibold text-slate-400">SEO Keywords:</strong> {scriptData.keywords.join(', ')}</p>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Footer buttons: Copy & Exports */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-900 text-xs">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Copy size={14} />
                        {copied ? 'Copied!' : 'Copy Script'}
                      </button>
                      <button
                        onClick={downloadTxt}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Download size={14} />
                        Download TXT
                      </button>
                      <button
                        onClick={downloadPdf}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-650 px-4 py-2 font-bold text-white hover:bg-indigo-600 transition-all cursor-pointer"
                      >
                        <FileText size={14} />
                        Download PDF
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
