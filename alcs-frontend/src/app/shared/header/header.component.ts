import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApplicationDecisionMakerDto } from '../../services/application/application-code.dto';
import { ApplicationService } from '../../services/application/application.service';
import { AuthenticationService, ICurrentUser } from '../../services/authentication/authentication.service';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  homeUrl = environment.homeUrl;
  decisionMakers: ApplicationDecisionMakerDto[] = [];
  currentUser!: ICurrentUser;
  currentUserProfile?: UserDto;

  constructor(
    private authService: AuthenticationService,
    private applicationService: ApplicationService,
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

    this.applicationService.$applicationDecisionMakers.subscribe((dms) => {
      this.decisionMakers = dms;
    });
  }

  onSelectBoard(event: Event) {
    //@ts-ignore
    const newCode = event.currentTarget.value;
    this.router.navigateByUrl(`/board/${newCode}`);
  }

  onLogout() {
    this.authService.logout();
  }

  isFavorite(dm: ApplicationDecisionMakerDto) {
    return this.currentUserProfile?.settings?.favoriteBoards.includes(dm.code);
  }

  onFavoriteClicked(event: any, dm: ApplicationDecisionMakerDto) {
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

    this.userService.updateUser(this.currentUserProfile).then(() => {
      // this.userService.fetchUsers();
    });
  }
}
