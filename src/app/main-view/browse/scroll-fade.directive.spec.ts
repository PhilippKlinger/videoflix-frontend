import { Component, ViewChild, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollFadeDirective } from './scroll-fade.directive';

@Component({
  standalone: true,
  imports: [ScrollFadeDirective],
  template: `<div #row appScrollFade class="row"><div class="content" [style.width.px]="contentWidth"></div></div>`,
  styles: `.row { width: 200px; overflow-x: auto; } .content { height: 10px; }`,
})
class HostComponent {
  @ViewChild('row', { static: true })
  row!: ElementRef<HTMLElement>;
  contentWidth = 100;
}

describe('ScrollFadeDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let row: HTMLElement;

  // The ResizeObserver reports after layout, so give it a few frames.
  const frames = async () => {
    for (let i = 0; i < 3; i++)
      await new Promise(resolve => requestAnimationFrame(resolve));
  };

  async function create(contentWidth: number) {
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.contentWidth = contentWidth;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    row = fixture.componentInstance.row.nativeElement;
    await frames();
  }

  afterEach(() => fixture.nativeElement.remove());

  it('no has-more when the content fits', async () => {
    await create(100);
    expect(row.classList.contains('has-more')).toBe(false);
  });

  it('has-more when the content overflows', async () => {
    await create(500);
    expect(row.classList.contains('has-more')).toBe(true);
  });

  it('no has-more when scrolled to the end', async () => {
    await create(500);
    row.scrollLeft = row.scrollWidth;
    await frames();
    expect(row.classList.contains('has-more')).toBe(false);
  });
});
