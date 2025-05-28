import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './authentication/register/register.component';
import { LoginComponent } from './authentication/login/login.component';
import { MainViewComponent } from './main-view/main-view.component';
import { FavoriteListComponent } from './main-view/favorite-list/favorite-list.component';
import { VideoListComponent } from './main-view/video-list/video-list.component';
import { VideoUploadComponent } from './main-view/video-upload/video-upload.component';
import { MoviesListComponent } from './main-view/movies-list/movies-list.component';
import { TvShowsListComponent } from './main-view/tv-shows-list/tv-shows-list.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'browse', component: MainViewComponent,
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
