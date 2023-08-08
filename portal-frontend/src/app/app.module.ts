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
import { ApplicationDetailsModule } from './features/applications/application-details/application-details.module';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { CreateSubmissionDialogComponent } from './features/create-submission-dialog/create-submission-dialog.component';
import { ApplicationListComponent } from './features/home/application-list/application-list.component';
import { HomeComponent } from './features/home/home.component';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { LoginComponent } from './features/login/login.component';
import { AlcReviewComponent } from './features/applications/view-submission/alc-review/alc-review.component';
import { SubmissionDocumentsComponent } from './features/applications/view-submission/alc-review/submission-documents/submission-documents.component';
import { LfngReviewComponent } from './features/applications/view-submission/lfng-review/lfng-review.component';
import { ViewApplicationSubmissionComponent } from './features/applications/view-submission/view-application-submission.component';
import { ViewNoticeOfIntentSubmissionComponent } from './features/notice-of-intents/view-submission/view-notice-of-intent-submission.component';
import { AuthInterceptorService } from './services/authentication/auth-interceptor.service';
import { TokenRefreshService } from './services/authentication/token-refresh.service';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './shared/confirmation-dialog/confirmation-dialog.service';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { SharedModule } from './shared/shared.module';
import { DecisionsComponent } from './features/applications/view-submission/alc-review/decisions/decisions.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    HomeComponent,
    AuthorizationComponent,
    ApplicationListComponent,
    CreateSubmissionDialogComponent,
    LandingPageComponent,
    ConfirmationDialogComponent,
    ViewApplicationSubmissionComponent,
    ViewNoticeOfIntentSubmissionComponent,
    LfngReviewComponent,
    AlcReviewComponent,
    SubmissionDocumentsComponent,
    DecisionsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    MatSortModule,
    MatPaginatorModule,
    MatToolbarModule,
    ApplicationDetailsModule,
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
    provideNgxMask(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
