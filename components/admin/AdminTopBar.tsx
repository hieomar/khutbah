'use client';

import React from 'react';
import { Menu, Shield, ExternalLink } from 'lucide-react';
import { AdminUserData } from '../../lib/db/store';
import Link from 'next/link';

interface AdminTopBarProps {
  title: string;
  currentUser?: AdminUserData;
  onOpenSidebar: () => void;
}

export default function AdminTopBar({ title, onOpenSidebar }: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-black/8 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-[#171717] hover:bg-black/5 md:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-[10px] text-secondary font-mono">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#171717] font-semibold">{title}</span>
          </div>
          <h1 className="font-serif-heading text-xl sm:text-2xl font-medium text-[#171717] leading-none">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Security / Role Indicator */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/6 text-xs text-secondary">
          <Shield className="w-3.5 h-3.5 text-accent-gold" />
          <span>Role:</span>
          <strong className="text-[#171717] uppercase text-[10px]">Administrator</strong>
        </div>

        <Link
          href="/"
          target="_blank"
          className="p-2 rounded-xl text-secondary hover:text-[#171717] hover:bg-black/5 transition-colors"
          title="Open public website in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
