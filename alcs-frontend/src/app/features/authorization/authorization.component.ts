import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-authorization',
  template: `<>`,
})
export class AuthorizationComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthenticationService) {}

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('t');
    if (token) {
      await this.authService.setToken(token);
      await this.router.navigateByUrl('/admin');
    }
  }
}
