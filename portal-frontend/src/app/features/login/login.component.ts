import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  async ngOnInit() {
    this.authenticationService.getToken(false);
    this.authenticationService.$currentProfile.pipe(takeUntil(this.$destroy)).subscribe((user) => {
      if (user) {
        this.router.navigateByUrl('/home');
      }
    });
  }

  async onLogin() {
    const res = await this.authenticationService.getLoginUrl();
    if (res) {
      const idpHint = '&kc_idp_hint=bceidboth';
      window.location.href = `${res.loginUrl}${idpHint}`;
    }
  }

  async navigateToPublicSearch() {
    await this.router.navigateByUrl('/public');
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
