import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDecisionMakerDto } from '../../services/application/application-code.dto';
import { ApplicationService } from '../../services/application/application.service';
import { AuthenticationService, ICurrentUser } from '../../services/authentication/authentication.service';
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
  currentUser!: ICurrentUser;
  currentUserProfile?: UserDto;
  private decisionMakers: ApplicationDecisionMakerDto[] = [];
  $sortedDecisionMakers!: Observable<ApplicationDecisionMakerDto[]>;

  constructor(
    private authService: AuthenticationService,
    private applicationService: ApplicationService,
    private toastService: ToastService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.loadTokenFromStorage().then(() => {
      this.applicationService.setup();
      this.userService.fetchUsers();
      this.currentUser = this.authService.getCurrentUser();
    });

    this.userService.$users.subscribe((users) => {
      this.currentUserProfile = users.find((u) => u.email === this.currentUser.email);
    });

    this.$sortedDecisionMakers = this.applicationService.$applicationDecisionMakers.pipe(
      map((dms) => this.transformDecisionMakers(dms))
    );
  }

  private transformDecisionMakers(dms: ApplicationDecisionMakerDto[]) {
    this.decisionMakers = dms
      .map((dm) => {
        return {
          ...dm,
          isFavorite: this.currentUserProfile?.settings?.favoriteBoards?.includes(dm.code),
        };
      })
      .sort((x, y) => this.sortDecisionMakers(x, y));
    return this.decisionMakers;
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

  onLogout() {
    this.authService.logout();
  }

  async onFavoriteClicked(event: any, dm: ApplicationDecisionMakerDto) {
    event.stopPropagation();
    console.log(dm);
    if (!this.currentUserProfile) {
      return;
    }

    const favoriteBoards = [...this.currentUserProfile.settings.favoriteBoards];
    if (favoriteBoards.includes(dm.code)) {
      const index = favoriteBoards.indexOf(dm.code);
      if (index > -1) {
        favoriteBoards.splice(index, 1);
      }
      this.currentUserProfile.settings.favoriteBoards = favoriteBoards;
    } else {
      this.currentUserProfile.settings.favoriteBoards.push(dm.code);
    }

    try {
      await this.userService.updateUser(this.currentUserProfile);
      await this.userService.fetchUsers();
      this.applicationService.$applicationDecisionMakers.next(this.decisionMakers);
    } catch {
      this.toastService.showErrorToast('Failed to set favorites');
    }
  }

  handleClick() {
    console.log('here');
  }
}
