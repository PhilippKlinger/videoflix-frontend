import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../app-routing.module';
import { provideAppHttpClient } from '../http.providers';

describe('Legal pages', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideAppHttpClient(), provideHttpClientTesting()],
    });
    harness = await RouterTestingHarness.create();
  });

  function text(): string {
    return harness.routeNativeElement?.textContent ?? '';
  }

  it('shows the imprint without login under the footer link /impressum', async () => {
    await harness.navigateByUrl('/impressum');
    expect(text()).toContain('Angaben gemäß § 5 DDG');
    expect(text()).toContain('Philipp Klinger');
    expect(text()).toContain('Ostlandstraße 11');
    expect(text()).toContain('49504 Lotte');
    const mail = harness.routeNativeElement?.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
    expect(mail?.getAttribute('href')).toBe('mailto:hello@philipp-klinger.com');
  });

  it('shows the privacy policy without login under the footer link /datenschutz', async () => {
    await harness.navigateByUrl('/datenschutz');
    const headings = Array.from(harness.routeNativeElement?.querySelectorAll('h2') ?? []).map(h => h.textContent?.trim());
    expect(headings).toEqual([
      'Verantwortlicher',
      'Hosting und Server-Logs',
      'Konto, Demo und Videos',
      'E-Mails',
      'Cookies',
      'Ihre Rechte',
    ]);
    expect(text()).toContain('nach 2 Stunden');
    expect(text()).toContain('Hostinger International Ltd.');
    expect(text()).toContain('Ostlandstraße 11, 49504 Lotte');
    expect(text()).toContain('Nordrhein-Westfalen');
  });
});
