import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../login/login.component.scss'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  emailCheckForm!: FormGroup;
  registerForm!: FormGroup;
  selectRegisterFormAction: string = 'enterEmail';
  requestloading = false;
  registerSuccess = false;
  errorMessage = '';
  statusMessage = '';
  timeLeft = 5;
  countdownTimer: any;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private errorService: ErrorHandlingService
  ) { }

  ngOnInit(): void {
    this.initForms();

    this.errorService.getErrorMessage().subscribe(message => {
      this.errorMessage = message;
    });
  }

  initForms(): void {
    this.emailCheckForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirm: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('password_confirm')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmitEmailCheck(): void {
    this.errorMessage = '';
    if (this.emailCheckForm.valid) {
      this.selectRegisterFormAction = 'registerNewUser';
      this.registerForm.controls['email'].setValue(this.emailCheckForm.controls['email'].value);
      localStorage.setItem('emailForLogin', this.emailCheckForm.controls['email'].value);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.statusMessage = '';

    if (this.registerForm.valid) {
      this.requestloading = true;
      this.apiService.registerUser(this.registerForm.value).subscribe({
        next: () => {
          this.registerSuccess = true;
          this.requestloading = false;

          this.countdownTimer = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
              clearInterval(this.countdownTimer);
              this.router.navigate(['/login']);
            }
          }, 1000);
        },
        error: (error) => {
          this.requestloading = false;
          this.errorMessage = 'Registrierung fehlgeschlagen. Bitte versuche es erneut.';
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }
}
