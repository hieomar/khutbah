export type MediaType = 'audio' | 'video';

export type CategoryId = 
  | 'preachings' 
  | 'khutbahs' 
  | 'lectures' 
  | 'recitations' 
  | 'reminders';

export interface CategoryInfo {
  id: CategoryId;
  title: string;
  vernacularTitle?: string;
  description: string;
  iconName: string;
  itemCount: number;
}

export interface Teaching {
  id: string;
  title: string;
  speaker: string;
  speakerTitle: string;
  categoryId: CategoryId;
  categoryLabel: string;
  mediaType: MediaType;
  duration: string;
  durationSeconds: number;
  date: string;
  location: string;
  district: string;
  language: 'Chichewa' | 'English' | 'Arabic' | 'Chichewa / English';
  description: string;
  keyTakeaways: string[];
  audioUrl?: string;
  videoThumbnail?: string;
  isFeatured?: boolean;
  viewsOrListens?: string;
}

export interface MalawiHub {
  id: string;
  name: string;
  region: 'Southern' | 'Central' | 'Northern';
  majorMasjid: string;
  recordingsCount: number;
  featuredScholars: string[];
  coordinates: { x: number; y: number }; // percentage on custom SVG map
  description: string;
}

export interface PlayerTrack {
  id: string;
  title: string;
  speaker: string;
  categoryLabel: string;
  mediaType: MediaType;
  duration: string;
  durationSeconds: number;
  location: string;
  isPlaying: boolean;
  currentTime: number;
}
