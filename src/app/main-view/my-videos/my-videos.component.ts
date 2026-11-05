import { Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, effect, inject, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription, catchError, exhaustMap, forkJoin, map, of, timer } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Video } from 'src/app/models/video.model';
import { MaterialModule } from 'src/app/material/material.module';

/** Same quota as the backend (masterplan G6, MAX_UPLOADS_PER_ACCOUNT). */
export const MAX_UPLOADS = 2;
export const POLL_INTERVAL_MS = 3000;

/** The member's own uploads with upload slot, conversion status and delete. */
@Component({
  standalone: true,
  selector: 'app-my-videos',
  imports: [RouterModule, MaterialModule],
  templateUrl: './my-videos.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './my-videos.component.scss'
})
export class MyVideosComponent {
  private api = inject(ApiService);
  private host = inject(ElementRef<HTMLElement>);
  private injector = inject(Injector);

  readonly videos = input.required<Video[]>();
  readonly play = output<Video>();
  /** Asks the page to reload the list (conversion done, video deleted). */
  readonly changed = output<void>();

  readonly maxUploads = MAX_UPLOADS;
  readonly slotFree = computed(() => this.videos().length < MAX_UPLOADS);
  readonly progress = signal<Record<number, number>>({});
  readonly confirmingId = signal<number | null>(null);
  readonly deletingIds = signal<ReadonlySet<number>>(new Set());
  readonly errorMessage = signal('');

  private polling?: Subscription;

  constructor() {
    // Restarts with every new list, so finished or deleted videos drop out.
    effect(() => this.startPolling(this.videos()));
    inject(DestroyRef).onDestroy(() => this.polling?.unsubscribe());
  }

  progressOf(video: Video): number {
    return this.progress()[video.id] ?? video.conversion_progress;
  }

  askDelete(video: Video): void {
    this.errorMessage.set('');
    this.confirmingId.set(video.id);
    this.focusAfterRender(`[data-keep-id="${video.id}"]`);
  }

  keep(video: Video): void {
    this.confirmingId.set(null);
    this.focusAfterRender(`[data-delete-id="${video.id}"]`);
  }

  /** The clicked button disappears, so the focus moves on instead of falling back to the page. */
  private focusAfterRender(selector: string): void {
    afterNextRender(() => this.host.nativeElement.querySelector(selector)?.focus(), { injector: this.injector });
  }

  delete(video: Video): void {
    this.deletingIds.update(ids => new Set(ids).add(video.id));
    this.api.deleteVideo(video.id).subscribe({
      next: () => this.afterDelete(video),
      error: () => {
        this.afterDelete(video);
        this.errorMessage.set('The video could not be deleted. The list has been refreshed.');
      },
    });
  }

  private afterDelete(video: Video): void {
    // Another delete may be running or waiting for its confirmation.
    if (this.confirmingId() === video.id) this.confirmingId.set(null);
    this.deletingIds.update(ids => {
      const remaining = new Set(ids);
      remaining.delete(video.id);
      return remaining;
    });
    this.changed.emit();
  }

  /** Playable after the first resolution, while the higher ones are still converted. */
  convertingMore(video: Video): boolean {
    return video.status === 'ready' && this.progressOf(video) < 100;
  }

  private startPolling(videos: Video[]): void {
    this.polling?.unsubscribe();
    const converting = videos.filter(video =>
      video.status === 'processing' || (video.status === 'ready' && video.conversion_progress < 100));
    if (!converting.length) return;
    // exhaustMap: a slow answer is awaited instead of being cancelled by the next tick.
    this.polling = timer(POLL_INTERVAL_MS, POLL_INTERVAL_MS).pipe(
      exhaustMap(() => forkJoin(converting.map(video =>
        this.api.getConversionProgress(video.id).pipe(
          // Reload when the video becomes playable or fails, and once all resolutions exist.
          map(result => ({
            id: video.id,
            progress: result.progress,
            done: result.status !== video.status || result.progress >= 100,
          })),
          // A video deleted elsewhere returns 404; the reloaded list sorts it out.
          catchError(() => of({ id: video.id, progress: this.progressOf(video), done: true }))
        )
      )))
    ).subscribe(results => {
      this.progress.update(current => ({
        ...current,
        ...Object.fromEntries(results.map(result => [result.id, result.progress])),
      }));
      if (results.some(result => result.done)) {
        // The reloaded list restarts the polling for the videos still converting.
        this.polling?.unsubscribe();
        this.changed.emit();
      }
    });
  }
}
