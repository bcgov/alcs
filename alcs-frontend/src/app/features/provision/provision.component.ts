import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-provision',
  templateUrl: './provision.component.html',
  styleUrls: ['./provision.component.scss'],
})
export class ProvisionComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();

  constructor(private authService: AuthenticationService, private router: Router) {}

  ngOnInit(): void {
    this.authService.$currentUser.pipe(takeUntil(this.destroy)).subscribe(async (user) => {
      if (user) {
        if (user.client_roles && user.client_roles.length > 0) {
          await this.router.navigateByUrl(environment.homeUrl);
        } else {
          this.authService.clearTokens();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  onLogout() {
    this.authService.logout();
  }
}
