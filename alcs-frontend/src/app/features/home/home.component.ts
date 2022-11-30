import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthenticationService, ICurrentUser, ROLES } from '../../services/authentication/authentication.service';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  currentUser!: ICurrentUser;
  hasGIS = false;
  hasCommissioner = false;
  hasOtherRole = false;
  hasApplicationSpecialist = false;
  userProfile: UserDto | undefined;

  constructor(private authService: AuthenticationService, private userService: UserService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()!;
    this.userService.$userProfile.pipe(takeUntil(this.destroy)).subscribe((user) => {
      this.userProfile = user;
    });

    this.authService.$currentUser.subscribe((currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;

        this.hasGIS = !!currentUser.client_roles && currentUser.client_roles.includes(ROLES.GIS);
        this.hasCommissioner = !!currentUser.client_roles && currentUser.client_roles.includes(ROLES.COMMISSIONER);
        this.hasOtherRole =
          !!currentUser.client_roles &&
          currentUser.client_roles.filter((role) => {
            return role !== ROLES.COMMISSIONER && role !== ROLES.GIS;
          }).length > 0;
        this.hasApplicationSpecialist =
          !!currentUser.client_roles && currentUser.client_roles.includes(ROLES.APP_SPECIALIST);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
