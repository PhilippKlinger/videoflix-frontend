import { TEST_VIDEO } from '../testing/video.fixture';
import { formatBitrate, formatSegments, formatSize, streamCount, techLine } from './video-tech';
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

describe('formatBitrate', () => {
  it('shows Mbit/s with one decimal', () => {
    expect(formatBitrate(1300)).toBe('1.3 Mbit/s');
    expect(formatBitrate(2400)).toBe('2.4 Mbit/s');
  });

  it('drops a zero decimal', () => {
    expect(formatBitrate(2000)).toBe('2 Mbit/s');
  });

  it('shows kbit/s below 1 Mbit/s', () => {
    expect(formatBitrate(800)).toBe('800 kbit/s');
    expect(formatBitrate(999)).toBe('999 kbit/s');
    expect(formatBitrate(1000)).toBe('1 Mbit/s');
  });
});

describe('formatSize', () => {
  it('shows whole MB from 10 MB', () => {
    expect(formatSize(17_000_000)).toBe('17 MB');
    expect(formatSize(31_400_000)).toBe('31 MB');
  });

  it('shows one decimal below 10 MB', () => {
    expect(formatSize(1_500_000)).toBe('1.5 MB');
    expect(formatSize(400_000)).toBe('0.4 MB');
  });

  it('switches to GB at 1 GB', () => {
    expect(formatSize(999_000_000)).toBe('999 MB');
    expect(formatSize(1_000_000_000)).toBe('1 GB');
    expect(formatSize(1_240_000_000)).toBe('1.2 GB');
  });
});

describe('formatSegments', () => {
  it('shows count and length', () => {
    expect(formatSegments(26, 4)).toBe('26 × 4 s');
  });
});
