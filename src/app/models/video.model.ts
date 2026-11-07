
export interface VideoResolution {
  id: number;
  original_video: number;
  resolution: string;
}

/** Set by the conversion task; "ready" means at least one resolution is playable. */
export type VideoStatus = 'processing' | 'ready' | 'failed';

export interface ConversionProgress {
  progress: number;
  current_resolution: string | null;
  status: VideoStatus;
}

export interface Video {
  id: number;
  created_at: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  conversion_progress: number;
  current_resolution: string | null;
  resolutions: VideoResolution[];
  status: VideoStatus;
  // Standard videos are public, uploads private (owner and admin only).
  visibility: 'public' | 'private';
  is_own: boolean;
}

export const CATEGORY_CHOICES = [
  { value: 'Action', label: 'Action' },
  { value: 'Comedy', label: 'Comedy' },
  { value: 'Crime', label: 'Crime' },
  { value: 'Documentary', label: 'Documentary' },
  { value: 'Mystery', label: 'Mystery' },
  { value: 'Romance', label: 'Romance' },
  { value: 'Sports', label: 'Sports' }
];
