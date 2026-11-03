
export interface VideoResolution {
  id: number;
  original_video: number;
  resolution: string;
  converted_file: string;
}

export interface Video {
  id: number;
  created_at: string;
  title: string;
  description: string;
  category: string;
  // Not sent by the backend anymore (upload only); the player drops it with HLS (VFX-34).
  video_file: string;
  thumbnail_url: string | null;
  conversion_progress: number;
  current_resolution: string | null;
  resolutions: VideoResolution[];
  _hovered?: boolean;
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

export type CategorizedVideos = { [category: string]: Video[] };