import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './authentication/register/register.component';
import { LoginComponent } from './authentication/login/login.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ProfilesComponent } from './authentication/profiles/profiles.component';
import { ImprintComponent } from './imprint/imprint.component';
import { NavbarComponent } from './main-view/navbar/navbar.component';
import { MainViewComponent } from './main-view/main-view.component';
import { VideoListComponent } from './main-view/video-list/video-list.component';
import { AuthInterceptor } from './services/auth-interceptor.service';
import { HttpErrorInterceptor } from './services/http-error-interceptor.service';
import { FavoriteListComponent } from './main-view/favorite-list/favorite-list.component';
import { VideoUploadComponent } from './main-view/video-upload/video-upload.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MoviesListComponent } from './main-view/movies-list/movies-list.component';
import { TvShowsListComponent } from './main-view/tv-shows-list/tv-shows-list.component';




@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    ProfilesComponent,
    ImprintComponent,
    NavbarComponent,
    MainViewComponent,
    VideoListComponent,
    FavoriteListComponent,
    VideoUploadComponent,
    VideoPlayerComponent,
    MoviesListComponent,
    TvShowsListComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
