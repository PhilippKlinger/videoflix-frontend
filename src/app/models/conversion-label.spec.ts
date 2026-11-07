import { conversionLabel } from './conversion-label';

describe('conversionLabel', () => {
  it('names the resolution that is prepared', () => {
    expect(conversionLabel(40, '720p')).toBe('Preparing 720p… 40 %');
  });

  it('falls back to a general text without a resolution', () => {
    expect(conversionLabel(40, null)).toBe('Converting… 40 %');
    expect(conversionLabel(40, '')).toBe('Converting… 40 %');
  });

  it('shows no percent when the value is not a number', () => {
    expect(conversionLabel(NaN, '720p')).toBe('Preparing 720p…');
    expect(conversionLabel(undefined as unknown as number, null)).toBe('Converting…');
  });
});
