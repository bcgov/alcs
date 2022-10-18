import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService, ROLES } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class HasRolesGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const hasToken = await this.authenticationService.getToken();
    const currentUser = await this.authenticationService.getCurrentUser();
    if (!hasToken || !currentUser) {
      return this.router.parseUrl('/login');
    }

    if (!currentUser.client_roles) {
      return this.router.parseUrl('/provision');
    }

    const allowedRoles: ROLES[] = route.data['roles'];
    if (!allowedRoles) {
      console.error('HasRolesGuard has no configured roles for route');
      return this.router.parseUrl('/home');
    }

    const overlappingRoles = allowedRoles.filter((value) => currentUser.client_roles!.includes(value));
    if (overlappingRoles.length > 0) {
      return true;
    } else {
      return this.router.parseUrl('/home');
    }
  }
}
