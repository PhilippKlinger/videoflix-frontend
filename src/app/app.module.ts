import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

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
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
