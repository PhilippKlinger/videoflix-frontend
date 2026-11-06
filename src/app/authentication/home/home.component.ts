import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { DemoButtonComponent } from '../demo-button/demo-button.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink, AuthLayoutComponent, DemoButtonComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  // Swap this one line to change the start page image; keep width and height in the template in sync.
  readonly coverImage = '/assets/backgrounds/cover.webp';
}
