import { DragDropModule } from '@angular/cdk/drag-drop';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { AuthInterceptorService } from './services/authentication/auth-interceptor.service';
import { AuthenticationService } from './services/authentication/authentication.service';
import { AdminComponent } from './features/admin/admin.component';
import { LoginComponent } from './features/login/login.component';
import { DragDropBoardComponent } from './shared/drag-drop-board/drag-drop-board.component';
import { StatusFilterPipe } from './shared/drag-drop-board/status-filter.pipe';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardDetailDialogComponent } from './card-detail-dialog/card-detail-dialog.component';

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
  ],
  providers: [AuthenticationService, { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
