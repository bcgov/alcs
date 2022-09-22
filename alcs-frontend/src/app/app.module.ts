import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectConfig } from '@ng-select/ng-select';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { BoardModule } from './features/board/board.module';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { LoginComponent } from './features/login/login.component';
import { ProvisionComponent } from './features/provision/provision.component';
import { AuthInterceptorService } from './services/authentication/auth-interceptor.service';
import { AuthenticationService } from './services/authentication/authentication.service';
import { BoardService } from './services/board/board.service';
import { DecisionMeetingService } from './services/decision-meeting/decision-meeting.service';
import { NotificationService } from './services/notification/notification.service';
import { ToastService } from './services/toast/toast.service';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './shared/confirmation-dialog/confirmation-dialog.service';
import { HeaderComponent } from './shared/header/header.component';
import { NotificationsComponent } from './shared/header/notifications/notifications.component';
import { SearchBarComponent } from './shared/header/search-bar/search-bar.component';
import { SharedModule } from './shared/shared.module';
import { MomentPipe } from './shared/utils/moment.pipe';

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
  imports: [BrowserModule, BrowserAnimationsModule, SharedModule.forRoot(), AppRoutingModule, BoardModule],
  providers: [
    AuthenticationService,
    ToastService,
    ConfirmationDialogService,
    NotificationService,
    BoardService,
    DecisionMeetingService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { panelClass: 'mat-dialog-override' } },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private config: NgSelectConfig) {
    this.config.notFoundText = 'No results';
  }
}
