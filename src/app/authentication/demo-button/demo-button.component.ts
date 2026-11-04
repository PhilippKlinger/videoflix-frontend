import { Component, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service.service';
import { MaterialModule } from 'src/app/material/material.module';

/** One click into a demo account (2 hours, no mail), shown on the start and login page. */
@Component({
  standalone: true,
  selector: 'app-demo-button',
  imports: [MaterialModule],
  templateUrl: './demo-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './demo-button.component.scss'
})
export class DemoButtonComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly starting = signal(false);
  readonly errorMessage = signal('');

  startDemo(): void {
    this.starting.set(true);
    this.errorMessage.set('');
    this.authService.startDemo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/browse']),
        error: (error: HttpErrorResponse) => {
          this.starting.set(false);
          this.errorMessage.set(this.messageFor(error));
        },
      });
  }

  private messageFor(error: HttpErrorResponse): string {
    if (error.status === 503) return 'All demo slots are in use. Please try again later.';
    if (error.status === 429) return 'Too many demo starts. Please try again later.';
    return 'The demo could not be started. Please try again later.';
  }
}
