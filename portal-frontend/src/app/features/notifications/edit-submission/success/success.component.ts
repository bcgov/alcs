import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentTypeDto } from '../../../../services/code/code.dto';
import { CodeService } from '../../../../services/code/code.service';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';
import { OverlaySpinnerService } from '../../../../shared/overlay-spinner/overlay-spinner.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  fileId = '';
  appLabel = '';
  alcFee?: number | null;
  private noiTypes: NoticeOfIntentTypeDto[] = [];
  private appType: string | undefined;

  constructor(
    private notificationSubmissionService: NotificationSubmissionService,
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
    const notiSubmission = await this.notificationSubmissionService.getByFileId(fileId);
    if (notiSubmission) {
      this.fileId = fileId;
      this.appType = notiSubmission.typeCode;
      this.appLabel = notiSubmission.type;
      this.populateFees(notiSubmission.typeCode);
    }
    this.overlayService.hideSpinner();
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.noiTypes = codes.noticeOfIntentTypes.filter((type) => !!type.portalLabel);
    if (this.appType) {
      this.populateFees(this.appType);
    }
  }

  private populateFees(typeCode: string) {
    const appType = this.noiTypes.find((type) => type.code === typeCode);
    if (appType) {
      this.alcFee = appType.alcFeeAmount;
    }
  }
}
