import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {

  router = inject(Router);
  authService = inject(AuthService)

  constructor() { }

  logout(): void {
    this.authService.removeAuthCredentials();
    this.router.navigate(['/']);
  }

}
