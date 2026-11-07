import { Video } from './video.model';

// H.264 and AAC are constants, not read from the video: they are true for every stream because
// the backend's get_ffmpeg_hls_command fixes both codecs.
const CODECS = 'H.264 · AAC';

/** Technical summary of the HLS streams; null while the video has none. Resolutions are named like "720p". */
export function techLine(video: Video): string | null {
  if (!video.resolutions.length) return null;
  const heights = video.resolutions
    .map(r => r.resolution)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  return `HLS · ${heights.join(' ')} · ${CODECS}`;
}

/** One stream per converted resolution. */
export function streamCount(video: Video): string {
  const count = video.resolutions.length;
  return count === 1 ? '1 stream' : `${count} streams`;
}
