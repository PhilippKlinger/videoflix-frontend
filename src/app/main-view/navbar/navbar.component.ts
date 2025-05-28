import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

import { Router } from '@angular/router';
import { VideoService } from 'src/app/services/video.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: false
})
export class NavbarComponent implements OnInit {


  showDropdown: boolean = false;

  constructor( private apiService: ApiService, private router: Router, private videoService: VideoService) {}

  ngOnInit() {
    
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
