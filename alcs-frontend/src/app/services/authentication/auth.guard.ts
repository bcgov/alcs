import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (!this.authenticationService.isInitialized) {
      await this.authenticationService.loadTokenFromStorage();
    }
    const token = await this.authenticationService.getToken();
    if (token) {
      return true;
    }
    this.router.navigateByUrl('/login');
    return false;
  }
}
