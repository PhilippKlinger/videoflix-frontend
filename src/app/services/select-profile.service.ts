import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Profile } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class SelectProfileService {

  private selectedProfile = new BehaviorSubject<Profile | null>(this.getProfileFromLocalStorage());
  selectedProfile$ = this.selectedProfile.asObservable();

  selectProfile(profile: Profile) {
    this.selectedProfile.next(profile);
    this.saveProfileToLocalStorage(profile);
  }  

  private saveProfileToLocalStorage(profile: Profile) {
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
  }

  private getProfileFromLocalStorage(): Profile | null {
    const profileJson = localStorage.getItem('selectedProfile');
    return profileJson ? JSON.parse(profileJson) : null;
  }
}
