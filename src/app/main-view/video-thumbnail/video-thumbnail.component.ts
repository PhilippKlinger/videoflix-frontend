import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, inject } from '@angular/core';
import { Video } from 'src/app/models/video.model';
import { streamCount } from 'src/app/models/video-tech';
import { UnderTheHoodService } from 'src/app/services/under-the-hood.service';

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
  hood = inject(UnderTheHoodService);

  get streams(): string {
    return streamCount(this.video);
  }
}
