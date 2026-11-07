import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from 'src/app/services/auth-service.service';

import { HttpTestingController } from '@angular/common/http/testing';
import { UnderTheHoodService } from 'src/app/services/under-the-hood.service';
import { ATTESTATIONS_URL } from 'src/app/links';

import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    localStorage.removeItem('videoflix.underTheHood');
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('offers logout as a button that works with the keyboard', () => {
    expect(fixture.nativeElement.querySelector('button.logout-link')).not.toBeNull();
  });

  it('logout navigates to / after the server call', () => {
    const logoutSpy = spyOn(TestBed.inject(AuthService), 'logout').and.returnValue(of(undefined));
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  describe('under the hood', () => {
    const footer = (): HTMLElement => fixture.nativeElement.querySelector('footer');
    const attestation = (): HTMLAnchorElement | null => footer().querySelector('a[href="' + ATTESTATIONS_URL + '"]');

    function switchOn(): void {
      TestBed.inject(UnderTheHoodService).toggle();
      fixture.detectChanges();
    }

    afterEach(() => localStorage.removeItem('videoflix.underTheHood'));

    it('offers the switch between logo and logout', () => {
      const header: HTMLElement = fixture.nativeElement.querySelector('header');
      const order = Array.from(header.querySelectorAll('.logo-link, mat-slide-toggle, .logout-link'))
        .map(el => el.className.includes('logo-link') ? 'logo' : el.className.includes('logout') ? 'logout' : 'switch');
      expect(order).toEqual(['logo', 'switch', 'logout']);
      expect(header.querySelector('mat-slide-toggle')?.textContent).toContain('Under the hood');
    });

    it('shows no technical details when off', () => {
      TestBed.inject(HttpTestingController).expectNone('/version.json');
      expect(footer().textContent).not.toContain('build');
      expect(attestation()).toBeNull();
    });

    it('footer shows build and attestation link when on', () => {
      switchOn();
      TestBed.inject(HttpTestingController).expectOne('/version.json').flush({ sha: '133f300aabbccdd', builtAt: 'x' });
      fixture.detectChanges();
      expect(footer().textContent).toContain('build 133f300');
      const link = attestation()!;
      expect(link.textContent).toContain('attested image');
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
    });

    it('footer still shows the attestation link when build info is null', () => {
      switchOn();
      TestBed.inject(HttpTestingController).expectOne('/version.json').flush('<!doctype html>');
      fixture.detectChanges();
      expect(footer().textContent).not.toContain('build ');
      expect(attestation()).not.toBeNull();
    });

    it('loads the build info once, however often the switch changes', () => {
      switchOn();
      TestBed.inject(HttpTestingController).expectOne('/version.json').flush({ sha: '133f300', builtAt: 'x' });
      TestBed.inject(UnderTheHoodService).toggle();
      switchOn();
      TestBed.inject(HttpTestingController).expectNone('/version.json');
    });
  });
});
