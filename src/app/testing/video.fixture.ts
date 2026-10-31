import { Video } from '../models/video.model';

// Minimal video used by component specs that require a `video` input.
export const TEST_VIDEO: Video = {
  id: 1,
  uploaded_at: '2026-01-01T00:00:00Z',
  title: 'Test video',
  description: 'Test description',
  genre: 'Action',
  category: 'Movie',
  video_file: '/media/videos/test.mp4',
  thumbnail: '/media/thumbnails/test.jpg',
  conversion_progress: 100,
  current_resolution: '1080p',
  resolutions: [],
};
