import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { CreateApplicationDialogComponent } from '../create-application-dialog/create-application-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public name = '';
  public isLearnMoreOpen = false;

  constructor(private authenticationService: AuthenticationService, private dialog: MatDialog) {}

  ngOnInit(): void {
    const user = this.authenticationService.currentUser;
    if (user) {
      this.name = user.name;
    }
  }

  async onCreateApplication() {
    this.dialog.open(CreateApplicationDialogComponent);
  }

  onLearnMoreClick() {
    this.isLearnMoreOpen = !this.isLearnMoreOpen;
  }
}
