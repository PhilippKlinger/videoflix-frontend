import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './authentication/home/home.component';
import { RegisterComponent } from './authentication/register/register.component';
import { LoginComponent } from './authentication/login/login.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';


import { VideoUploadComponent } from './main-view/video-upload/video-upload.component';

import { AuthGuard } from './services/auth-guard.service';

import { BrowseComponent } from './main-view/browse/browse.component';



const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:code', component: ResetPasswordComponent },
  {
    path: 'browse', component: BrowseComponent, canActivate: [AuthGuard],
    children: [
      { path: 'video-upload', component: VideoUploadComponent }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
