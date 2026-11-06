import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './services/auth-guard.service';


// Every page is loaded on demand, so the initial bundle only holds the app shell.
export const routes: Routes = [
  { path: '', loadComponent: () => import('./authentication/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./authentication/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./authentication/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./authentication/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'activate/:uid/:token', loadComponent: () => import('./authentication/activate/activate.component').then(m => m.ActivateComponent) },
  { path: 'reset-password/:uid/:token', loadComponent: () => import('./authentication/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'browse', loadComponent: () => import('./main-view/browse/browse.component').then(m => m.BrowseComponent), canActivate: [AuthGuard] },
  { path: 'upload', loadComponent: () => import('./main-view/video-upload/video-upload.component').then(m => m.VideoUploadComponent), canActivate: [AuthGuard] },
  // Public and linked from every footer; German like the legal terms they use.
  { path: 'impressum', loadComponent: () => import('./legal/imprint.component').then(m => m.ImprintComponent), title: 'Impressum · Videoflix' },
  { path: 'datenschutz', loadComponent: () => import('./legal/privacy.component').then(m => m.PrivacyComponent), title: 'Datenschutz · Videoflix' },
  // Must stay last so it only catches urls no other route matches.
  { path: '**', loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
