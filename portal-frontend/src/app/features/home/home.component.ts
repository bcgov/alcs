import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { CreateSubmissionDialogComponent } from '../create-submission-dialog/create-submission-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public name = '';
  public isLearnMoreOpen = false;

  constructor(
    private authenticationService: AuthenticationService,
    private dialog: MatDialog,
    private spinnerService: OverlaySpinnerService
  ) {}

  ngOnInit(): void {
    const user = this.authenticationService.currentUser;
    if (user) {
      this.name = user.name;
    }
  }

  async onCreateApplication() {
    this.dialog.open(CreateSubmissionDialogComponent, {
      panelClass: 'no-padding',
      disableClose: true,
      autoFocus: false,
    });
  }

  onLearnMoreClick() {
    this.isLearnMoreOpen = !this.isLearnMoreOpen;
  }
}
