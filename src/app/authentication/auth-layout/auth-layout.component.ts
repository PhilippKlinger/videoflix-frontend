import { CommonModule } from '@angular/common';
import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-auth-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  @Input() backgroundImage: string = '/assets/backgrounds/start.webp';

  router = inject(Router);

  constructor() { }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
