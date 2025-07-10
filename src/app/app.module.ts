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

import { AuthInterceptor } from './services/auth-interceptor.service';
import { HttpErrorInterceptor } from './services/http-error-interceptor.service';

import { VideoUploadComponent } from './main-view/video-upload/video-upload.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';






@NgModule({
    declarations: [
        AppComponent,
        ImprintComponent,
        VideoUploadComponent,
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
