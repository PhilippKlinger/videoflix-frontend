import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './authentication/home/home.component';
import { RegisterComponent } from './authentication/register/register.component';
import { LoginComponent } from './authentication/login/login.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';

import { MainViewComponent } from './main-view/main-view.component';
import { FavoriteListComponent } from './main-view/favorite-list/favorite-list.component';
import { VideoListComponent } from './main-view/video-list/video-list.component';
import { VideoUploadComponent } from './main-view/video-upload/video-upload.component';
import { MoviesListComponent } from './main-view/movies-list/movies-list.component';
import { TvShowsListComponent } from './main-view/tv-shows-list/tv-shows-list.component';
import { AuthGuard } from './services/auth-guard.service';



const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:code', component: ResetPasswordComponent },
  {
    path: 'browse', component: MainViewComponent, canActivate: [AuthGuard],
    children: [
      { path: '', component: VideoListComponent },
      { path: 'tv-shows', component: TvShowsListComponent },
      { path: 'movies', component: MoviesListComponent },
      { path: 'favorites', component: FavoriteListComponent },
      { path: 'video-upload', component: VideoUploadComponent }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
