import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationReviewService } from '../../services/application-review/application-review.service';
import { APPLICATION_STATUS, ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-view-application',
  templateUrl: './view-application.component.html',
  styleUrls: ['./view-application.component.scss'],
})
export class ViewApplicationComponent implements OnInit, OnDestroy {
  application: ApplicationDto | undefined;

  $destroy = new Subject<void>();

  constructor(
    private applicationService: ApplicationService,
    private applicationReviewService: ApplicationReviewService,
    private confirmationDialogService: ConfirmationDialogService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((routeParams) => {
      const fileId = routeParams.get('fileId');
      if (fileId) {
        this.loadApplication(fileId);
      }
    });
  }

  async loadApplication(fileId: string) {
    this.application = await this.applicationService.getByFileId(fileId);
  }

  onCancel(fileId: string) {
    const dialog = this.confirmationDialogService.openDialog({
      body: 'Are you sure you want to cancel your application? A cancelled application cannot be edited or submitted to the ALC. This cannot be undone.',
      confirmAction: 'Confirm',
      cancelAction: 'Return',
    });

    dialog.subscribe(async (isConfirmed) => {
      if (isConfirmed) {
        await this.applicationService.cancel(fileId);
      }
    });
  }

  async onReview(fileId: string) {
    if (this.application?.status.code === APPLICATION_STATUS.SUBMITTED_TO_LG) {
      const review = await this.applicationReviewService.startReview(fileId);
      if (review) {
        await this.router.navigateByUrl(`application/${fileId}/review`);
      }
    } else {
      await this.router.navigateByUrl(`application/${fileId}/review`);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
