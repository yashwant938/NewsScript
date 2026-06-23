'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  FileText, 
  Search, 
  TrendingUp, 
  Bookmark, 
  History, 
  Settings, 
  LogOut, 
  User, 
  ShieldAlert,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Home', href: '/', icon: Sparkles },
    { name: 'Saved', href: '/dashboard?tab=saved', icon: Bookmark, authRequired: true },
    { name: 'History', href: '/dashboard?tab=history', icon: History, authRequired: true },
    { name: 'Admin', href: '/admin', icon: ShieldAlert, adminRequired: true },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
                <FileText size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
                NewsScript<span className="text-indigo-400 font-extrabold">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              if (link.authRequired && !session) return null;
              if (link.adminRequired && (session?.user as any)?.role !== 'ADMIN') return null;

              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* User Section & Search Trigger */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-200">{session.user?.name}</p>
                  <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
                    {(session.user as any).role || 'User'}
                  </p>
                </div>
                
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-600/40 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-900 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-2 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            if (link.authRequired && !session) return null;
            if (link.adminRequired && (session?.user as any)?.role !== 'ADMIN') return null;

            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-indigo-600/10 text-indigo-400'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800 px-3">
            {session ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{session.user?.name}</p>
                  <p className="text-xs text-indigo-400">{(session.user as any).role || 'User'}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 rounded-lg bg-red-950/20 border border-red-900/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-600/40 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
