import { TEST_VIDEO } from '../testing/video.fixture';
import { streamCount, techLine } from './video-tech';
import { Video } from './video.model';

function withResolutions(...names: string[]): Video {
  return { ...TEST_VIDEO, resolutions: names.map((resolution, i) => ({ id: i, original_video: 1, resolution })) };
}

describe('techLine', () => {
  it('lists the resolutions in ascending order', () => {
    expect(techLine(withResolutions('1080p', '480p', '720p'))).toBe('HLS · 480p 720p 1080p · H.264 · AAC');
  });

  it('sorts numerically, not as text', () => {
    expect(techLine(withResolutions('1080p', '240p'))).toBe('HLS · 240p 1080p · H.264 · AAC');
  });

  it('is null without resolutions', () => {
    expect(techLine(withResolutions())).toBeNull();
  });
});

describe('streamCount', () => {
  it('says "1 stream" for one resolution', () => {
    expect(streamCount(withResolutions('480p'))).toBe('1 stream');
  });

  it('says "3 streams" for three resolutions', () => {
    expect(streamCount(withResolutions('480p', '720p', '1080p'))).toBe('3 streams');
  });
});
