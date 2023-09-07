import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { PARCEL_TYPE } from '../../../services/application-parcel/application-parcel.dto';
import { LocalGovernmentDto } from '../../../services/code/code.dto';
import { CodeService } from '../../../services/code/code.service';
import { NotificationDocumentDto } from '../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../services/notification-document/notification-document.service';
import { NotificationSubmissionDetailedDto } from '../../../services/notification-submission/notification-submission.dto';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../shared/dto/document.dto';
import { OWNER_TYPE } from '../../../shared/dto/owner.dto';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss'],
})
export class NotificationDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() $notificationSubmission!: BehaviorSubject<NotificationSubmissionDetailedDto | undefined>;
  @Input() $notificationDocuments!: BehaviorSubject<NotificationDocumentDto[]>;
  @Input() showErrors = true;
  @Input() showEdit = true;

  parcelType = PARCEL_TYPE;
  notificationSubmission: NotificationSubmissionDetailedDto | undefined;
  localGovernment: LocalGovernmentDto | undefined;
  otherFiles: NotificationDocumentDto[] = [];
  notificationDocuments: NotificationDocumentDto[] = [];
  OWNER_TYPE = OWNER_TYPE;

  private localGovernments: LocalGovernmentDto[] = [];
  private otherFileTypes = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

  constructor(
    private codeService: CodeService,
    private notificationDocumentService: NotificationDocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGovernments();
    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((notificationSubmission) => {
      this.notificationSubmission = notificationSubmission;
      if (notificationSubmission) {
        this.populateLocalGovernment(notificationSubmission.localGovernmentUuid);
      }
    });

    this.$notificationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.otherFiles = documents
        .filter((file) => (file.type ? this.otherFileTypes.includes(file.type.code) : true))
        .filter((file) => file.source === DOCUMENT_SOURCE.APPLICANT)
        .sort((a, b) => {
          return a.uploadedAt - b.uploadedAt;
        });

      this.notificationDocuments = documents;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async openFile(uuid: string) {
    const res = await this.notificationDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }

  async onNavigateToStep(step: number) {
    await this.router.navigateByUrl(`notification/${this.notificationSubmission?.fileNumber}/edit/${step}?errors=t`);
  }

  private async loadGovernments() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.notificationSubmission?.localGovernmentUuid) {
      this.populateLocalGovernment(this.notificationSubmission?.localGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernment = lg;
    }
  }
}
