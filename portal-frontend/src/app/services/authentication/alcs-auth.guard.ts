import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AlcsAuthGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const hasToken = await this.authenticationService.getToken(false);
    if (hasToken) {
      return true;
    }

    const res = await this.authenticationService.getLoginUrl();
    if (res && res.loginUrl) {
      //Set desired return URL to current page
      const targetUrl = window.location.href;
      localStorage.setItem('targetUrl', targetUrl);
      window.location.href = res.loginUrl;
    }

    return false;
  }
}
