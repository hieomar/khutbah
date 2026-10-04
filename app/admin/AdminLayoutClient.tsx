'use client';

import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import { AdminUserData } from '../../lib/db/store';

interface AdminLayoutClientProps {
  currentUser: AdminUserData;
  children: React.ReactNode;
}

export default function AdminLayoutClient({ currentUser, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-[#171717] flex">
      {/* Sidebar */}
      <AdminSidebar
        currentUser={currentUser}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <AdminTopBar
          title="Management Portal"
          currentUser={currentUser}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
