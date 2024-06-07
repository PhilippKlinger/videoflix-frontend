import { Profile } from "./profile.model";

export interface Resolution {
  id: number;
  resolution: string;
  converted_file: string;
  original_video: number;
}

export interface Video {
  id: number;
  resolutions: Resolution[];
  uploaded_at: string;
  title: string;
  description: string;
  genre: string;
  category: string;
  video_file: string;
  thumbnail: string;
  favorited_by: Profile[];
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