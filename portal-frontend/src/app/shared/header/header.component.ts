import { Component, OnDestroy, OnInit } from '@angular/core';
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

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.authenticationService.$currentUser.pipe(takeUntil(this.$destroy)).subscribe((user) => {
      if (user) {
        this.isAuthenticated = true;
      }
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
    const body = document.getElementById('appBody');
    const footer = document.getElementById('appFooter');
    const hidden = 'display-none';
    body?.classList.toggle(hidden);
    footer?.classList.toggle(hidden);
  }
}
