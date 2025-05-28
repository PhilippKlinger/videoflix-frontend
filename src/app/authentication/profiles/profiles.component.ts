import { Component, OnInit } from '@angular/core';
import { Profile } from 'src/app/models/profile.model';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { SelectProfileService } from 'src/app/services/select-profile.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
    selector: 'app-profiles',
    templateUrl: './profiles.component.html',
    styleUrls: ['./profiles.component.scss'],
    standalone: false
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
  selectProfileAction: string = 'selectProfile';
  editingProfile?: Profile;
  editName: string = '';
  editAvatar: string = '';
  editId!: number;
  profilesForm!: FormGroup;

  constructor(private apiService: ApiService, private router: Router, private profileService: SelectProfileService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadProfiles();
    this.profilesForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(8)]],
      avatar: ['avatars/avatar_0.png'],
      user: localStorage.getItem('userId')
    });
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

  addProfile() {
    if (this.profilesForm.valid) {
      this.apiService.createProfile(this.profilesForm.value).subscribe({
        next: (newProfile) => {
          this.profiles.push(newProfile);
          this.selectProfileAction= 'selectProfile';
          this.profilesForm.controls['name'].reset('');
        },
        error: (error) => {
          console.error('Failed to add profile', error);
        }
      });
    }
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
          this.selectProfileAction = 'selectProfile';
        },
        error: (error) => {
          console.error('Failed to update profile', error);
        }
      });
    }
  }

  deleteProfile(profileId: number) {
    // Mat dialog einbauen später 
    const confirmation = confirm('Please confirm to delete this Profile!');
    if (confirmation) {
      this.apiService.deleteProfile(profileId).subscribe({
        next: () => {
          this.profiles = this.profiles.filter(profile => profile.id !== profileId);
          this.toggleEditMode()
          this.selectProfileAction = 'selectProfile';
        },
        error: (error) => {
          console.error('Failed to delete profile', error);
        }
      });
    }
  }
  

  showAvatarUrl(avatarPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${'/static/' + avatarPath}`;
  }

  selectProfile(profile: Profile) {
    if (!this.editMode) {
      this.profileService.selectProfile(profile);
      this.router.navigate(['/browse']);
    } else {
      this.selectProfileAction = 'editProfile';
      this.editingProfile = { ...profile };
      this.editName = profile.name;
      this.editAvatar = profile.avatar;
      this.editId = profile.id;
    }
  }

  cancelEditing() {
    this.selectProfileAction = 'selectProfile';
    this.profilesForm.controls['name'].reset('');
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

  addNewProfile() {
    this.selectProfileAction = 'addProfile';
  }
}
