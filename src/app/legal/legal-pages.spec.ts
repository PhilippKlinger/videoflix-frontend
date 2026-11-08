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
      'Cookies und Browser-Speicher',
      'Ihre Rechte',
    ]);
    expect(text()).toContain('nach 2 Stunden');
    expect(text()).toContain('Hostinger International Ltd.');
    expect(text()).toContain('Ostlandstraße 11, 49504 Lotte');
    expect(text()).toContain('Nordrhein-Westfalen');
    // Art. 13(2)(a) and (e) GDPR: storage period and whether the data is required
    expect(text()).toContain('nach spätestens 14 Tagen gelöscht');
    expect(text()).toContain('Einzelne Seitenaufrufe werden nicht');
    expect(text()).toContain('etwa zwei Wochen');
    expect(text()).toContain('Ohne E-Mail-Adresse ist kein Konto möglich');
    // Statements must match what the code and the server really do
    expect(text()).toContain('können IP-Adresse, Zeitpunkt und aufgerufene Adresse enthalten');
    expect(text()).toContain('höchstens eine Stunde');
    expect(text()).toContain('videoflix.underTheHood');
    expect(text()).toContain('Under the hood');
    expect(text()).not.toContain('Startseite');
    expect(text()).toContain('Zeitpunkt von Registrierung und letzter Anmeldung');
    expect(text()).toContain('Uploads mit Titel und Beschreibung');
    expect(text()).not.toContain('Wiedergabefortschritt');
    expect(text()).toContain('werden dann sofort gelöscht');
  });
});
