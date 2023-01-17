import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { CreateApplicationDialogComponent } from './features/create-application-dialog/create-application-dialog.component';
import { ChangeApplicationTypeDialogComponent } from './features/edit-application/change-application-type-dialog/change-application-type-dialog.component';
import { EditApplicationComponent } from './features/edit-application/edit-application.component';
import { OwnerEntryComponent } from './features/edit-application/parcel-details/owner-entry/owner-entry.component';
import { ParcelDetailsComponent } from './features/edit-application/parcel-details/parcel-details.component';
import { ParcelEntryComponent } from './features/edit-application/parcel-details/parcel-entry/parcel-entry.component';
import { ApplicationListComponent } from './features/home/application-list/application-list.component';
import { HomeComponent } from './features/home/home.component';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { LoginComponent } from './features/login/login.component';
import { ViewApplicationComponent } from './features/view-application/view-application.component';
import { AuthInterceptorService } from './services/authentication/auth-interceptor.service';
import { TokenRefreshService } from './services/authentication/token-refresh.service';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './shared/confirmation-dialog/confirmation-dialog.service';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    HomeComponent,
    AuthorizationComponent,
    EditApplicationComponent,
    ApplicationListComponent,
    CreateApplicationDialogComponent,
    ChangeApplicationTypeDialogComponent,
    LandingPageComponent,
    ParcelEntryComponent,
    ConfirmationDialogComponent,
    ViewApplicationComponent,
    ParcelDetailsComponent,
    OwnerEntryComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    MatAutocompleteModule,
    MatSortModule,
    MatPaginatorModule,
    MatToolbarModule,
  ],
  providers: [
    ConfirmationDialogService,
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
