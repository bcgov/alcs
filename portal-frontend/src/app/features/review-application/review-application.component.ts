import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationReviewService } from '../../services/application-review/application-review.service';
import { DOCUMENT, ApplicationDocumentDto, ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ChangeApplicationTypeDialogComponent } from '../edit-application/change-application-type-dialog/change-application-type-dialog.component';
import { ReturnApplicationDialogComponent } from './return-application-dialog/return-application-dialog.component';

@Component({
  selector: 'app-review-application',
  templateUrl: './review-application.component.html',
  styleUrls: ['./review-application.component.scss'],
})
export class ReviewApplicationComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  application: ApplicationDto | undefined;
  $application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

  isFirstNationGovernment = true;

  constructor(
    private applicationService: ApplicationService,
    private applicationReviewService: ApplicationReviewService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      const fileId = paramMap.get('fileId');
      if (fileId) {
        this.loadApplication(fileId);
        this.loadApplicationReview(fileId);
      }
    });
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      this.application = application;
    });
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((appReview) => {
      this.isFirstNationGovernment = appReview?.isFirstNationGovernment ?? false;
    });
  }

  async loadApplicationReview(fileId: string) {
    await this.applicationReviewService.getByFileId(fileId);
  }

  async loadApplication(fileId: string) {
    const application = await this.applicationService.getByFileId(fileId);
    this.$application.next(application);
  }

  onReturnApplication() {
    this.dialog
      .open(ReturnApplicationDialogComponent, {
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          fileId: this.application?.fileNumber,
        },
      })
      .beforeClosed()
      .subscribe((result: boolean) => {
        if (result) {
          this.router.navigateByUrl('/home');
        }
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
