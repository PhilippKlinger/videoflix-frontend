import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Profile } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class SelectProfileService {

  private selectedProfile = new BehaviorSubject<Profile | null>(null);
  selectedProfile$ = this.selectedProfile.asObservable();

  selectProfile(profile: Profile) {
    this.selectedProfile.next(profile);
  }

  
}
