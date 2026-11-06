import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuthLayoutComponent } from './auth-layout.component';
import { BUILD_STORY_URL } from 'src/app/links';

describe('AuthLayoutComponent', () => {
  let component: AuthLayoutComponent;
  let fixture: ComponentFixture<AuthLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayoutComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows no build link by default', () => {
    expect(fixture.nativeElement.querySelector('.build-link')).toBeNull();
  });

  it('shows the build link in the footer when asked', () => {
    fixture.componentRef.setInput('showBuildLink', true);
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.auth-footer .build-link');
    expect(link.getAttribute('href')).toBe(BUILD_STORY_URL);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });

  it('keeps the background image and overlay unless the page brings its own', () => {
    const container: HTMLElement = fixture.nativeElement.querySelector('.auth-container');
    expect(container.style.backgroundImage).toContain('/assets/backgrounds/start.webp');
    expect(container.classList).not.toContain('own-background');

    fixture.componentRef.setInput('backgroundImage', '');
    fixture.detectChanges();
    expect(container.style.backgroundImage).toBe('');
    expect(container.classList).toContain('own-background');
  });
});
