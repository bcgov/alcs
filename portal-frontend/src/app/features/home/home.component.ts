import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { UserDto } from '../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { CreateSubmissionDialogComponent } from '../create-submission-dialog/create-submission-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  public isLearnMoreOpen = false;
  profile: UserDto | undefined;

  constructor(private authenticationService: AuthenticationService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.authenticationService.$currentProfile.pipe(takeUntil(this.$destroy)).subscribe((profile) => {
      this.profile = profile;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
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
