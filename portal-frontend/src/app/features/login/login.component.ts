import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { MaintenanceService } from '../../services/maintenance/maintenance.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  constructor(
    private authenticationService: AuthenticationService,
    private maintenanceService: MaintenanceService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.maintenanceService.check();
    this.authenticationService.getToken(false);
    this.authenticationService.$currentProfile.pipe(takeUntil(this.$destroy)).subscribe((user) => {
      if (user) {
        this.router.navigateByUrl('/home');
      }
    });

    const login_failed = this.route.snapshot.queryParamMap.get('login_failed')?.toLowerCase() === 'true';

    if (login_failed) {
      this.toastService.showErrorToast(
        'Login failed. Please try again. If the problem persists, contact ALC.Portal@gov.bc.ca."',
      );
    }
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
