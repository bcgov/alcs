import { Component, OnInit } from '@angular/core';
import { AuthenticationService, ICurrentUser } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  currentUser!: ICurrentUser;
  hasGIS = false;

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()!;

    this.hasGIS = this.currentUser.client_roles ? this.currentUser.client_roles.includes('GIS') : false;

    this.authService.$currentUser.subscribe((currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;
      }
    });
  }
}
