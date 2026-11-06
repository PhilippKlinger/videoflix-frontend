import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';
import { BUILD_STORY_URL } from 'src/app/links';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    host = fixture.nativeElement;
  });

  it('offers the demo before the sign-up', () => {
    const demo = host.querySelector('app-demo-button')!;
    const signUp = host.querySelector('a.signup-link')!;
    expect(demo).not.toBeNull();
    expect(demo.compareDocumentPosition(signUp) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('links sign-up to the register page and log in to the login page', () => {
    expect(host.querySelector('a.signup-link')!.getAttribute('href')).toBe('/register');
    const login = Array.from(host.querySelectorAll('a')).find(a => a.textContent?.trim() === 'Log in');
    expect(login!.getAttribute('href')).toBe('/login');
  });

  it('links to the build story in a safe new tab', () => {
    const link = host.querySelector('a.build-link')!;
    expect(link.getAttribute('href')).toBe(BUILD_STORY_URL);
    expect(link.getAttribute('rel')).toBe('noopener');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('has no email form any more', () => {
    expect(host.querySelector('form')).toBeNull();
  });

  it('shows one prioritised cover image with fixed size and no CSS background', () => {
    const img = host.querySelector('.cover img') as HTMLImageElement;
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('src')).toBe(component.coverImage);
    expect(img.getAttribute('width')).toBe('1280');
    expect(img.getAttribute('height')).toBe('720');
    expect((host.querySelector('.auth-container') as HTMLElement).style.backgroundImage).toBe('');
  });

  it('home uses the cover image', () => {
    expect(component.coverImage).toBe('/assets/backgrounds/cover.webp');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
