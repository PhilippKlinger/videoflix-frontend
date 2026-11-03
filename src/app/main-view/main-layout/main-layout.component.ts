import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { AuthService } from 'src/app/services/auth-service.service';

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

  constructor() { }

  logout(): void {
    this.authService.logout().subscribe(() => this.router.navigate(['/']));
  }

}
