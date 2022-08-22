import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApplicationDecisionMakerDto } from '../../services/application/application-code.dto';
import { ApplicationService } from '../../services/application/application.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { NotificationDto } from '../../services/notification/notification.dto';
import { NotificationService } from '../../services/notification/notification.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  homeUrl = environment.homeUrl;
  currentUserProfile?: UserDto;
  sortedDecisionMakers: ApplicationDecisionMakerDto[] = [];
  notifications: NotificationDto[] = [];

  constructor(
    private authService: AuthenticationService,
    private applicationService: ApplicationService,
    private toastService: ToastService,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.userService.fetchUsers();
        this.applicationService.setup();
        this.loadNotifications();
      }
    });

    this.userService.$currentUserProfile.subscribe((user) => {
      this.currentUserProfile = user;
    });

    this.applicationService.$applicationDecisionMakers.subscribe(
      (dms) => (this.sortedDecisionMakers = dms.sort((x, y) => this.sortDecisionMakers(x, y)))
    );
  }

  private sortDecisionMakers(x: ApplicationDecisionMakerDto, y: ApplicationDecisionMakerDto) {
    if (x.isFavorite && !y.isFavorite) {
      return -1;
    }

    if (y.isFavorite && !x.isFavorite) {
      return 1;
    }

    if (x.isFavorite === y.isFavorite) {
      if (x.label > y.label) return 1;
      if (x.label < y.label) return -1;
    }
    return 0;
  }

  onSelectBoard(dmCode: string) {
    this.router.navigateByUrl(`/board/${dmCode}`);
  }

  private async loadNotifications() {
    this.notifications = await this.notificationService.fetchMyNotifications();
  }

  onLogout() {
    this.authService.logout();
  }
}
