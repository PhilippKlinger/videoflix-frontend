import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthLayoutComponent } from '../authentication/auth-layout/auth-layout.component';

@Component({
  standalone: true,
  selector: 'app-imprint',
  imports: [AuthLayoutComponent],
  templateUrl: './imprint.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './legal-page.scss'
})
export class ImprintComponent { }
