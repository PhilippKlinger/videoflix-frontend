import { Component, OnInit } from '@angular/core';
import { Profile } from '../../models/profile.model';
import { ApiService } from '../../services/api.service';
import { SelectProfileService } from '../../services/select-profile.service';
import { Router } from '@angular/router';
import { VideoService } from 'src/app/services/video.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: false
})
export class NavbarComponent implements OnInit {
  selectedProfile!: Profile | null;
  avatarUrl: string = this.showAvatarUrl();
  showDropdown: boolean = false;

  constructor(private profileService: SelectProfileService, private apiService: ApiService, private router: Router, private videoService: VideoService) {}

  ngOnInit() {
    this.profileService.selectedProfile$.subscribe(
      profile => {
        this.selectedProfile = profile;
        this.avatarUrl = this.showAvatarUrl();
      } 
    );
  }

  clearCache(): void {
    this.apiService.clearCache().subscribe({
      next: () => {
        this.videoService.loadVideos(); // Reload videos after cache is cleared
      },
      error: (error) => {
        console.error('Failed to clear cache', error);
      }
    });
  }

  showAvatarUrl(): string {
    if (this.selectedProfile && this.selectedProfile.avatar) {
      const avatarPath = this.selectedProfile.avatar;
      const baseUrl = this.apiService.baseUrl;
      return `${baseUrl}/static/${avatarPath}`;
    }
    return '';
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    localStorage.removeItem('selectedProfile'); 
    localStorage.removeItem('token'); 
    localStorage.removeItem('userId'); 
    this.router.navigate(['/login']); 
  }

  switchProfile() {
    this.router.navigate(['/profiles']);
  }

}
