import { CommonModule } from '@angular/common';
import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BUILD_STORY_URL } from 'src/app/links';

@Component({
  standalone: true,
  selector: 'app-auth-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  @Input() backgroundImage = '/assets/backgrounds/cover.webp';
  @Input() showBuildLink = false;
  readonly buildStoryUrl = BUILD_STORY_URL;

  router = inject(Router);

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
