import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { SHOWS_OWN_ERRORS } from './http-error-interceptor.service';

export interface BuildInfo {
  sha: string;
}

const SHA_PATTERN = /^[0-9a-f]{7,40}$/;
const SHORT_SHA_LENGTH = 7;

/** Reads the public /version.json written at image build. */
@Injectable({ providedIn: 'root' })
export class BuildInfoService {
  private http = inject(HttpClient);

  /** null when the file is missing, is the SPA fallback page, or carries no real commit. */
  load(): Observable<BuildInfo | null> {
    // The footer simply stays without a build; no error message for the user.
    const context = new HttpContext().set(SHOWS_OWN_ERRORS, true);
    return this.http.get<unknown>('/version.json', { context }).pipe(
      map(body => {
        const sha = (body as { sha?: unknown } | null)?.sha;
        return typeof sha === 'string' && SHA_PATTERN.test(sha) ? { sha: sha.slice(0, SHORT_SHA_LENGTH) } : null;
      }),
      catchError(() => of(null)),
    );
  }
}
