import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorMessage = new BehaviorSubject<string>('');

  constructor() {}

  log(message: string) {
    this.errorMessage.next(message);
  }

  getErrorMessage() {
    return this.errorMessage.asObservable();
  }

  clearMessage() {
    this.errorMessage.next('');
  }
}
