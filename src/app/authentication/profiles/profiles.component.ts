import { Component, OnInit } from '@angular/core';
import { Profile } from 'src/app/models/profile.model';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { SelectProfileService } from 'src/app/services/select-profile.service';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent implements OnInit {
  profiles: Profile[] = [];
  avatars = [
    'avatars/avatar_1.png',
    'avatars/avatar_2.png',
    'avatars/avatar_3.png',
    'avatars/avatar_0.png',
    'avatars/avatar_4.png',
    'avatars/avatar_5.png',
    // Weitere Avatare
  ];
  selectedProfile!: Profile;
  editMode: boolean = false;
  editSelectedProfile: boolean = false;
  editingProfile?: Profile;
  editName: string = '';
  editAvatar: string = '';

  constructor(private apiService: ApiService, private router: Router, private profileService: SelectProfileService) { }

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles() {
    this.apiService.getProfiles().subscribe({
      next: (data) => {
        this.profiles = data;
      },
      error: (error) => {
        console.error('Failed to load profiles', error);
      }
    });
  }

  addProfile(profileData: Profile) {
    this.apiService.createProfile(profileData).subscribe({
      next: (newProfile) => {
        this.profiles.push(newProfile);
      },
      error: (error) => {
        console.error('Failed to add profile', error);
      }
    });
  }

  saveProfile() {
    if (this.editingProfile) {
      this.editingProfile.name = this.editName;
      this.apiService.updateProfile(this.editingProfile.id, this.editingProfile).subscribe({
        next: (updatedProfile) => {
          const index = this.profiles.findIndex(p => p.id === updatedProfile.id);
          if (index !== -1) {
            this.profiles[index] = updatedProfile;
          }
          this.editSelectedProfile = false;
        },
        error: (error) => {
          console.error('Failed to update profile', error);
        }
      });
    }
  }

  deleteProfile(profileId: number) {
    this.apiService.deleteProfile(profileId).subscribe({
      next: () => {
        this.profiles = this.profiles.filter(profile => profile.id !== profileId);
      },
      error: (error) => {
        console.error('Failed to delete profile', error);
      }
    });
  }

  showAvatarUrl(avatarPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${'/static/' + avatarPath}`;
  }

  selectProfile(profile: Profile) {
    if (!this.editMode) {
      this.profileService.selectProfile(profile);
      this.router.navigate(['/main-view']);
    } else {
      this.editSelectedProfile = true;
      this.editingProfile = { ...profile };
      this.editName = profile.name;
      this.editAvatar = profile.avatar;
    }
  }

  cancelEditing() {
    this.editSelectedProfile = false;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.editingProfile = undefined;
    }
  }

  changeAvatar(avatar: string) {
    if (this.editingProfile) {
      this.editingProfile.avatar = avatar;
    }
  }

}
