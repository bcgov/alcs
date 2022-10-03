import { Component, OnInit } from '@angular/core';
import { AuthenticationService, ICurrentUser, ROLES } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  currentUser!: ICurrentUser;
  hasGIS = false;
  hasCommissioner = false;
  hasOtherRole = false;

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()!;

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
      }
    });
  }
}
