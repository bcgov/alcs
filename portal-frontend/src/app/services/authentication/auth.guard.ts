import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 20));
    const hasToken = await this.authenticationService.getToken();
    if (hasToken) {
      return true;
    }
    await this.router.navigateByUrl('/login');
    return false;
  }
}
