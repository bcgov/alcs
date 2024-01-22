import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { ApplicationTypeDto, LocalGovernmentDto } from '../../../../services/code/code.dto';
import { CodeService } from '../../../../services/code/code.service';
import { OverlaySpinnerService } from '../../../../shared/overlay-spinner/overlay-spinner.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  localGovernmentName = '';
  fileId = '';
  appLabel = '';
  didAuthorize = false;
  private localGovernments: LocalGovernmentDto[] = [];
  private localGovernmentUuid: string | undefined;

  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationReviewService: ApplicationSubmissionReviewService,
    private activatedRoute: ActivatedRoute,
    private overlayService: OverlaySpinnerService,
    private codeService: CodeService
  ) {}

  ngOnInit() {
    this.loadCodes();
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      const fileId = paramMap.get('fileId');
      if (fileId) {
        this.loadApplication(fileId);
      }
    });

    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this.didAuthorize = applicationReview.isAuthorized ?? true;
      }
    });
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private async loadApplication(fileId: string) {
    this.overlayService.showSpinner();
    const appSubmission = await this.applicationSubmissionService.getByFileId(fileId);
    if (appSubmission) {
      this.fileId = fileId;
      this.applicationReviewService.getByFileId(fileId);
      this.appLabel = appSubmission.type;
      this.localGovernmentUuid = appSubmission.localGovernmentUuid;
      this.populateLocalGovernment(appSubmission.localGovernmentUuid);
    }
    this.overlayService.hideSpinner();
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.localGovernmentUuid) {
      this.populateLocalGovernment(this.localGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernmentName = lg.name;
    }
  }
}
