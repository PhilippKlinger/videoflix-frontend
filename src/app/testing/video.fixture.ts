import { Video } from '../models/video.model';

// Minimal video used by component specs that require a `video` input.
export const TEST_VIDEO: Video = {
  id: 1,
  created_at: '2026-01-01T00:00:00Z',
  title: 'Test video',
  description: 'Test description',
  category: 'Action',
  thumbnail_url: '/api/video/1/thumbnail/',
  conversion_progress: 100,
  current_resolution: '1080p',
  resolutions: [],
};
