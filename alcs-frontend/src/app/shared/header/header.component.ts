import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ROLES_ALLOWED_APPLICATIONS } from '../../app-routing.module';
import { ApplicationService } from '../../services/application/application.service';
import { AuthenticationService, ICurrentUser, ROLES } from '../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
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
  userProfile?: UserDto;
  currentUser?: ICurrentUser;
  hasRoles = false;
  allowedSearch = false;
  sortedBoards: BoardWithFavourite[] = [];
  notifications: NotificationDto[] = [];
  isCommissioner = false;
  isAdmin = false;

  constructor(
    private authService: AuthenticationService,
    private applicationService: ApplicationService,
    private boardService: BoardService,
    private toastService: ToastService,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.$currentUser.subscribe((currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;
        this.hasRoles = !!currentUser.client_roles;
        this.isCommissioner =
          currentUser.client_roles && currentUser.client_roles.length === 1
            ? currentUser.client_roles.includes(ROLES.COMMISSIONER)
            : false;

        this.isAdmin = currentUser.client_roles ? currentUser.client_roles.includes(ROLES.ADMIN) : false;

        if (this.hasRoles) {
          this.applicationService.setup();
          this.loadNotifications();

          const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
            currentUser.client_roles!.includes(value)
          );
          this.allowedSearch = overlappingRoles.length > 0;
        }
      }
    });

    this.userService.$userProfile.subscribe((user) => {
      this.userProfile = user;
    });

    this.boardService.$boards.subscribe(
      (dms) => (this.sortedBoards = dms.sort((x, y) => this.sortDecisionMakers(x, y)))
    );
  }

  private sortDecisionMakers(x: BoardWithFavourite, y: BoardWithFavourite) {
    if (x.isFavourite && !y.isFavourite) {
      return -1;
    }

    if (y.isFavourite && !x.isFavourite) {
      return 1;
    }

    if (x.isFavourite === y.isFavourite) {
      if (x.title > y.title) {
        return 1;
      }
      if (x.title < y.title) {
        return -1;
      }
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

  onAdmin() {
    this.router.navigateByUrl('/admin');
  }
}
