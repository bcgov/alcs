import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { AuthInterceptorService } from './services/authentication/auth-interceptor.service';
import { TokenRefreshService } from './services/authentication/token-refresh.service';
import { DragDropDirective } from './shared/file-drag-drop/drag-drop.directive';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { SharedModule } from './shared/shared.module';
import { CreateApplicationComponent } from './features/create-application/create-application.component';
import { FileDragDropComponent } from './shared/file-drag-drop/file-drag-drop.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    HomeComponent,
    AuthorizationComponent,
    CreateApplicationComponent,
    FileDragDropComponent,
    DragDropDirective,
  ],
  imports: [BrowserModule, AppRoutingModule, SharedModule, MatStepperModule, MatAutocompleteModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: (service: TokenRefreshService) => () => {
        return service.init();
      },
      deps: [TokenRefreshService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
