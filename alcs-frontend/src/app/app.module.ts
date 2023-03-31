import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectConfig } from '@ng-select/ng-select';
import { provideNgxMask } from 'ngx-mask';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { LoginComponent } from './features/login/login.component';
import { ProvisionComponent } from './features/provision/provision.component';
import { AuthInterceptorService } from './services/authentication/auth-interceptor.service';
import { TokenRefreshService } from './services/authentication/token-refresh.service';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { HeaderComponent } from './shared/header/header.component';
import { NotificationsComponent } from './shared/header/notifications/notifications.component';
import { SearchBarComponent } from './shared/header/search-bar/search-bar.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    NotFoundComponent,
    AuthorizationComponent,
    ProvisionComponent,
    ConfirmationDialogComponent,
    NotificationsComponent,
    SearchBarComponent,
  ],
  imports: [BrowserModule, BrowserAnimationsModule, SharedModule.forRoot(), AppRoutingModule, MomentDateModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { panelClass: 'mat-dialog-override' } },
    provideNgxMask(),
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
export class AppModule {
  constructor(private config: NgSelectConfig) {
    this.config.notFoundText = 'No results';
  }
}
