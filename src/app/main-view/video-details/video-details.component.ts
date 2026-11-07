import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material/material.module';
import { StreamInspectorComponent } from '../stream-inspector/stream-inspector.component';
import { Video } from 'src/app/models/video.model';

@Component({
  standalone: true,
  selector: 'app-video-details',
  imports: [MaterialModule, StreamInspectorComponent],
  templateUrl: './video-details.component.html',
  styleUrls: ['./video-details.component.scss'],
})
export class VideoDetailsComponent {
  video = inject<{ video: Video }>(MAT_DIALOG_DATA).video;
  private dialogRef = inject<MatDialogRef<VideoDetailsComponent, 'play'>>(MatDialogRef);

  play(): void {
    this.dialogRef.close('play');
  }

  close(): void {
    this.dialogRef.close();
  }
}
