import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  template: '<div></div>',
})
export class LoginComponent implements OnInit {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  async ngOnInit() {
    const hasToken = await this.authenticationService.getToken();
    if (hasToken) {
      await this.router.navigateByUrl(environment.homeUrl);
    }
  }
}
