'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ContentCategories from '../components/ContentCategories';
import FeaturedTeachings from '../components/FeaturedTeachings';
import MediaExperience from '../components/MediaExperience';
import AboutPlatform from '../components/AboutPlatform';
import MalawiCommunity from '../components/MalawiCommunity';
import MobileAppShowcase from '../components/MobileAppShowcase';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import ContentModal from '../components/ContentModal';
import GlobalPlayer from '../components/GlobalPlayer';
import { Teaching, CategoryId } from '../types/content';
import { TEACHINGS } from '../data/contentData';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<Teaching | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [modalTeaching, setModalTeaching] = useState<Teaching | null>(null);

  const handlePlayTeaching = (teaching: Teaching) => {
    if (currentPlayingTrack?.id === teaching.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlayingTrack(teaching);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setCurrentPlayingTrack(null);
  };

  const handleSearchFocus = () => {
    const el = document.getElementById('featured-teachings');
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#DADAD4] text-[#171717] selection:bg-[#FF713F]/20 selection:text-[#171717]">
      {/* Top Floating Pill Navigation */}
      <Navbar onSearchClick={handleSearchFocus} />

      {/* 1. Hero Section (90-100vh on Desktop with Signature Particle Visualization) */}
      <Hero />

      {/* 2. Content Categories Directory */}
      <ContentCategories
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* 3. Featured Teachings (Audio sermons, Friday khutbahs, Video recordings) */}
      <FeaturedTeachings
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onPlayTeaching={handlePlayTeaching}
        onOpenDetails={(teaching) => setModalTeaching(teaching)}
        currentPlayingId={currentPlayingTrack?.id}
        isPlaying={isPlaying}
      />

      {/* 4. Listen & Watch Media Experience */}
      <MediaExperience onPlayTeaching={handlePlayTeaching} />

      {/* 5. About the Platform & Mission in Malawi */}
      <AboutPlatform />

      {/* 6. Malawi Community Hubs & Geographic Connectivity */}
      <MalawiCommunity />

      {/* 7. Upcoming Mobile Application Showcase */}
      <MobileAppShowcase />

      {/* 8. Final Call to Action */}
      <FinalCTA />

      {/* 9. Minimal Editorial Footer */}
      <Footer />

      {/* Interactive Content Details Modal */}
      <ContentModal
        teaching={modalTeaching}
        onClose={() => setModalTeaching(null)}
        onPlay={handlePlayTeaching}
        isPlaying={isPlaying && currentPlayingTrack?.id === modalTeaching?.id}
      />

      {/* Persistent Floating Bottom Audio/Video Bar */}
      <GlobalPlayer
        currentTrack={currentPlayingTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onClose={handleClosePlayer}
      />
    </main>
  );
}
