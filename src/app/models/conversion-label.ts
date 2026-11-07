/** Plain-language conversion status; leaves out what the backend did not report. */
export function conversionLabel(progress: number, resolution: string | null): string {
  const text = resolution ? `Preparing ${resolution}…` : 'Converting…';
  return Number.isFinite(progress) ? `${text} ${progress} %` : text;
}
