import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthLayoutComponent } from '../authentication/auth-layout/auth-layout.component';

@Component({
  standalone: true,
  selector: 'app-privacy',
  imports: [AuthLayoutComponent, RouterModule],
  templateUrl: './privacy.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './legal-page.scss'
})
export class PrivacyComponent { }
