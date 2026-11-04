import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAppHttpClient } from './http.providers';


import { AuthInterceptor } from './services/auth-interceptor.service';
import { HttpErrorInterceptor } from './services/http-error-interceptor.service';






@NgModule({
    declarations: [
        AppComponent,
    ],
    // The shell only renders the router outlet; pages are standalone and import Material and forms themselves.
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule],

    providers: [
        // Order matters: the error interceptor sits outside, so it only sees
        // errors that remain after the auth interceptor tried a token refresh.
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpErrorInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        provideAppHttpClient(),
    ]
})
export class AppModule { }
