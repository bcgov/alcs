import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApplicationService } from '../../services/application/application.service';
import { AuthenticationService, ICurrentUser } from '../../services/authentication/authentication.service';
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
  currentUserProfile?: UserDto;
  currentUser?: ICurrentUser;
  hasRoles = false;
  sortedBoards: BoardWithFavourite[] = [];
  notifications: NotificationDto[] = [];

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
      this.currentUser = currentUser;
      this.hasRoles = !!currentUser.client_roles;

      if (this.hasRoles) {
        this.userService.fetchUsers();
        this.applicationService.setup();
        this.loadNotifications();
      }
    });

    this.userService.$currentUserProfile.subscribe((user) => {
      this.currentUserProfile = user;
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
}
