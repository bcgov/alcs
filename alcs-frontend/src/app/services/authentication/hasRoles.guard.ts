import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class HasRolesGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const hasToken = await this.authenticationService.getToken();
    const currentUser = await this.authenticationService.getCurrentUser();
    if (!hasToken) {
      this.router.navigateByUrl('/login');
      return false;
    }

    if (currentUser && !currentUser.client_roles) {
      this.router.navigateByUrl('/provision');
      return false;
    }

    return true;
  }
}
