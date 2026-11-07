import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'videoflix.underTheHood';

/** The "Under the hood" switch. Remembered per browser; a blocked storage only costs the memory. */
@Injectable({ providedIn: 'root' })
export class UnderTheHoodService {
  private readonly state = signal(this.read());
  readonly enabled = this.state.asReadonly();

  toggle(): void {
    const next = !this.state();
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Storage blocked: the switch still works for this session.
    }
  }

  private read(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
