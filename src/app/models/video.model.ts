
export interface VideoResolution {
  id: number;
  original_video: number;
  resolution: string;
  converted_file: string;
}

export interface Video {
  id: number;
  uploaded_at: string;
  title: string;
  description: string;
  genre: string;
  category: string;
  video_file: string;
  thumbnail: string;
  conversion_progress: number;
  current_resolution: string | null;
  status?: string;
  resolutions: VideoResolution[];
  _hovered?: boolean;
}

export const GENRE_CHOICES = [
  { value: 'Action', label: 'Action' },
  { value: 'Comedy', label: 'Comedy' },
  { value: 'Crime', label: 'Crime' },
  { value: 'Documentary', label: 'Documentary' },
  { value: 'Mystery', label: 'Mystery' },
  { value: 'Romance', label: 'Romance' },
  { value: 'Sports', label: 'Sports' }
];

export const CATEGORY_CHOICES = [
  { value: 'Movie', label: 'Movie' },
  { value: 'TV-Show', label: 'TV-Show' }
];

export type CategorizedVideos = { [category: string]: Video[] };