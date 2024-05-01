import { Component, OnInit } from '@angular/core';
import { Profile } from '../models/profile.model';
import { SelectProfileService } from '../services/select-profile.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {
  selectedProfile!: Profile | null;
  avatarUrl: string = this.showAvatarUrl();

  constructor(private profileService: SelectProfileService, private apiService: ApiService) {}

  ngOnInit() {
    this.profileService.selectedProfile$.subscribe(
      profile => this.selectedProfile = profile
   
    );
    console.log(this.selectedProfile)
  }

  showAvatarUrl(): string {
    const avatarPath = this.selectedProfile?.avatar
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${ '/static/' + avatarPath}`;
  }
}