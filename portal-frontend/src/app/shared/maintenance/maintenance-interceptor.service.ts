import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, tap, throwError } from 'rxjs';
import { MaintenanceService } from '../../services/maintenance/maintenance.service';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceInterceptorService implements HttpInterceptor {
  constructor(private router: Router, private maintenanceService: MaintenanceService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request).pipe(
      // TODO: Add test
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const responseJson = JSON.parse(event.body);
          this.maintenanceService.setShowBanner(responseJson.showMaintenanceBanner);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 503) {
          this.router.navigate(['/maintenance']);
          return EMPTY;
        }
        return throwError(() => error);
      })
    );
  }
}
