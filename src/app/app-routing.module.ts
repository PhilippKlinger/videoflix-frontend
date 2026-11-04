import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './authentication/home/home.component';
import { RegisterComponent } from './authentication/register/register.component';
import { LoginComponent } from './authentication/login/login.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { ActivateComponent } from './authentication/activate/activate.component';


import { VideoUploadComponent } from './main-view/video-upload/video-upload.component';

import { AuthGuard } from './services/auth-guard.service';

import { BrowseComponent } from './main-view/browse/browse.component';



const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'activate/:uid/:token', component: ActivateComponent },
  { path: 'reset-password/:uid/:token', component: ResetPasswordComponent },
  { path: 'browse', component: BrowseComponent, canActivate: [AuthGuard] },
  { path: 'upload', component: VideoUploadComponent, canActivate: [AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
