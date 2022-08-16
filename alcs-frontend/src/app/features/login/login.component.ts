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
    if (await this.authenticationService.loadTokenFromStorage()) {
      this.router.navigateByUrl(environment.homeUrl);
    }
  }
}
