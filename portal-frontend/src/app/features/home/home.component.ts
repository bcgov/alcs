import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public name = '';

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    const user = this.authenticationService.currentUser;
    if (user) {
      this.name = user.name;
    }
  }
}
