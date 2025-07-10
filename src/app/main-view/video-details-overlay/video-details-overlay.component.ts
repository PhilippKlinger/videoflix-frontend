import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from 'src/app/material/material.module';
import { Video } from 'src/app/models/video.model';
import { toAbsoluteUrl } from 'src/app/utils/url-utils';

@Component({
  standalone: true,
  selector: 'app-video-details-overlay',
  templateUrl: './video-details-overlay.component.html',
  styleUrls: ['./video-details-overlay.component.scss'],
  imports: [MaterialModule, CommonModule]
})
export class VideoDetailsOverlayComponent {
handleResChange($event: Event) {
throw new Error('Method not implemented.');
}
  @Input() video!: Video;
  @Output() close = new EventEmitter<void>();
  @Output() play = new EventEmitter<Video>();

  getBgUrl() {
    return toAbsoluteUrl(this.video.thumbnail);
  }
}
