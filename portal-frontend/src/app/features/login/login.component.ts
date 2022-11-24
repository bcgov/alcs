import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  async ngOnInit() {
    const hasToken = await this.authenticationService.getToken();
    if (hasToken) {
      await this.router.navigateByUrl('');
    }
  }

  async onLogin() {
    const res = await this.authenticationService.getLoginUrl();
    if (res) {
      window.location.href = res.loginUrl;
    }
  }
}
