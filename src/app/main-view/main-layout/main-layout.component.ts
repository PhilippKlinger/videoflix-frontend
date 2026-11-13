import { Component, DestroyRef, inject, ChangeDetectionStrategy, signal, effect, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { ATTESTATIONS_URL } from 'src/app/links';
import { AuthService } from 'src/app/services/auth-service.service';
import { BuildInfo, BuildInfoService } from 'src/app/services/build-info.service';
import { UnderTheHoodService } from 'src/app/services/under-the-hood.service';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [RouterModule, MaterialModule],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {

  router = inject(Router);
  authService = inject(AuthService)
  hood = inject(UnderTheHoodService);
  private buildInfoService = inject(BuildInfoService);
  private destroyRef = inject(DestroyRef);

  readonly attestationsUrl = ATTESTATIONS_URL;
  /** null until loaded, and when the build is unknown. */
  readonly build = signal<BuildInfo | null>(null);

  constructor() {
    // /version.json is only read once the switch is on, and only the first time.
    let requested = false;
    effect(() => {
      if (!this.hood.enabled() || requested) return;
      requested = true;
      untracked(() => this.buildInfoService.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(info => this.build.set(info)));
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => this.router.navigate(['/']));
  }

}
