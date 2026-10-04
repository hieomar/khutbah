'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Menu, X, Search, Sparkles, Compass } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  onSearchClick?: () => void;
  onAppClick?: () => void;
}

export default function Navbar({ onSearchClick, onAppClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3 sm:py-4 px-4 sm:px-6 md:px-8`}
      >
        <div className="max-w-6xl mx-auto">
          <nav
            className={`flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
              isScrolled
                ? 'bg-surface/90 backdrop-blur-md shadow-xs border border-black/8'
                : 'bg-surface border border-black/6 shadow-xs'
            }`}
          >
            {/* Left navigation (Desktop) */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[13px] font-medium text-secondary">
              <button
                onClick={() => scrollTo('explore-content')}
                className="hover:text-[#171717] transition-colors cursor-pointer"
              >
                Explore
              </button>
              <button
                onClick={() => scrollTo('categories')}
                className="hover:text-[#171717] transition-colors cursor-pointer"
              >
                Categories
              </button>
              <button
                onClick={() => scrollTo('media-experience')}
                className="hover:text-[#171717] transition-colors cursor-pointer"
              >
                Experience
              </button>
              <button
                onClick={() => scrollTo('about')}
                className="hover:text-[#171717] transition-colors cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => scrollTo('community')}
                className="hover:text-[#171717] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Malawi</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              </button>
            </div>

            {/* Center Logo */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="cursor-pointer group focus:outline-none"
              >
                <Logo size="md" />
              </button>
            </div>

            {/* Right Navigation */}
            <div className="hidden md:flex items-center gap-3">
              {onSearchClick && (
                <button
                  onClick={onSearchClick}
                  className="p-2 rounded-full text-secondary hover:text-[#171717] hover:bg-black/5 transition-colors cursor-pointer"
                  title="Search teachings"
                  aria-label="Search teachings"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  if (onAppClick) {
                    onAppClick();
                  } else {
                    scrollTo('mobile-app');
                  }
                }}
                className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-medium text-[#171717] bg-black/5 hover:bg-black/10 border border-black/8 transition-all cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-secondary group-hover:text-[#171717] transition-colors" />
                <span>Get the app</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-accent-orange font-semibold bg-accent-orange/10 px-1.5 py-0.5 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-accent-orange animate-pulse" />
                  Soon
                </span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => scrollTo('mobile-app')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-[#171717] bg-black/5 border border-black/8"
              >
                <Smartphone className="w-3 h-3 text-accent-orange" />
                <span>App</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-full text-[#171717] hover:bg-black/5 focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-canvas/95 backdrop-blur-md pt-24 px-6 pb-10 flex flex-col justify-between animate-fadeIn">
          <div className="space-y-6">
            <p className="text-[11px] tracking-widest uppercase text-secondary font-semibold">
              Explore Islamic Platform
            </p>
            <div className="flex flex-col space-y-4 text-xl font-serif-heading font-medium text-[#171717]">
              <button
                onClick={() => scrollTo('explore-content')}
                className="text-left py-2 border-b border-black/5 flex items-center justify-between"
              >
                <span>Explore Content</span>
                <Sparkles className="w-4 h-4 text-accent-orange" />
              </button>
              <button
                onClick={() => scrollTo('categories')}
                className="text-left py-2 border-b border-black/5 flex items-center justify-between"
              >
                <span>Categories</span>
                <span className="text-xs font-sans text-secondary">5 sections</span>
              </button>
              <button
                onClick={() => scrollTo('media-experience')}
                className="text-left py-2 border-b border-black/5 flex items-center justify-between"
              >
                <span>Audio & Video Experience</span>
                <span className="text-xs font-sans text-secondary">Listen / Watch</span>
              </button>
              <button
                onClick={() => scrollTo('community')}
                className="text-left py-2 border-b border-black/5 flex items-center justify-between"
              >
                <span>Malawi Community Hub</span>
                <Compass className="w-4 h-4 text-accent-gold" />
              </button>
              <button
                onClick={() => scrollTo('about')}
                className="text-left py-2 border-b border-black/5"
              >
                About the Platform
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-black/8 space-y-3">
            <button
              onClick={() => scrollTo('mobile-app')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#171717] text-white text-sm font-medium"
            >
              <Smartphone className="w-4 h-4 text-accent-orange" />
              <span>Mobile App (In Development)</span>
            </button>
            <p className="text-center text-[12px] text-secondary">
              Khutbah Media • Accessible Islamic Knowledge for Malawi
            </p>
          </div>
        </div>
      )}
    </>
  );
}
