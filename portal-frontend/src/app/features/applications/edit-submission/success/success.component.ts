import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
  governmentFee?: number | null;
  alcFee?: number | null;
  requiresGovernmentReview = false;
  private localGovernments: LocalGovernmentDto[] = [];
  private localGovernmentUuid: string | undefined;
  private applicationTypes: ApplicationTypeDto[] = [];
  private appType: string | undefined;

  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
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
      this.appType = appSubmission.typeCode;
      this.appLabel = appSubmission.type;
      this.localGovernmentUuid = appSubmission.localGovernmentUuid;
      this.populateLocalGovernment(appSubmission.localGovernmentUuid);
      this.populateFees(appSubmission.typeCode);
      this.requiresGovernmentReview = appSubmission.requiresGovernmentReview;
    }
    this.overlayService.hideSpinner();
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.applicationTypes = codes.applicationTypes.filter((type) => !!type.portalLabel);
    if (this.localGovernmentUuid) {
      this.populateLocalGovernment(this.localGovernmentUuid);
    }
    if (this.appType) {
      this.populateFees(this.appType);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernmentName = lg.name;
    }
  }

  private populateFees(typeCode: string) {
    const appType = this.applicationTypes.find((type) => type.code === typeCode);
    if (appType) {
      this.governmentFee = appType.governmentFeeAmount;
      this.alcFee = appType.alcFeeAmount;
    }
  }
}
