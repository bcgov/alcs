import { Component, OnInit } from '@angular/core';
import { AuthenticationService, ICurrentUser, ROLES } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  currentUser!: ICurrentUser;
  isOnlyGIS = false;
  isOnlyCommissioner = false;

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()!;

    this.authService.$currentUser.subscribe((currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;

        this.isOnlyGIS =
          currentUser.client_roles && currentUser.client_roles.length === 1
            ? currentUser.client_roles.includes(ROLES.GIS)
            : false;

        this.isOnlyCommissioner =
          currentUser.client_roles && currentUser.client_roles.length === 1
            ? currentUser.client_roles.includes(ROLES.COMMISSIONER)
            : false;
      }
    });
  }
}
