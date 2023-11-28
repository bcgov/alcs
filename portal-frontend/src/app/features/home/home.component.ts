import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { UserDto } from '../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { MOBILE_BREAKPOINT } from '../../shared/utils/breakpoints';
import { CreateSubmissionDialogComponent } from '../create-submission-dialog/create-submission-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  currentTabName: string = '';

  $destroy = new Subject<void>();
  isMobile = false;
  profile: UserDto | undefined;

  constructor(
    private authenticationService: AuthenticationService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.currentTabName = params['submissionType'];
    });

    this.authenticationService.$currentProfile.pipe(takeUntil(this.$destroy)).subscribe((profile) => {
      this.profile = profile;
    });
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onCreateSubmission() {
    this.dialog.open(CreateSubmissionDialogComponent, {
      panelClass: 'no-padding',
      disableClose: true,
      autoFocus: false,
    });
  }
}
