import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService, ICurrentUser, ROLES } from '../../services/authentication/authentication.service';
import { CARD_SUBTASK_TYPE } from '../../services/card/card-subtask/card-subtask.dto';
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
  hasAgrologist = false;
  showPeerReview = false;
  userProfile: UserDto | undefined;

  SUBTASK_TYPE = CARD_SUBTASK_TYPE;
  GIS_DASHBOARD_URL = environment.embeddedDashboards.gis;

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(`${environment.siteName} | Home`);
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
        this.hasAgrologist = !!currentUser.client_roles && currentUser.client_roles.includes(ROLES.AGROLOGIST);
        this.showPeerReview =
          !!currentUser.client_roles &&
          currentUser.client_roles.filter((role) => {
            return role === ROLES.LUP || role === ROLES.SOIL_OFFICER;
          }).length > 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  protected readonly ROLES = ROLES;
}
