import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();
  isAuthenticated = false;
  isMenuOpen = false;
  showPublicSearchLink = true;
  showPortalLink = false;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authenticationService.$currentTokenUser.pipe(takeUntil(this.$destroy)).subscribe((user) => {
      this.isAuthenticated = !!user;
      this.changeDetectorRef.detectChanges();
    });
    this.router.events.pipe(takeUntil(this.$destroy)).subscribe(() => {
      const url = window.location.href;
      const isPublic = url.includes('public');
      this.showPortalLink = isPublic;
      this.showPublicSearchLink = !isPublic;
    });
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

  onMenuClicked(url: string) {
    this.isMenuOpen = false;
    this.router.navigate([url]);
    this.toggleContent();
  }
}
