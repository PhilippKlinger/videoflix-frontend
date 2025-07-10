import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from 'src/app/material/material.module';
import { Video } from 'src/app/models/video.model';
import { toAbsoluteUrl } from 'src/app/utils/url-utils';

@Component({
  standalone: true,
  selector: 'app-video-thumbnail',
  templateUrl: './video-thumbnail.component.html',
  styleUrls: ['./video-thumbnail.component.scss'],
  imports: [MaterialModule, CommonModule]
})
export class VideoThumbnailComponent {
  @Input() video!: Video;
  @Output() play = new EventEmitter<Video>();
  @Output() favorite = new EventEmitter<Video>();
  @Output() openDetails = new EventEmitter<Video>();
  hovered = false;

  getThumbnailUrl() {
    return toAbsoluteUrl(this.video.thumbnail);
  }
}
