import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss', '../../authentication/login/login.component.scss']
})
export class VideoUploadComponent implements OnInit {
  uploadForm!: FormGroup;
  requestloading: boolean = false;
  selectedFile!: File | null;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router) { }


  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(4)]],
      description: ['', [Validators.required, Validators.minLength(4)]],
      videoFile: [null, Validators.required]
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.uploadForm.patchValue({
        videoFile: this.selectedFile
      });
    }
  }

  onSubmit() {
    if (this.uploadForm.valid) {
      this.requestloading = true;
      const formData = new FormData();
      formData.append('title', this.uploadForm.get('title')?.value);
      formData.append('description', this.uploadForm.get('description')?.value);
      if (this.selectedFile) {
        formData.append('video_file', this.selectedFile);
      }

      this.apiService.addVideo(formData).subscribe({
        next: (response) => {
          console.log('Video Upload successful', response);
          this.requestloading = false;
          // this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Video Upload failed', error);
          this.requestloading = false;
        }
      });
    }
  }

}


