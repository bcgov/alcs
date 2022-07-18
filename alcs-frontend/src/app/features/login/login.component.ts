import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  public token = '';

  async login() {
    await this.authenticationService.setToken(this.token);
    await this.router.navigateByUrl('/admin');
    console.log('LOGGING IN');
  }
}
