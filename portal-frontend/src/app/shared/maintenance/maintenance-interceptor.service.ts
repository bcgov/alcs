import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceInterceptorService implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request).pipe(
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
