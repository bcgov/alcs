import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-authorization',
  template: `<>`,
})
export class AuthorizationComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthenticationService) {}

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('t');
    const refreshToken = this.route.snapshot.queryParamMap.get('r');
    const noRoles = this.route.snapshot.queryParamMap.get('noroles');
    if (token && refreshToken) {
      await this.authService.setTokens(token, refreshToken);

      if (noRoles) {
        await this.router.navigateByUrl('/provision');
      } else {
        await this.router.navigateByUrl(environment.homeUrl);
      }
    } else {
      console.error('Failed to receive tokens from redirect');
    }
  }
}
