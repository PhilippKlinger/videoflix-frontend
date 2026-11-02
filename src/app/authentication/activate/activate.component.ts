import { Component, OnInit, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { MaterialModule } from 'src/app/material/material.module';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { ApiService } from 'src/app/services/api.service';

/** Target of the activation link in the registration mail: /activate/:uid/:token */
@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [MaterialModule, AuthLayoutComponent, RouterModule],
  templateUrl: './activate.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['../forgot-password/forgot-password.component.scss']
})
export class ActivateComponent implements OnInit {
  activated = false;
  failed = false;

  api = inject(ApiService);
  route = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => this.api.activateAccount(params.get('uid') ?? '', params.get('token') ?? '')),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.activated = true,
      error: () => this.failed = true
    });
  }
}
