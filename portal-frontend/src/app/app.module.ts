import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideNgxMask } from 'ngx-mask';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { LoginComponent } from './features/login/login.component';
import { AuthInterceptorService } from './services/authentication/auth-interceptor.service';
import { TokenRefreshService } from './services/authentication/token-refresh.service';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './shared/confirmation-dialog/confirmation-dialog.service';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { MaintenanceInterceptorService } from './shared/maintenance/maintenance-interceptor.service';
import { SharedModule } from './shared/shared.module';
import { WarningBannerComponent } from './shared/warning-banner/warning-banner.component';
import { MaintenanceComponent } from './features/maintenance/maintenance.component';
import { MaintenanceBannerComponent } from './shared/header/maintenance-banner/maintenance-banner.component';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    AuthorizationComponent,
    ConfirmationDialogComponent,
    MaintenanceComponent,
    MaintenanceBannerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    MatSortModule,
    MatPaginatorModule,
    MatToolbarModule,
  ],
  exports: [WarningBannerComponent],
  providers: [
    ConfirmationDialogService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: MaintenanceInterceptorService, multi: true },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        ...new MatDialogConfig(),
        disableClose: true,
      } as MatDialogConfig,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (service: TokenRefreshService) => () => {
        return service.init();
      },
      deps: [TokenRefreshService],
      multi: true,
    },
    provideNgxMask(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
