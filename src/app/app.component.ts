import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    // eslint-disable-next-line @angular-eslint/prefer-standalone -- bootstrapped through AppModule
    standalone: false
})
export class AppComponent {
  title = 'videoflix';
}
