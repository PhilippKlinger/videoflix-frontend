import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material/material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ImprintComponent } from './imprint/imprint.component';
import { NavbarComponent } from './main-view/navbar/navbar.component';
import { MainViewComponent } from './main-view/main-view.component';
import { VideoListComponent } from './main-view/video-list/video-list.component';
import { AuthInterceptor } from './services/auth-interceptor.service';
import { HttpErrorInterceptor } from './services/http-error-interceptor.service';
import { FavoriteListComponent } from './main-view/favorite-list/favorite-list.component';
import { VideoUploadComponent } from './main-view/video-upload/video-upload.component';
// import { VideoPlayerComponent } from './video-player/video-player.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MoviesListComponent } from './main-view/movies-list/movies-list.component';
import { TvShowsListComponent } from './main-view/tv-shows-list/tv-shows-list.component';
import { RandomVideoPreviewComponent } from './main-view/random-video-preview/random-video-preview.component';




@NgModule({
    declarations: [
        AppComponent,
        ImprintComponent,
        NavbarComponent,
        MainViewComponent,
        VideoListComponent,
        FavoriteListComponent,
        VideoUploadComponent,
        // VideoPlayerComponent,
        MoviesListComponent,
        TvShowsListComponent,
        RandomVideoPreviewComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        VgCoreModule,
        VgControlsModule,
        VgOverlayPlayModule,
        VgBufferingModule,
        AppRoutingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MaterialModule,
    CommonModule],

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
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class AppModule { }
