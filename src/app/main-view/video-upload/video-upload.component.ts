import { Component, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CATEGORY_CHOICES } from 'src/app/models/video.model';
import { MaterialModule } from 'src/app/material/material.module';
import { MainLayoutComponent } from '../main-layout/main-layout.component';

/** Same limit as the backend (VFX-27); checked here to avoid a pointless upload. */
const MAX_FILE_SIZE = 50 * 1024 * 1024;
/** Same lengths as the backend model (video_app/models.py). */
export const TITLE_MAX_LENGTH = 150;
export const DESCRIPTION_MAX_LENGTH = 500;

/** Rejects text that is only whitespace; the backend refuses it as a blank title. */
function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { blank: true };
}

@Component({
  standalone: true,
  selector: 'app-video-upload',
  imports: [ReactiveFormsModule, RouterModule, MaterialModule, MainLayoutComponent],
  templateUrl: './video-upload.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./video-upload.component.scss'],
})
export class VideoUploadComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly categoryChoices = CATEGORY_CHOICES;
  readonly titleMaxLength = TITLE_MAX_LENGTH;
  readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;
  readonly uploadForm = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, notBlank, Validators.minLength(4), Validators.maxLength(TITLE_MAX_LENGTH)]],
    description: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(DESCRIPTION_MAX_LENGTH)]],
    category: ['', Validators.required],
  });

  selectedFile: File | null = null;
  readonly uploading = signal(false);
  readonly uploadProgress = signal(0);
  readonly errorMessage = signal('');

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.errorMessage.set('');
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile || this.uploading()) return;
    if (this.selectedFile.size > MAX_FILE_SIZE) {
      this.errorMessage.set('The file must not be larger than 50 MB.');
      return;
    }
    this.errorMessage.set('');
    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.api.addVideo(this.buildFormData(this.selectedFile))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress.set(Math.round((100 * event.loaded) / event.total));
          } else if (event.type === HttpEventType.Response) {
            // The conversion runs in the background; browse shows its progress.
            this.router.navigate(['/browse']);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.uploading.set(false);
          this.errorMessage.set(this.messageFor(error));
        },
      });
  }

  private buildFormData(file: File): FormData {
    const { title, description, category } = this.uploadForm.getRawValue();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('video_file', file);
    return formData;
  }

  /** The backend's 400 messages are written for users; everything else gets a general text. */
  private messageFor(error: HttpErrorResponse): string {
    if (error.status === 400) {
      const fileError = error.error?.video_file?.[0];
      const titleField = error.error?.title;
      const titleError = Array.isArray(titleField) ? titleField[0] : titleField;
      const detail = error.error?.detail;
      if (typeof fileError === 'string') return fileError;
      if (typeof titleError === 'string') return titleError;
      if (typeof detail === 'string') return detail;
    }
    if (error.status === 429) {
      return 'You have uploaded a lot of videos recently. Please try again later.';
    }
    return 'The upload did not work. Please try again later.';
  }
}
