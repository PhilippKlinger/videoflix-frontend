import { TestBed } from '@angular/core/testing';
import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';

import { AppModule } from './app.module';

describe('AppModule', () => {
  it('renders overlays (e.g. the resolution menu) inside a fullscreen element', () => {
    TestBed.configureTestingModule({ imports: [AppModule] });
    expect(TestBed.inject(OverlayContainer)).toBeInstanceOf(FullscreenOverlayContainer);
  });
});
