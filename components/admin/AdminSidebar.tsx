'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Film,
  MailCheck,
  ScrollText,
  LogOut,
  ExternalLink,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Logo from '../Logo';
import { AdminUserData } from '../../lib/db/store';
import { hasPermission } from '../../lib/auth/permissions';
import { signOut } from '../../lib/auth/auth-client';

interface AdminSidebarProps {
  currentUser: AdminUserData;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ currentUser, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await signOut();
      router.push('/auth/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/auth/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
      allowed: true,
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: <Users className="w-4 h-4" />,
      exact: false,
      allowed: hasPermission(currentUser.permissions, 'users.view'),
    },
    {
      label: 'Administrators',
      href: '/admin/admins',
      icon: <ShieldCheck className="w-4 h-4" />,
      exact: false,
      allowed:
        hasPermission(currentUser.permissions, 'admins.permissions.manage') ||
        hasPermission(currentUser.permissions, 'admins.create'),
    },
    {
      label: 'Media Library',
      href: '/admin/media',
      icon: <Film className="w-4 h-4" />,
      exact: false,
      allowed:
        hasPermission(currentUser.permissions, 'media.view') ||
        hasPermission(currentUser.permissions, 'media.create'),
    },
    {
      label: 'Invitations',
      href: '/admin/invitations',
      icon: <MailCheck className="w-4 h-4" />,
      exact: false,
      allowed: hasPermission(currentUser.permissions, 'users.invite'),
    },
    {
      label: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: <ScrollText className="w-4 h-4" />,
      exact: false,
      allowed: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface border-r border-black/8 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-black/8">
            <Link href="/admin" className="flex items-center gap-2 group">
              <Logo size="sm" />
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#171717] text-canvas">
                Admin
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-secondary block mb-2">
              Platform Controls
            </span>

            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              if (!item.allowed) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#171717] text-white shadow-2xs font-semibold'
                      : 'text-secondary hover:text-[#171717] hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-accent-orange' : 'text-current'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
                </Link>
              );
            })}
          </div>

          {/* Quick link to public website */}
          <div className="px-4 pt-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-secondary hover:text-[#171717] hover:bg-black/5 transition-colors border border-black/5"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <span>Public Website</span>
              </span>
              <ExternalLink className="w-3 h-3 text-secondary" />
            </Link>
          </div>
        </div>

        {/* Signed-in Administrator Profile Footer & Logout */}
        <div className="p-4 border-t border-black/8 bg-black/2 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate pr-1">
              <p className="text-xs font-semibold text-[#171717] truncate">{currentUser.name}</p>
              <p className="text-[10px] text-secondary truncate">{currentUser.email}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-orange/15 text-[#171717] shrink-0 border border-accent-orange/30">
              Admin
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-secondary pt-2 border-t border-black/6">
            <span className="text-[10px] font-mono">
              {currentUser.permissions.length} perms active
            </span>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Sign out of administrator session"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
