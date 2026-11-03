
export interface VideoResolution {
  id: number;
  original_video: number;
  resolution: string;
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