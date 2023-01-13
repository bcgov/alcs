import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { CreateApplicationDialogComponent } from './features/create-application-dialog/create-application-dialog.component';
import { ChangeApplicationTypeDialogComponent } from './features/edit-application/change-application-type-dialog/change-application-type-dialog.component';
import { EditApplicationComponent } from './features/edit-application/edit-application.component';
import { ParcelEntryComponent } from './features/edit-application/parcel-entry/parcel-entry.component';
import { ApplicationListComponent } from './features/home/application-list/application-list.component';
import { HomeComponent } from './features/home/home.component';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { LoginComponent } from './features/login/login.component';
import { AuthInterceptorService } from './services/authentication/auth-interceptor.service';
import { TokenRefreshService } from './services/authentication/token-refresh.service';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './shared/confirmation-dialog/confirmation-dialog.service';
import { DragDropDirective } from './shared/file-drag-drop/drag-drop.directive';
import { FileDragDropComponent } from './shared/file-drag-drop/file-drag-drop.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { FileSizePipe } from './shared/pipes/fileSize.pipe';
import { SharedModule } from './shared/shared.module';
import { ViewApplicationComponent } from './features/view-application/view-application.component';
import { ReviewApplicationComponent } from './features/review-application/review-application.component';
import { ReviewContactInformationComponent } from './features/review-application/review-contact-information/review-contact-information.component';
import { ReviewOcpComponent } from './features/review-application/review-ocp/review-ocp.component';
import { ReviewZoningComponent } from './features/review-application/review-zoning/review-zoning.component';
import { ReviewResolutionComponent } from './features/review-application/review-resolution/review-resolution.component';
import { ReviewAttachmentsComponent } from './features/review-application/review-attachments/review-attachments.component';
import { ReviewSubmitComponent } from './features/review-application/review-submit/review-submit.component';
import { NoDataComponent } from './shared/no-data/no-data.component';

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
    CreateApplicationDialogComponent,
    ChangeApplicationTypeDialogComponent,
    LandingPageComponent,
    ParcelEntryComponent,
    FileSizePipe,
    ConfirmationDialogComponent,
    ViewApplicationComponent,
    ReviewApplicationComponent,
    ReviewContactInformationComponent,
    ReviewOcpComponent,
    ReviewZoningComponent,
    ReviewResolutionComponent,
    ReviewAttachmentsComponent,
    ReviewSubmitComponent,
    NoDataComponent,
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
    MatToolbarModule,
    MatButtonToggleModule,
    MatExpansionModule,
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
