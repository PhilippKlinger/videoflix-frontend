import { Component } from '@angular/core';
import { Profile } from '../../models/profile.model';
import { ApiService } from '../../services/api.service';
import { SelectProfileService } from '../../services/select-profile.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  selectedProfile!: Profile | null;
  avatarUrl: string = this.showAvatarUrl();

  constructor(private profileService: SelectProfileService, private apiService: ApiService) {}

  ngOnInit() {
    this.profileService.selectedProfile$.subscribe(
      profile => this.selectedProfile = profile
   
    );
  }

  showAvatarUrl(): string {
    const avatarPath = this.selectedProfile?.avatar
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${ '/static/' + avatarPath}`;
  }
}
