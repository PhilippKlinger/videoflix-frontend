import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material/material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAppHttpClient } from './http.providers';
import { ImprintComponent } from './imprint/imprint.component';

import { AuthInterceptor } from './services/auth-interceptor.service';
import { HttpErrorInterceptor } from './services/http-error-interceptor.service';

import { VideoUploadComponent } from './main-view/video-upload/video-upload.component';






@NgModule({
    declarations: [
        AppComponent,
        ImprintComponent,
        VideoUploadComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        AppRoutingModule,
        ReactiveFormsModule,
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
        provideAppHttpClient(),
    ]
})
export class AppModule { }
