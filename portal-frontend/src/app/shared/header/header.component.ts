import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserDto } from '../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { MaintenanceService } from '../../services/maintenance/maintenance.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();
  isAuthenticated = false;
  isMenuOpen = false;
  isOnPublicPage = false;
  isUserMenuOpen = false;

  title = 'Provincial Agricultural Land Commission Portal';
  user: UserDto | undefined;

  showMaintenanceBanner = false;
  maintenanceBannerMessage = '';

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private maintenanceService: MaintenanceService
  ) {}

  ngOnInit(): void {
    this.authenticationService.$currentProfile.pipe(takeUntil(this.$destroy)).subscribe((user) => {
      this.isAuthenticated = !!user;
      this.user = user;
      this.changeDetectorRef.detectChanges();
    });

    this.setMaintenanceBanner();

    this.router.events.pipe(takeUntil(this.$destroy)).subscribe(() => {
      const url = window.location.href;
      this.isOnPublicPage = url.includes('public');
    });
  }

  async setMaintenanceBanner() {
    const maintenanceBanner = await this.maintenanceService.getBanner();
    this.showMaintenanceBanner = maintenanceBanner?.showBanner || false;
    this.maintenanceBannerMessage = maintenanceBanner?.message || '';
  }

  async onLogout() {
    await this.authenticationService.logout();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onMenuToggle() {
    this.isMenuOpen = !this.isMenuOpen;
    this.toggleContent();
  }

  private toggleContent() {
    const body = document.getElementById('appBody');
    const footer = document.getElementById('appFooter');
    const hidden = 'display-none';
    body?.classList.toggle(hidden);
    footer?.classList.toggle(hidden);
  }

  async onUserMenuToggle() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  async onMenuClicked(url: string) {
    this.isMenuOpen = false;
    await this.router.navigate([url]);
    this.toggleContent();
  }

  async onClickLogo() {
    let targetUrl = '/home';

    const isOnLogin = window.location.href.endsWith('/login');
    if (isOnLogin) {
      targetUrl = '/login';
    }
    if (this.isOnPublicPage) {
      targetUrl = '/public';
    }

    await this.router.navigateByUrl(targetUrl);
  }
}
