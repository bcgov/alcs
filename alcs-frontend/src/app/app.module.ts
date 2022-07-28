import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './features/admin/admin.component';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { CardDetailDialogComponent } from './features/card-detail-dialog/card-detail-dialog.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { LoginComponent } from './features/login/login.component';
import { AuthInterceptorService } from './services/authentication/auth-interceptor.service';
import { AuthenticationService } from './services/authentication/authentication.service';
import { ToastService } from './services/toast/toast.service';
import { CardComponent } from './shared/card/card.component';
import { DragDropBoardComponent } from './shared/drag-drop-board/drag-drop-board.component';
import { StatusFilterPipe } from './shared/drag-drop-board/status-filter.pipe';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    NotFoundComponent,
    DragDropBoardComponent,
    StatusFilterPipe,
    AuthorizationComponent,
    CardDetailDialogComponent,
    CardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    MatCardModule,
    DragDropModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule,
    NgSelectModule,
    NgOptionHighlightModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  providers: [
    AuthenticationService,
    ToastService,
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
