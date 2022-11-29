import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
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
import { EditApplicationComponent } from './features/edit-application/edit-application.component';
import { FileDragDropComponent } from './shared/file-drag-drop/file-drag-drop.component';
import { ApplicationListComponent } from './features/home/application-list/application-list.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    HomeComponent,
    AuthorizationComponent,
    EditApplicationComponent,
    FileDragDropComponent,
    DragDropDirective,
    ApplicationListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatSortModule,
    MatPaginatorModule,
    SharedModule,
  ],
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
