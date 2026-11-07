import { Video } from './video.model';

// H.264 and AAC are constants, not read from the video: the backend's get_ffmpeg_hls_command
// fixes the video codec, and it encodes audio as AAC whenever a clip has an audio track.
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

/** kbit/s below 1 Mbit/s, otherwise Mbit/s with at most one decimal. */
export function formatBitrate(kbps: number): string {
  return kbps < 1000 ? `${kbps} kbit/s` : `${oneDecimal(kbps / 1000)} Mbit/s`;
}

/** Decimal units: whole MB from 10 MB, one decimal below and for GB. */
export function formatSize(bytes: number): string {
  if (bytes >= 999_500_000) return `${oneDecimal(bytes / 1e9)} GB`;
  const mb = bytes / 1e6;
  return mb >= 10 ? `${Math.round(mb)} MB` : `${oneDecimal(mb)} MB`;
}

export function formatSegments(count: number, seconds: number): string {
  return `${count} × ${seconds} s`;
}

function oneDecimal(value: number): string {
  return String(Math.round(value * 10) / 10);
}
