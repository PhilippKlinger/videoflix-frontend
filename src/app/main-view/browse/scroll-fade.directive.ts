import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

/** Marks a horizontally scrolling element with `has-more` while content is hidden on its right. */
@Directive({
  standalone: true,
  selector: '[appScrollFade]',
})
export class ScrollFadeDirective implements OnInit, OnDestroy {
  private element: HTMLElement = inject(ElementRef).nativeElement;
  private observer = new ResizeObserver(() => this.update());

  ngOnInit(): void {
    this.element.addEventListener('scroll', this.onScroll, { passive: true });
    this.observer.observe(this.element);
    this.update();
  }

  ngOnDestroy(): void {
    this.element.removeEventListener('scroll', this.onScroll);
    this.observer.disconnect();
  }

  private onScroll = () => this.update();

  private update(): void {
    const { scrollLeft, clientWidth, scrollWidth } = this.element;
    // 1px tolerance: scrollLeft and the widths are rounded separately.
    this.element.classList.toggle('has-more', scrollLeft + clientWidth < scrollWidth - 1);
  }
}
