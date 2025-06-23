import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-auth-layout',
  imports: [CommonModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  @Input() backgroundImage: string = '/assets/backgrounds/start.jpg';
}
