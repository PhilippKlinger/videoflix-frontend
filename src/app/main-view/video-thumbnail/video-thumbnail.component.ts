import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Video } from 'src/app/models/video.model';

@Component({
  standalone: true,
  selector: 'app-video-thumbnail',
  templateUrl: './video-thumbnail.component.html',
  styleUrls: ['./video-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class VideoThumbnailComponent {
  @Input() video!: Video;
  @Output() open = new EventEmitter<Video>();
}
